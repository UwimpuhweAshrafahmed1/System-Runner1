import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  HeartHandshake,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Users,
  Video,
} from "lucide-react";
import { SectionHeading, SiteShell, StudioMark, Tag } from "@/components/site/SiteShell";
import { assetUrl } from "@/lib/account";

const quickActions = [
  {
    icon: Search,
    title: "Find a doctor",
    copy: "Search by specialty, language, or location",
    href: "/appointments?intent=doctor",
  },
  {
    icon: Building2,
    title: "Find a facility",
    copy: "Explore trusted hospitals and care teams",
    href: "/appointments?intent=facility",
  },
  {
    icon: ShieldCheck,
    title: "Get a second opinion",
    copy: "Bring clarity to an important decision",
    href: "/appointments?intent=second-opinion",
  },
  {
    icon: Phone,
    title: "Request a callback",
    copy: "Our coordinators will call you back",
    href: "mailto:hello@medimatch.health?subject=Care%20navigation%20callback",
  },
];

const guideCards = {
  conditions: ["Heart health", "Back and neck pain", "Headaches", "Diabetes"],
  treatments: ["Second opinion", "Check-up planning", "Rehabilitation", "Video consultation"],
  tests: ["Blood work", "Imaging", "Genetic screening", "Specialist review"],
} as const;

type GuideTab = keyof typeof guideCards;

export default function HomePage() {
  const [guideTab, setGuideTab] = useState<GuideTab>("conditions");
  return (
    <SiteShell product="hub" footer={false}>
      <div className="medimatch-home">
        <section className="medimatch-hero">
          <div className="medimatch-hero__backdrop" aria-hidden="true" />
          <div className="medimatch-hero__copy page-pad">
            <Tag tone="light">
              <span className="live-dot" /> Trusted care coordination
            </Tag>
            <h1>
              For a healthier
              <br />
              <em>tomorrow.</em>
            </h1>
            <p>
              Find the right doctor, hospital, and next step with one clear care partner by your
              side.
            </p>
            <div className="medimatch-hero__actions">
              <a className="btn btn--primary" href="#quick-actions">
                Find your next step <ArrowRight size={16} />
              </a>
              <a className="medimatch-text-link" href="#about">
                Meet MediMATCH <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="medimatch-hero__proof">
              <span>
                <BadgeCheck size={16} /> 15+ care pathways
              </span>
              <span>
                <Users size={16} /> International patient support
              </span>
              <span>
                <Star size={16} fill="currentColor" /> 4.8 patient trust score
              </span>
            </div>
          </div>
          <div className="medimatch-hero__image">
            <img src={assetUrl("medimatch/checkup.jpg")} alt="MediMATCH doctor consultation" />
            <div className="medimatch-hero__image-card">
              <span className="eyebrow">MediMATCH care desk</span>
              <strong>
                One conversation.
                <br />A clearer path forward.
              </strong>
              <span>
                <span className="pulse-dot pulse-dot--blue" /> Available today · online or in
                person
              </span>
            </div>
          </div>
        </section>

        <section className="clinic-quick-actions page-pad" id="quick-actions">
          {quickActions.map(({ icon: Icon, title, copy, href }) => {
            const content = (
              <>
                <span className="clinic-quick-action__icon">
                  <Icon size={21} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{copy}</small>
                </span>
                <ChevronRight size={17} />
              </>
            );
            return href.startsWith("/") ? (
              <Link href={href} className="clinic-quick-action" key={title}>
                {content}
              </Link>
            ) : (
              <a href={href} className="clinic-quick-action" key={title}>
                {content}
              </a>
            );
          })}
        </section>

        <section className="clinic-section page-pad" id="about">
          <SectionHeading
            eyebrow="Care that meets you where you are"
            title="A coordinated system for better decisions."
            copy="MediMATCH brings doctors, facilities, digital care, and practical guidance into one calm, trustworthy experience."
            action={
              <a className="text-link" href="mailto:hello@medimatch.health">
                Talk to our care desk <ArrowRight size={15} />
              </a>
            }
          />
          <div className="clinic-feature-grid">
            <article className="clinic-feature-card clinic-feature-card--wide">
              <img src={assetUrl("medimatch/care-strip.png")} alt="Doctor and family care scene" />
              <div>
                <span className="eyebrow">A human first system</span>
                <h3>From first question to next appointment.</h3>
                <p>Clear options, warm guidance, and the confidence to move forward.</p>
              </div>
            </article>
            <article className="clinic-feature-card">
              <div className="clinic-feature-card__icon">
                <HeartHandshake size={24} />
              </div>
              <span className="eyebrow">International care</span>
              <h3>Support that travels with you.</h3>
              <p>Language help, appointment coordination, and practical preparation.</p>
              <a className="text-link" href="mailto:international@medimatch.health">
                International patients <ArrowRight size={15} />
              </a>
            </article>
            <article className="clinic-feature-card">
              <div className="clinic-feature-card__icon clinic-feature-card__icon--orange">
                <Video size={24} />
              </div>
              <span className="eyebrow">MediMATCH online</span>
              <h3>Speak with a specialist from home.</h3>
              <p>Video consultations that make expert care more accessible.</p>
              <a className="text-link" href="mailto:hello@medimatch.health">
                Learn about online care <ArrowRight size={15} />
              </a>
            </article>
          </div>
        </section>

        <section className="clinic-guide page-pad" id="guide">
          <div className="clinic-guide__head">
            <div>
              <span className="eyebrow">MediMATCH health guide</span>
              <h2>
                Useful answers,
                <br />
                <em>without the noise.</em>
              </h2>
            </div>
            <a className="text-link" href="#guide">
              Explore the guide <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="clinic-guide__tabs">
            {(Object.keys(guideCards) as GuideTab[]).map((tab) => (
              <button
                key={tab}
                className={guideTab === tab ? "is-active" : ""}
                onClick={() => setGuideTab(tab)}
              >
                {tab === "conditions"
                  ? "Conditions & symptoms"
                  : tab === "treatments"
                    ? "Treatments"
                    : "Tests & check-ups"}
              </button>
            ))}
          </div>
          <div className="clinic-guide__cards">
            {guideCards[guideTab].map((item, index) => (
              <a href="#guide" key={item} className="clinic-guide-card">
                <span className="clinic-guide-card__number">0{index + 1}</span>
                <span>
                  <strong>{item}</strong>
                  <small>Read the MediMATCH guide</small>
                </span>
                <ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        </section>

        <section className="clinic-locations page-pad" id="locations">
          <SectionHeading
            eyebrow="Where care happens"
            title="Trusted facilities, thoughtfully connected."
            copy="A growing network of care teams and facilities, selected for experience, safety, and the way they treat people."
            action={
              <a className="text-link" href="#locations">
                View all locations <ArrowRight size={15} />
              </a>
            }
          />
          <div className="clinic-location-grid">
            <article className="clinic-location-card clinic-location-card--feature">
              <img src={assetUrl("medimatch/online-care.webp")} alt="MediMATCH connected care" />
              <div>
                <span className="eyebrow">Connected care</span>
                <h3>Wherever your care begins, your story stays connected.</h3>
                <p>In-person expertise and online support working as one.</p>
              </div>
            </article>
            <article className="clinic-location-card">
              <span className="clinic-location-card__pin">
                <MapPin size={17} />
              </span>
              <span className="eyebrow">Istanbul · Turkey</span>
              <h3>MediMATCH International Desk</h3>
              <p>Multilingual coordination · 24/7 patient line</p>
              <a className="text-link" href="mailto:hello@medimatch.health">
                Get directions <ArrowRight size={15} />
              </a>
            </article>
            <article className="clinic-location-card">
              <span className="clinic-location-card__pin clinic-location-card__pin--orange">
                <CalendarDays size={17} />
              </span>
              <span className="eyebrow">Start here</span>
              <h3>Book a care planning call</h3>
              <p>Tell us what you need and we will map the next step.</p>
              <a className="text-link" href="mailto:hello@medimatch.health">
                Request a time <ArrowRight size={15} />
              </a>
            </article>
          </div>
        </section>

        <section className="clinic-trust page-pad">
          <div>
            <span className="eyebrow">Trust is a practice</span>
            <h2>
              Good care is
              <br />
              <em>felt in the details.</em>
            </h2>
          </div>
          <div className="clinic-trust__copy">
            <p>“The right next step is easier to take when someone has made the path clear.”</p>
            <span>— MediMATCH care principle 01</span>
            <div className="clinic-trust__stats">
              <strong>15+</strong>
              <span>care pathways</span>
              <strong>24/7</strong>
              <span>support line</span>
              <strong>01</strong>
              <span>clear next step</span>
            </div>
          </div>
        </section>

        <footer className="hub-footer">
          <div>
            <StudioMark compact />
            <span>MediMATCH</span>
          </div>
          <span>Better decisions. Better connected care.</span>
          <a href="mailto:hello@medimatch.health">
            hello@medimatch.health <ArrowUpRight size={14} />
          </a>
        </footer>
      </div>
    </SiteShell>
  );
}
