import type { ComponentType } from "react";
import {
  BedDouble,
  Bone,
  Building2,
  FileText,
  Heart,
  MessageSquareText,
  Phone,
  Plane,
  Sparkles,
  UserRound,
} from "lucide-react";
import { assetUrl } from "@/lib/account";
import { bookingHref } from "@/lib/treatments";
import { HairIcon, ToothIcon } from "./HomeIcons";

export type Tone = "orange" | "green" | "red" | "yellow";
type Icon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

/** Existing MediMATCH contact addresses. */
export const contactLinks = {
  general: "mailto:hello@medimatch.health",
  coordinator: "mailto:hello@medimatch.health?subject=Talk%20to%20a%20care%20coordinator",
  callback: "mailto:hello@medimatch.health?subject=Care%20navigation%20callback",
  support: "mailto:hello@medimatch.health?subject=Support",
  international: "mailto:international@medimatch.health",
  partners: "mailto:partners@medimatch.health",
} as const;

export const navLinks = {
  doctors: "/appointments?intent=doctor",
  howItWorks: "#how-it-works",
  about: "#about",
  contact: "#contact",
  treatments: "#treatments",
  planCare: "/appointments",
  signIn: "/login",
} as const;

/** Everything a patient can request on the booking page, for the Treatments menu. */
export const treatmentMenu = [
  { label: "Dental care", href: bookingHref({ treatment: "dental" }) },
  { label: "Hair restoration", href: bookingHref({ treatment: "hair-restoration" }) },
  { label: "Skin & aesthetics", href: bookingHref({ treatment: "skin-aesthetics" }) },
  { label: "Orthopedics", href: bookingHref({ treatment: "orthopaedics" }) },
  { label: "Women’s health", href: bookingHref({ treatment: "womens-health" }) },
  { label: "General consultation", href: bookingHref({ treatment: "general" }) },
  { label: "Second opinion", href: "/appointments?intent=second-opinion" },
];

export const quickActions: {
  title: string;
  copy: string;
  href: string;
  icon: Icon;
  tone: Tone;
}[] = [
  {
    title: "Find a doctor",
    copy: "Compare care teams by specialty and language",
    href: navLinks.doctors,
    icon: UserRound,
    tone: "orange",
  },
  {
    title: "Find a hospital",
    copy: "Ask our team to recommend a clinic",
    href: "/appointments?intent=facility",
    icon: Building2,
    tone: "green",
  },
  {
    title: "Get a second opinion",
    copy: "Bring clarity to an important decision",
    href: "/appointments?intent=second-opinion",
    icon: FileText,
    tone: "red",
  },
  {
    title: "Request a callback",
    copy: "Our care coordinators will call you back",
    href: contactLinks.callback,
    icon: Phone,
    tone: "yellow",
  },
];

export const treatmentCards: {
  title: string;
  copy: string;
  href: string;
  image: string;
  icon: Icon;
  tone: Tone;
}[] = [
  {
    title: "Dental care",
    copy: "Plan dental treatment with a specialist dental team.",
    href: bookingHref({ treatment: "dental" }),
    image: assetUrl("medimatch/home/treatment-dental.webp"),
    icon: ToothIcon,
    tone: "orange",
  },
  {
    title: "Hair restoration",
    copy: "Talk through hair restoration options with a specialist.",
    href: bookingHref({ treatment: "hair-restoration" }),
    image: assetUrl("medimatch/home/treatment-hair.webp"),
    icon: HairIcon,
    tone: "green",
  },
  {
    title: "Skin & aesthetics",
    copy: "Discuss skin and aesthetic treatments with a specialist.",
    href: bookingHref({ treatment: "skin-aesthetics" }),
    image: assetUrl("medimatch/home/treatment-skin.webp"),
    icon: Sparkles,
    tone: "red",
  },
  {
    title: "Orthopedics",
    copy: "Get specialist guidance on bone, joint and back care.",
    href: bookingHref({ treatment: "orthopaedics" }),
    image: assetUrl("medimatch/home/treatment-ortho.webp"),
    icon: Bone,
    tone: "yellow",
  },
];

export const journeySteps: { title: string; copy: string; icon: Icon; tone: Tone }[] = [
  {
    title: "Tell us what you need",
    copy: "Share your goals and get personalised guidance.",
    icon: MessageSquareText,
    tone: "orange",
  },
  {
    title: "Review your care options",
    copy: "Explore tailored treatment plans with trusted specialists.",
    icon: FileText,
    tone: "green",
  },
  {
    title: "Plan your visit",
    copy: "Get help with travel, accommodation and appointments.",
    icon: Plane,
    tone: "red",
  },
  {
    title: "Stay supported",
    copy: "Receive aftercare guidance even after you return home.",
    icon: Heart,
    tone: "yellow",
  },
];

export const supportHighlights: { label: string; icon: Icon; tone: Tone }[] = [
  { label: "Accommodation support", icon: BedDouble, tone: "orange" },
  { label: "Travel planning", icon: Plane, tone: "green" },
  { label: "Local assistance", icon: UserRound, tone: "red" },
];

export const supportServices: { title: string; copy: string; icon: Icon }[] = [
  {
    title: "Travel and accommodation coordination",
    copy: "Help planning your travel and stay around your appointments.",
    icon: Plane,
  },
  {
    title: "Language and appointment support",
    copy: "Our team helps you communicate with ease.",
    icon: MessageSquareText,
  },
  {
    title: "Follow-up care coordination",
    copy: "Stay in touch with your care team after you return home.",
    icon: Heart,
  },
];
