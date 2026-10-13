import { assetUrl } from "@/lib/account";
import { careTreatments, type CareTreatmentSlug } from "@/lib/treatments";

/**
 * Before & After treatment illustrations.
 *
 * Every image is an original, computer-generated 3D illustration of a fictional
 * adult (or an anatomical model). None shows a real patient or a MediMATCH
 * clinical result. Each image file has a "3D illustration" label burned in, so
 * the context stays with the picture when it is saved or shared.
 *
 * Clinical review: an illustration appears on the published site only after a
 * clinician has checked the image and its wording and its `clinicalReview` is
 * set to "approved". In the development preview every illustration is shown,
 * with an "Awaiting clinical review" tag on the ones still pending.
 */

export type ClinicalReview = "pending" | "approved";

export type Illustration = {
  slug: string;
  treatment: CareTreatmentSlug;
  title: string;
  /** Short factual description. No outcome promises, recovery times or clinical claims. */
  summary: string;
  /** "anatomical" is used where the change cannot be shown honestly from the outside. */
  kind: "appearance" | "anatomical";
  beforeAlt: string;
  afterAlt: string;
  clinicalReview: ClinicalReview;
};

export const illustrationDisclosure = "3D illustration — not a real patient. Treatment outcomes vary.";

const altPrefix = "3D illustration, not a real patient.";

export const illustrations: Illustration[] = [
  {
    slug: "dental-shade",
    treatment: "dental",
    title: "Tooth shade and a chipped edge",
    summary:
      "Stained front teeth with a chipped edge, then the same smile with a more even shade and a rebuilt edge. Whitening and tooth-coloured bonding are options a dentist may discuss for changes like this.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: close-up of a fictional woman's smile with stained front teeth and a chipped edge on an upper tooth.`,
    afterAlt: `${altPrefix} After: the same smile with a more even tooth shade and the chipped edge rebuilt.`,
    clinicalReview: "pending",
  },
  {
    slug: "dental-implant",
    treatment: "dental",
    title: "Replacing a missing tooth",
    summary:
      "A gap left by a missing upper tooth, then the same smile with a replacement tooth filling the gap. Implants and bridges are two ways a dentist may suggest replacing a tooth.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: close-up of a fictional man's smile with a gap where an upper tooth is missing.`,
    afterAlt: `${altPrefix} After: the same smile with a replacement tooth filling the gap.`,
    clinicalReview: "pending",
  },
  {
    slug: "dental-alignment",
    treatment: "dental",
    title: "Straightening crowded teeth",
    summary:
      "Crowded, overlapping front teeth, then the same smile with the teeth sitting more evenly. Braces and clear aligners are orthodontic options for crowding.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: close-up of a fictional woman's smile with crowded, overlapping front teeth.`,
    afterAlt: `${altPrefix} After: the same smile with the front teeth lined up more evenly.`,
    clinicalReview: "pending",
  },
  {
    slug: "hair-hairline",
    treatment: "hair-restoration",
    title: "Receding hairline",
    summary:
      "A hairline that has receded at the temples, then the same hairline with fuller temple corners at a natural height. This is the kind of change a hair transplant aims for.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: front view of a fictional man whose hairline has receded at both temples.`,
    afterAlt: `${altPrefix} After: the same man with fuller hair at the temple corners.`,
    clinicalReview: "pending",
  },
  {
    slug: "hair-crown",
    treatment: "hair-restoration",
    title: "Thinning at the crown",
    summary:
      "Thinning hair with scalp showing at the crown, then the same view with denser coverage. A hair restoration specialist can explain which options suit thinning at the crown.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: view from above of a fictional man's head with thinning grey hair and scalp showing at the crown.`,
    afterAlt: `${altPrefix} After: the same view with denser hair covering the crown.`,
    clinicalReview: "pending",
  },
  {
    slug: "hair-part",
    treatment: "hair-restoration",
    title: "Widening part line",
    summary:
      "A centre part that has widened as the hair thins, then the same part with denser hair along it. Hair thinning has several possible causes, so a specialist assessment comes first.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: view from above of a fictional woman's centre part, widened with scalp showing.`,
    afterAlt: `${altPrefix} After: the same centre part, narrower with denser hair along it.`,
    clinicalReview: "pending",
  },
  {
    slug: "skin-acne-scars",
    treatment: "skin-aesthetics",
    title: "Acne scarring",
    summary:
      "Healed acne scars that leave the cheek uneven, then the same cheek with softer, shallower scars. Only the skin texture changes; the skin tone stays the same.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: three-quarter view of a fictional man's cheek with healed acne scars.`,
    afterAlt: `${altPrefix} After: the same cheek with softer, shallower scars and the same skin tone.`,
    clinicalReview: "pending",
  },
  {
    slug: "skin-forehead-lines",
    treatment: "skin-aesthetics",
    title: "Forehead lines",
    summary:
      "Horizontal lines across the forehead at rest, then the same face with the lines softened but still visible.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: close-up of a fictional woman's forehead with horizontal lines at rest.`,
    afterAlt: `${altPrefix} After: the same forehead with the lines softened but still visible.`,
    clinicalReview: "pending",
  },
  {
    slug: "skin-chin-fullness",
    treatment: "skin-aesthetics",
    title: "Fullness under the chin",
    summary:
      "Soft fullness under the chin, then the same profile with a more defined angle between the jaw and the neck.",
    kind: "appearance",
    beforeAlt: `${altPrefix} Before: side profile of a fictional woman with soft fullness under the chin.`,
    afterAlt: `${altPrefix} After: the same profile with a more defined angle between the jaw and the neck.`,
    clinicalReview: "pending",
  },
  {
    slug: "ortho-knee",
    treatment: "orthopaedics",
    title: "Knee joint replacement",
    summary:
      "An anatomical view of a knee with worn cartilage and bone spurs from osteoarthritis, then the same knee with metal and plastic implant parts replacing the worn joint surfaces.",
    kind: "anatomical",
    beforeAlt: `${altPrefix} Before: labelled anatomical model of a knee joint with worn cartilage between the thigh bone and the shin bone.`,
    afterAlt: `${altPrefix} After: the same labelled knee joint with metal implant surfaces and a plastic spacer.`,
    clinicalReview: "pending",
  },
  {
    slug: "ortho-hip",
    treatment: "orthopaedics",
    title: "Hip joint replacement",
    summary:
      "An anatomical view of a hip with worn cartilage, then the same hip with an implant: a stem in the thigh bone, a ball, and a lined cup in the socket.",
    kind: "anatomical",
    beforeAlt: `${altPrefix} Before: labelled anatomical model of a hip joint with worn cartilage between the ball and the socket.`,
    afterAlt: `${altPrefix} After: the same labelled hip joint with an implant stem, ball and socket cup.`,
    clinicalReview: "pending",
  },
  {
    slug: "womens-fibroids",
    treatment: "womens-health",
    title: "Uterine fibroids",
    summary:
      "An anatomical view of a uterus with fibroids (non-cancerous growths) in and on its wall, then the same uterus after the fibroids have been removed.",
    kind: "anatomical",
    beforeAlt: `${altPrefix} Before: labelled anatomical model of a uterus with three fibroids.`,
    afterAlt: `${altPrefix} After: the same labelled uterus with the fibroids removed.`,
    clinicalReview: "pending",
  },
];

/** Development preview shows everything; the published site shows approved illustrations only. */
const showUnreviewed = import.meta.env.DEV;

export const visibleIllustrations = illustrations.filter(
  (illustration) => showUnreviewed || illustration.clinicalReview === "approved",
);

/** The gallery page and its navigation links exist only when there is something to show. */
export const galleryAvailable = visibleIllustrations.length > 0;

export const galleryPath = "/before-after";

export function illustrationBySlug(slug: string | null | undefined) {
  return illustrations.find((illustration) => illustration.slug === slug);
}

/** Treatment categories that have at least one visible illustration, in booking-page order. */
export const illustrationCategories = careTreatments.filter((treatment) =>
  visibleIllustrations.some((illustration) => illustration.treatment === treatment.slug),
);

/** Every image is a square exported at two widths. */
export const illustrationWidths = { small: 600, large: 1024 } as const;

export function illustrationImage(slug: string, stage: "before" | "after") {
  const base = `medimatch/before-after/${slug}-${stage}`;
  const small = assetUrl(`${base}-${illustrationWidths.small}.webp`);
  const large = assetUrl(`${base}-${illustrationWidths.large}.webp`);
  return {
    src: small,
    srcSet: `${small} ${illustrationWidths.small}w, ${large} ${illustrationWidths.large}w`,
  };
}
