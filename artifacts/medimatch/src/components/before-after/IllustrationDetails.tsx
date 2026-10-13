import { ArrowRight, Info } from "lucide-react";
import { HomeLink } from "@/components/home/HomeLink";
import {
  illustrationDisclosure,
  type Illustration,
} from "@/lib/illustrations";
import { bookingHref, treatmentBySlug, type CareTreatmentSlug } from "@/lib/treatments";

type Tone = "orange" | "green" | "red" | "yellow" | "blue";

/** Same colour per treatment as the homepage treatment cards. */
const treatmentTones: Partial<Record<CareTreatmentSlug, Tone>> = {
  dental: "orange",
  "hair-restoration": "green",
  "skin-aesthetics": "red",
  orthopaedics: "yellow",
  "womens-health": "blue",
};

export function treatmentTone(treatment: CareTreatmentSlug): Tone {
  return treatmentTones[treatment] ?? "blue";
}

/** Opens the existing booking flow with the treatment preselected and the illustration noted. */
export function askHref(illustration: Illustration) {
  return bookingHref({ treatment: illustration.treatment, illustration: illustration.slug });
}

export function IllustrationTags({ illustration }: { illustration: Illustration }) {
  const treatment = treatmentBySlug(illustration.treatment);
  return (
    <ul className="mmba-tags">
      <li className={`mmba-tag mmba-tag--${treatmentTone(illustration.treatment)}`}>
        {treatment?.name}
      </li>
      {illustration.kind === "anatomical" && (
        <li className="mmba-tag mmba-tag--plain">Anatomical model</li>
      )}
      {illustration.clinicalReview === "pending" && (
        <li className="mmba-tag mmba-tag--review">Awaiting clinical review</li>
      )}
    </ul>
  );
}

export function IllustrationDisclosure() {
  return (
    <p className="mmba-disclosure">
      <Info size={16} aria-hidden="true" />
      <span>{illustrationDisclosure}</span>
    </p>
  );
}

type AskLinkProps = {
  illustration: Illustration;
  testId: string;
  onClick?: () => void;
};

export function AskAboutTreatment({ illustration, testId, onClick }: AskLinkProps) {
  return (
    <HomeLink
      className="mmh-btn mmh-btn--orange mmba-ask"
      href={askHref(illustration)}
      onClick={onClick}
      data-testid={testId}
    >
      Ask about this treatment
      <span className="mmh-visually-hidden">: {illustration.title}</span>
      <ArrowRight size={16} aria-hidden="true" />
    </HomeLink>
  );
}
