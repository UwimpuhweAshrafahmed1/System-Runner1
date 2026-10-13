/**
 * The care requests a patient can choose on the booking page. The homepage
 * links into the same list, so a treatment chosen there arrives preselected.
 */
export const careTreatments = [
  { slug: "general", name: "General consultation" },
  { slug: "dental", name: "Dental treatment" },
  { slug: "hair-restoration", name: "Hair restoration" },
  { slug: "skin-aesthetics", name: "Skin and aesthetics" },
  { slug: "orthopaedics", name: "Orthopaedic care" },
  { slug: "womens-health", name: "Women’s health" },
  { slug: "second-opinion", name: "Second opinion" },
] as const;

export type CareTreatmentSlug = (typeof careTreatments)[number]["slug"];

export function treatmentBySlug(slug: string | null | undefined) {
  return careTreatments.find((treatment) => treatment.slug === slug);
}

/** Longest destination or language text carried from the homepage into a request. */
export const carePreferenceMaxLength = 80;

type BookingLinkOptions = {
  treatment?: CareTreatmentSlug;
  destination?: string;
  language?: string;
};

/** Builds a link to the booking page that carries the visitor's choices. */
export function bookingHref({ treatment, destination, language }: BookingLinkOptions = {}) {
  const params = new URLSearchParams();
  if (treatment) params.set("treatment", treatment);
  const cleanDestination = destination?.trim().slice(0, carePreferenceMaxLength);
  const cleanLanguage = language?.trim().slice(0, carePreferenceMaxLength);
  if (cleanDestination) params.set("destination", cleanDestination);
  if (cleanLanguage) params.set("language", cleanLanguage);
  const query = params.toString();
  return query ? `/appointments?${query}` : "/appointments";
}

/** Turns destination and language preferences into a note for the care coordinator. */
export function carePreferencesNote(params: URLSearchParams) {
  const destination = params.get("destination")?.trim().slice(0, carePreferenceMaxLength);
  const language = params.get("language")?.trim().slice(0, carePreferenceMaxLength);
  return [
    destination ? `Preferred destination: ${destination}` : null,
    language ? `Preferred language: ${language}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
