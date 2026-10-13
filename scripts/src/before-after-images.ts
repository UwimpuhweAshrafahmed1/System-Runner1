/**
 * Builds the Before & After gallery images for the MediMATCH web app.
 *
 * Input: 1024×1024 PNG renders in generated-artifacts/before-after/raw/
 * named <slug>-before.png and <slug>-after.png. The raw renders are large and
 * stay out of git; keep them if the images may need relabelling after
 * clinical review.
 *
 * For every image this script:
 *  - draws the anatomical labels (knee, hip and uterus models only),
 *  - burns in the "3D illustration / Not a real patient" label (bottom left on
 *    "before", bottom right on "after", so both show with the slider centred),
 *  - strips all metadata and writes WebP files at 600 and 1024 pixels to
 *    artifacts/medimatch/public/medimatch/before-after/.
 *
 * Needs ImageMagick 7 (`magick`) and the DejaVu fonts.
 * Run: pnpm --filter @workspace/scripts run before-after-images
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const rawDir = path.join(root, "generated-artifacts/before-after/raw");
const outDir = path.join(root, "artifacts/medimatch/public/medimatch/before-after");

const fonts = {
  bold: "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  regular: "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
};
const navy = "#072f69";
const widths = [600, 1024];
const webpQuality = "80";

const slugs = [
  "dental-shade",
  "dental-implant",
  "dental-alignment",
  "hair-hairline",
  "hair-crown",
  "hair-part",
  "skin-acne-scars",
  "skin-forehead-lines",
  "skin-chin-fullness",
  "ortho-knee",
  "ortho-hip",
  "womens-fibroids",
];

type Stage = "before" | "after";
type Point = [number, number];
type Label = {
  text: string;
  /** Top-left corner of the label box, or its top-right corner when `align` is "right". */
  at: Point;
  align?: "left" | "right";
  /** Points on the anatomy that the label's leader lines run to. */
  points: Point[];
};

// Positions are in the 1024×1024 source images and were set by eye against them.
const femur: Label = { text: "Thigh bone (femur)", at: [40, 90], points: [[420, 140]] };
const tibia: Label = { text: "Shin bone (tibia)", at: [1000, 800], align: "right", points: [[600, 830]] };
const uterus: Label = { text: "Uterus", at: [210, 640], points: [[436, 650]] };

const anatomyLabels: Record<string, Partial<Record<Stage, Label[]>>> = {
  "ortho-knee": {
    before: [
      femur,
      { text: "Worn cartilage", at: [40, 250], points: [[372, 395]] },
      { text: "Bone spur", at: [1000, 190], align: "right", points: [[790, 300]] },
      tibia,
    ],
    after: [
      femur,
      { text: "Metal implant", at: [40, 250], points: [[370, 345]] },
      { text: "Plastic spacer", at: [40, 465], points: [[312, 548]] },
      { text: "Metal tray", at: [40, 600], points: [[300, 585]] },
      tibia,
    ],
  },
  "ortho-hip": {
    before: [
      { text: "Hip socket", at: [700, 150], points: [[592, 290]] },
      { text: "Worn cartilage", at: [690, 335], points: [[565, 430]] },
      { text: "Thigh bone\n(femur)", at: [372, 845], points: [[650, 890]] },
    ],
    after: [
      { text: "Implant cup", at: [700, 150], points: [[585, 300]] },
      { text: "Implant ball", at: [690, 335], points: [[598, 420]] },
      { text: "Implant stem", at: [340, 762], points: [[700, 760]] },
    ],
  },
  "womens-fibroids": {
    before: [
      { text: "Fibroids", at: [306, 110], points: [[590, 212], [428, 450], [556, 440]] },
      uterus,
    ],
    after: [{ text: "Fibroids removed", at: [306, 110], points: [[434, 450], [588, 440]] }, uterus],
  },
};

const magick = (args: string[]) => execFileSync("magick", args, { encoding: "utf8" });

function textSize(text: string, font: string, size: number): Point {
  const [width, height] = magick(["-font", font, "-pointsize", String(size), `label:${text}`, "-format", "%w %h", "info:"])
    .trim()
    .split(" ")
    .map(Number);
  return [width, height];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** ImageMagick -draw arguments for one label: leader lines, end dots, box and text. */
function labelDrawArgs(label: Label): string[] {
  const fontSize = 24;
  const padX = 10;
  const padY = 7;
  const [textWidth, textHeight] = textSize(label.text, fonts.bold, fontSize);
  const boxWidth = textWidth + padX * 2;
  const boxHeight = textHeight + padY * 2;
  const x0 = label.align === "right" ? label.at[0] - boxWidth : label.at[0];
  const y0 = label.at[1];
  const x1 = x0 + boxWidth;
  const y1 = y0 + boxHeight;

  const lines = label.points.map(([px, py]) => {
    const start: Point = [clamp(px, x0, x1), clamp(py, y0, y1)];
    return { start, end: [px, py] as Point };
  });
  const args: string[] = [];
  // White casing under each navy line keeps it visible on light and dark areas.
  for (const [colour, width] of [["white", 6], [navy, 2.5]] as const) {
    args.push("-fill", "none", "-stroke", colour, "-strokewidth", String(width));
    for (const { start, end } of lines) args.push("-draw", `line ${start.join(",")} ${end.join(",")}`);
  }
  args.push("-stroke", "white", "-strokewidth", "2.5", "-fill", navy);
  for (const { end } of lines) args.push("-draw", `circle ${end.join(",")} ${end[0] + 6},${end[1]}`);
  args.push(
    "-fill", "rgba(255,255,255,0.95)",
    "-stroke", navy,
    "-strokewidth", "2",
    "-draw", `roundrectangle ${x0},${y0} ${x1},${y1} 10,10`,
    "-stroke", "none",
    "-fill", navy,
    "-font", fonts.bold,
    "-pointsize", String(fontSize),
    "-gravity", "NorthWest",
    "-annotate", `+${x0 + padX}+${y0 + padY}`, label.text,
  );
  return args;
}

/** Navy two-line "3D illustration / Not a real patient" badge with a white edge. */
function buildDisclosureBadge(workDir: string) {
  const text = path.join(workDir, "badge-text.png");
  const badge = path.join(workDir, "badge.png");
  magick([
    "-background", "none", "-fill", "white",
    "(", "-font", fonts.bold, "-pointsize", "24", "label:3D illustration", ")",
    "(", "-font", fonts.regular, "-pointsize", "20", "label:Not a real patient", "-gravity", "North", "-splice", "0x3", ")",
    "-gravity", "West", "-append", text,
  ]);
  const [width, height] = magick([text, "-format", "%w %h", "info:"]).trim().split(" ").map(Number);
  const badgeWidth = width + 32;
  const badgeHeight = height + 20;
  magick([
    "-size", `${badgeWidth}x${badgeHeight}`, "xc:none",
    "-fill", "rgba(7,47,105,0.92)", "-stroke", "white", "-strokewidth", "2",
    "-draw", `roundrectangle 1,1 ${badgeWidth - 2},${badgeHeight - 2} 12,12`,
    text, "-gravity", "Center", "-composite", badge,
  ]);
  return badge;
}

function main() {
  mkdirSync(outDir, { recursive: true });
  const workDir = mkdtempSync(path.join(tmpdir(), "before-after-"));
  try {
    const badge = buildDisclosureBadge(workDir);
    for (const slug of slugs) {
      for (const stage of ["before", "after"] as const) {
        const source = path.join(rawDir, `${slug}-${stage}.png`);
        const labelled = path.join(workDir, `${slug}-${stage}.png`);
        const labels = anatomyLabels[slug]?.[stage] ?? [];
        magick([
          source,
          "-resize", "1024x1024!",
          ...labels.flatMap(labelDrawArgs),
          badge,
          "-gravity", stage === "before" ? "SouthWest" : "SouthEast",
          "-geometry", "+24+24",
          "-composite",
          "-strip",
          labelled,
        ]);
        for (const width of widths) {
          const target = path.join(outDir, `${slug}-${stage}-${width}.webp`);
          magick([labelled, "-filter", "Lanczos", "-resize", `${width}x${width}`, "-strip", "-quality", webpQuality, target]);
          console.log(path.relative(root, target));
        }
      }
    }
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main();
