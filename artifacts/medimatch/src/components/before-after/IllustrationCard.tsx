import { Maximize2 } from "lucide-react";
import type { Illustration } from "@/lib/illustrations";
import { CompareView, type CompareMode } from "./CompareView";
import {
  AskAboutTreatment,
  IllustrationDisclosure,
  IllustrationTags,
} from "./IllustrationDetails";

type IllustrationCardProps = {
  illustration: Illustration;
  mode: CompareMode;
  onEnlarge: (illustration: Illustration, trigger: HTMLButtonElement) => void;
};

/** Card widths: three columns beside the topic list, two on tablets, one on phones. */
const SLIDER_SIZES = "(min-width: 1200px) 330px, (min-width: 700px) 46vw, calc(100vw - 40px)";
const SIDE_SIZES = "(min-width: 1200px) 165px, (min-width: 700px) 23vw, calc(50vw - 22px)";

export function IllustrationCard({ illustration, mode, onEnlarge }: IllustrationCardProps) {
  const titleId = `ba-${illustration.slug}-title`;
  return (
    <article
      id={`ba-${illustration.slug}`}
      className="mmba-card"
      aria-labelledby={titleId}
      data-testid={`card-illustration-${illustration.slug}`}
    >
      <div className={`mmba-card__media mmba-media--${mode}`}>
        <CompareView
          illustration={illustration}
          mode={mode}
          sliderSizes={SLIDER_SIZES}
          sideSizes={SIDE_SIZES}
          testId={`compare-${illustration.slug}`}
        />
      </div>
      <div className="mmba-card__body">
        <IllustrationTags illustration={illustration} />
        <h3 id={titleId}>{illustration.title}</h3>
        <p className="mmba-card__summary">{illustration.summary}</p>
        <IllustrationDisclosure />
        <div className="mmba-card__actions">
          <AskAboutTreatment
            illustration={illustration}
            testId={`link-ask-${illustration.slug}`}
          />
          <button
            type="button"
            className="mmba-enlarge"
            onClick={(event) => onEnlarge(illustration, event.currentTarget)}
            aria-haspopup="dialog"
            data-testid={`button-enlarge-${illustration.slug}`}
          >
            <Maximize2 size={16} aria-hidden="true" />
            View larger<span className="mmh-visually-hidden">: {illustration.title}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
