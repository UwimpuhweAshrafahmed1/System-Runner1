import { useEffect } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe,
  Heart,
  MessageSquareText,
  Plane,
  ShieldCheck,
  Users,
} from "lucide-react";
import { CareSearchPanel } from "@/components/home/CareSearchPanel";
import { HomeFooter, SupportButton } from "@/components/home/HomeFooter";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeLink, scrollToHashTarget } from "@/components/home/HomeLink";
import {
  contactLinks,
  journeySteps,
  navLinks,
  quickActions,
  supportHighlights,
  supportServices,
  treatmentCards,
} from "@/components/home/homeContent";
import { assetUrl } from "@/lib/account";

const heroImage = {
  small: assetUrl("medimatch/home/hero-clinician-640.webp"),
  large: assetUrl("medimatch/home/hero-clinician-1024.webp"),
};
const travelImage = {
  small: assetUrl("medimatch/home/travel-istanbul-640.webp"),
  large: assetUrl("medimatch/home/travel-istanbul-1024.webp"),
};

function SectionIntro({
  id,
  eyebrow,
  title,
  copy,
}: {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mmh-intro">
      <p className="mmh-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <p className="mmh-intro__copy">{copy}</p>
    </div>
  );
}

function Hero() {
  return (
    <section className="mmh-hero" aria-labelledby="mmh-hero-title">
      <div className="mmh-hero__shape" aria-hidden="true" />
      <div className="mmh-container mmh-hero__inner">
        <div className="mmh-hero__copy">
          <p className="mmh-eyebrow mmh-eyebrow--light">Care that connects</p>
          <h1 id="mmh-hero-title" className="mmh-hero__title">
            For a healthier
            <br />
            <span className="mmh-hero__accent">
              tomorrow.
              <svg
                className="mmh-hero__underline"
                viewBox="0 0 300 24"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M6 18C80 8 180 4 294 10" vectorEffect="non-scaling-stroke" />
              </svg>
            </span>
          </h1>
          <p className="mmh-hero__lede">
            Find the right treatment, trusted specialists and support for every step of your
            journey.
          </p>
          <div className="mmh-hero__actions">
            <a className="mmh-btn mmh-btn--orange mmh-btn--lg" href={navLinks.treatments}>
              Explore treatments <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="mmh-btn mmh-btn--outline-light mmh-btn--lg" href={contactLinks.coordinator}>
              <MessageSquareText size={18} aria-hidden="true" /> Talk to a care coordinator
            </a>
          </div>
          <ul className="mmh-hero__proof">
            <li>
              <Globe size={28} aria-hidden="true" /> 15+ care pathways
            </li>
            <li>
              <Users size={28} aria-hidden="true" /> International patient support
            </li>
            <li>
              <ShieldCheck size={28} aria-hidden="true" className="is-green" /> A clearer path
              forward
            </li>
          </ul>
        </div>
      </div>
      <div className="mmh-hero__media">
        <img
          src={heroImage.large}
          srcSet={`${heroImage.small} 640w, ${heroImage.large} 1024w`}
          sizes="(min-width: 1101px) 58vw, 100vw"
          width={1024}
          height={800}
          alt="A clinician listening to a patient during a consultation"
          fetchPriority="high"
        />
        <aside className="mmh-journey-card" aria-labelledby="mmh-journey-card-title">
          <h2 id="mmh-journey-card-title">Your journey, thoughtfully coordinated.</h2>
          <ul>
            <li>
              <span className="mmh-icon-dot mmh-tone-orange" aria-hidden="true">
                <Users size={26} />
              </span>
              <strong>Consultation</strong>
              <span>Connect with trusted specialists</span>
            </li>
            <li>
              <span className="mmh-icon-dot mmh-tone-green" aria-hidden="true">
                <Plane size={26} />
              </span>
              <strong>Travel</strong>
              <span>Get help with your journey</span>
            </li>
            <li>
              <span className="mmh-icon-dot mmh-tone-red" aria-hidden="true">
                <Heart size={26} />
              </span>
              <strong>Aftercare</strong>
              <span>Ongoing support when you return</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <nav className="mmh-quick" aria-label="Quick actions">
      <ul>
        {quickActions.map(({ title, copy, href, icon: Icon, tone }) => (
          <li key={title}>
            <HomeLink href={href} className="mmh-quick__item">
              <span className={`mmh-icon-dot mmh-icon-dot--lg mmh-tone-${tone}`} aria-hidden="true">
                <Icon size={24} />
              </span>
              <span className="mmh-quick__text">
                <strong>{title}</strong>
                <span>{copy}</span>
              </span>
              <ChevronRight size={18} className="mmh-quick__chevron" aria-hidden="true" />
            </HomeLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Treatments() {
  return (
    <section className="mmh-treatments" id="treatments" aria-labelledby="mmh-treatments-title">
      <div className="mmh-container">
        <SectionIntro
          id="mmh-treatments-title"
          eyebrow="Popular treatments"
          title="Explore care, built around you."
          copy="Trusted specialists, modern facilities and personalised support."
        />
        <ul className="mmh-treatment-grid">
          {treatmentCards.map(({ title, copy, href, image, icon: Icon, tone }) => (
            <li key={title} className={`mmh-treatment mmh-treatment--${tone}`}>
              <div className="mmh-treatment__media">
                <img src={image} alt="" width={640} height={420} loading="lazy" decoding="async" />
              </div>
              <div className="mmh-treatment__body">
                <span
                  className={`mmh-icon-dot mmh-icon-dot--lg mmh-tone-${tone} mmh-treatment__icon`}
                  aria-hidden="true"
                >
                  <Icon size={28} />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <HomeLink href={href} className="mmh-treatment__link">
                  Explore options<span className="mmh-visually-hidden"> for {title}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </HomeLink>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Journey() {
  return (
    <section className="mmh-journey" id="how-it-works" aria-labelledby="mmh-journey-title">
      <div className="mmh-container">
        <SectionIntro
          id="mmh-journey-title"
          eyebrow="Your patient journey"
          title="From your first question to your return home."
          copy="A simpler, clearer journey with expert support at every step."
        />
        <ol className="mmh-steps">
          {journeySteps.map(({ title, copy, icon: Icon, tone }, index) => (
            <li key={title} className="mmh-step">
              <div className="mmh-step__head" aria-hidden="true">
                <span className={`mmh-step__number mmh-tone-${tone}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={`mmh-step__icon mmh-tint-${tone}`}>
                  <Icon size={28} />
                </span>
                {index < journeySteps.length - 1 && (
                  <span className="mmh-step__connector">
                    <ChevronRight size={18} />
                  </span>
                )}
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Support() {
  return (
    <section className="mmh-support" id="about" aria-labelledby="mmh-support-title">
      <div className="mmh-support__media">
        <img
          src={travelImage.large}
          srcSet={`${travelImage.small} 640w, ${travelImage.large} 1024w`}
          sizes="(min-width: 901px) 56vw, 100vw"
          width={1024}
          height={660}
          alt="Ortaköy Mosque and the Bosphorus Bridge in Istanbul"
          loading="lazy"
          decoding="async"
        />
        <ul className="mmh-support__chips">
          {supportHighlights.map(({ label, icon: Icon, tone }) => (
            <li key={label}>
              <Icon size={26} aria-hidden="true" className={`mmh-text-${tone}`} />
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="mmh-support__content">
        <p className="mmh-eyebrow">Travel with confidence</p>
        <h2 id="mmh-support-title">
          More than treatment.
          <br />
          Support along the way.
        </h2>
        <p className="mmh-support__lede">
          We help with the practical details, so you can focus on what matters most — your health
          and well-being.
        </p>
        <ul className="mmh-support__list">
          {supportServices.map(({ title, copy, icon: Icon }) => (
            <li key={title}>
              <Check size={20} className="mmh-support__check" aria-hidden="true" />
              <Icon size={22} className="mmh-support__icon" aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                <span>{copy}</span>
              </span>
            </li>
          ))}
        </ul>
        <a className="mmh-text-link" href={contactLinks.international}>
          Contact patient support <ArrowRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function ConsultationBanner() {
  return (
    <section className="mmh-banner" aria-labelledby="mmh-banner-title">
      <div className="mmh-container mmh-banner__inner">
        <div>
          <h2 id="mmh-banner-title">Let’s plan your next step, together.</h2>
          <p>Get expert guidance, personalised options and dedicated support.</p>
        </div>
        <HomeLink className="mmh-btn mmh-btn--yellow mmh-btn--lg" href={navLinks.planCare}>
          Request a consultation <ArrowRight size={18} aria-hidden="true" />
        </HomeLink>
      </div>
    </section>
  );
}

export default function HomePage() {
  // Links such as "/#how-it-works" from other pages land on the right section.
  useEffect(() => {
    scrollToHashTarget();
  }, []);

  return (
    <div className="mmh">
      <a className="mmh-skip-link" href="#mmh-main">
        Skip to main content
      </a>
      <HomeHeader />
      <main id="mmh-main" tabIndex={-1}>
        <Hero />
        <section className="mmh-actions-band" aria-label="Start your care request">
          <div className="mmh-container">
            <CareSearchPanel />
            <QuickActions />
          </div>
        </section>
        <Treatments />
        <Journey />
        <Support />
        <ConsultationBanner />
      </main>
      <HomeFooter />
      <SupportButton />
    </div>
  );
}
