import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { ChevronsLeftRight, Columns2 } from "lucide-react";
import {
  illustrationImage,
  illustrationWidths,
  type Illustration,
} from "@/lib/illustrations";

export type CompareMode = "slider" | "side";

type Stage = "before" | "after";

type ImageProps = {
  illustration: Illustration;
  sizes: string;
  eager?: boolean;
};

/** Distance a finger must travel before the slider decides between dragging and scrolling. */
const DRAG_THRESHOLD = 6;

const KEY_STEPS: Record<string, number> = {
  ArrowLeft: -5,
  ArrowDown: -5,
  ArrowRight: 5,
  ArrowUp: 5,
  PageDown: -20,
  PageUp: 20,
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

function IllustrationImage({ illustration, sizes, eager, stage }: ImageProps & { stage: Stage }) {
  const image = illustrationImage(illustration.slug, stage);
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={illustrationWidths.small}
      height={illustrationWidths.small}
      alt={stage === "before" ? illustration.beforeAlt : illustration.afterAlt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}

/**
 * Before image laid over the after image, cut at a draggable divider.
 * Mouse: press and drag anywhere. Touch: a sideways swipe drags, a vertical
 * swipe scrolls the page, a tap moves the divider. Keyboard: the handle is a
 * slider (arrows, Page Up/Down, Home/End).
 */
function CompareSlider({ illustration, sizes, eager, testId }: ImageProps & { testId: string }) {
  const [position, setPosition] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);

  const moveTo = (clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    setPosition(clampPercent(((clientX - rect.left) / rect.width) * 100));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
    if (event.pointerType !== "mouse") return;
    gesture.current.dragging = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    handleRef.current?.focus({ preventScroll: true });
    moveTo(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.dragging) {
      const dx = Math.abs(event.clientX - current.x);
      const dy = Math.abs(event.clientY - current.y);
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      if (dy >= dx) {
        // Mostly vertical: leave the gesture to the page so it scrolls.
        gesture.current = null;
        return;
      }
      current.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    moveTo(event.clientX);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.dragging) moveTo(event.clientX);
    gesture.current = null;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key in KEY_STEPS) next = Math.round(position) + KEY_STEPS[event.key];
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 100;
    if (next === null) return;
    event.preventDefault();
    setPosition(clampPercent(next));
  };

  const rounded = Math.round(position);
  const style = { "--mmba-position": `${position}%` } as CSSProperties;

  return (
    <div
      ref={frameRef}
      className="mmba-compare"
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        gesture.current = null;
      }}
      // Keeps a mouse press from selecting text or moving focus off the handle.
      onMouseDown={(event) => event.preventDefault()}
      data-testid={testId}
    >
      <div className="mmba-compare__layer">
        <IllustrationImage illustration={illustration} sizes={sizes} eager={eager} stage="after" />
      </div>
      <div className="mmba-compare__layer mmba-compare__layer--before">
        <IllustrationImage illustration={illustration} sizes={sizes} eager={eager} stage="before" />
      </div>
      <span
        className={rounded < 16 ? "mmba-label mmba-label--before is-hidden" : "mmba-label mmba-label--before"}
        aria-hidden="true"
      >
        Before
      </span>
      <span
        className={rounded > 84 ? "mmba-label mmba-label--after is-hidden" : "mmba-label mmba-label--after"}
        aria-hidden="true"
      >
        After
      </span>
      <div className="mmba-compare__divider" aria-hidden="true" />
      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        className="mmba-compare__handle"
        aria-label={`Compare before and after: ${illustration.title}`}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={`Before ${rounded}%, after ${100 - rounded}%`}
        onKeyDown={onKeyDown}
        data-testid={`${testId}-handle`}
      >
        <ChevronsLeftRight size={22} aria-hidden="true" />
      </div>
    </div>
  );
}

function SideBySide({ illustration, sizes, eager, testId }: ImageProps & { testId: string }) {
  return (
    <div className="mmba-side" data-testid={testId}>
      {(["before", "after"] as const).map((stage) => (
        <figure key={stage} className="mmba-side__item">
          <IllustrationImage illustration={illustration} sizes={sizes} eager={eager} stage={stage} />
          <figcaption className={`mmba-label mmba-label--${stage}`}>
            {stage === "before" ? "Before" : "After"}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

type CompareViewProps = {
  illustration: Illustration;
  mode: CompareMode;
  /** `sizes` for the full-width slider image. */
  sliderSizes: string;
  /** `sizes` for each half of the side-by-side view. */
  sideSizes: string;
  eager?: boolean;
  testId: string;
};

export function CompareView({ mode, sliderSizes, sideSizes, testId, ...rest }: CompareViewProps) {
  return mode === "side" ? (
    <SideBySide sizes={sideSizes} testId={`${testId}-side`} {...rest} />
  ) : (
    <CompareSlider sizes={sliderSizes} testId={`${testId}-slider`} {...rest} />
  );
}

type ModeToggleProps = {
  mode: CompareMode;
  onChange: (mode: CompareMode) => void;
  testIdPrefix: string;
};

export function CompareModeToggle({ mode, onChange, testIdPrefix }: ModeToggleProps) {
  return (
    <div className="mmba-mode" role="group" aria-label="Comparison view">
      <button
        type="button"
        aria-pressed={mode === "slider"}
        onClick={() => onChange("slider")}
        data-testid={`${testIdPrefix}-mode-slider`}
      >
        <ChevronsLeftRight size={16} aria-hidden="true" /> Slider
      </button>
      <button
        type="button"
        aria-pressed={mode === "side"}
        onClick={() => onChange("side")}
        data-testid={`${testIdPrefix}-mode-side`}
      >
        <Columns2 size={16} aria-hidden="true" /> Side by side
      </button>
    </div>
  );
}
