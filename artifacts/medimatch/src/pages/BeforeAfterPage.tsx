import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, ClipboardCheck, Info } from "lucide-react";
import { CompareModeToggle, type CompareMode } from "@/components/before-after/CompareView";
import { IllustrationCard } from "@/components/before-after/IllustrationCard";
import { IllustrationModal } from "@/components/before-after/IllustrationModal";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeLink } from "@/components/home/HomeLink";
import {
  galleryAvailable,
  galleryPath,
  illustrationCategories,
  illustrationDisclosure,
  visibleIllustrations,
  type Illustration,
} from "@/lib/illustrations";
import NotFoundPage from "@/pages/NotFoundPage";

const pageTitle = "Before & After: Treatment Illustrations — MediMATCH";
const pageDescription =
  "Explore illustrative examples of potential treatment changes. These computer-generated images are educational examples, not actual patient results or predictions of your outcome.";

/** Sets the tab title and description while the page is open. */
function usePageMetadata(title: string, description: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousTitle = document.title;
    const previousDescription = meta?.content;
    document.title = title;
    if (meta) meta.content = description;
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, [title, description]);
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? "illustration" : "illustrations"}`;
}

export default function BeforeAfterPage() {
  // Nothing has passed clinical review yet on the published site.
  if (!galleryAvailable) return <NotFoundPage />;
  return <Gallery />;
}

function Gallery() {
  usePageMetadata(pageTitle, pageDescription);
  const search = useSearch();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<CompareMode>("slider");
  const [selected, setSelected] = useState<Illustration | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const requested = new URLSearchParams(search).get("treatment");
  const activeCategory = illustrationCategories.find((category) => category.slug === requested);
  const shown = activeCategory
    ? visibleIllustrations.filter((illustration) => illustration.treatment === activeCategory.slug)
    : visibleIllustrations;
  const awaitingReview = visibleIllustrations.some(
    (illustration) => illustration.clinicalReview === "pending",
  );

  // The filter lives in the address, so a filtered view can be shared or bookmarked.
  const chooseCategory = (slug: string | null) => {
    navigate(slug ? `${galleryPath}?treatment=${slug}` : galleryPath, { replace: true });
  };

  const openModal = useCallback((illustration: Illustration, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setSelected(illustration);
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
    triggerRef.current?.focus();
  }, []);

  const filters = [{ slug: null, name: "All treatments" }, ...illustrationCategories];

  return (
    <div className="mmh mmba">
      <a className="mmh-skip-link" href="#mmba-main">
        Skip to main content
      </a>
      <HomeHeader />

      <main id="mmba-main" tabIndex={-1}>
        <section className="mmba-intro" aria-labelledby="mmba-title">
          <div className="mmh-container mmba-intro__inner">
            <h1 id="mmba-title">Before &amp; After: Treatment Illustrations</h1>
            <p className="mmba-intro__lead">
              Explore illustrative examples of potential treatment changes. These computer-generated
              images are educational examples, not actual patient results or predictions of your
              outcome.
            </p>
            <p className="mmba-intro__note">
              <Info size={18} aria-hidden="true" />
              {illustrationDisclosure}
            </p>
          </div>
        </section>

        <div className="mmh-container mmba-body">
          {awaitingReview && (
            <div className="mmba-review" role="note" data-testid="notice-clinical-review">
              <ClipboardCheck size={22} aria-hidden="true" />
              <p>
                <strong>Preview only.</strong> These illustrations and descriptions are awaiting
                clinical review. Until each one is approved, it appears here in the preview but not
                on the published site.
              </p>
            </div>
          )}

          <div className="mmba-toolbar">
            <div className="mmba-filters" role="group" aria-label="Filter by treatment">
              {filters.map((filter) => {
                const active = (activeCategory?.slug ?? null) === filter.slug;
                return (
                  <button
                    key={filter.slug ?? "all"}
                    type="button"
                    className="mmba-filter"
                    aria-pressed={active}
                    onClick={() => chooseCategory(filter.slug)}
                    data-testid={`filter-${filter.slug ?? "all"}`}
                  >
                    {filter.name}
                  </button>
                );
              })}
            </div>
            <CompareModeToggle mode={mode} onChange={setMode} testIdPrefix="gallery" />
          </div>

          <p className="mmba-count" aria-live="polite" data-testid="text-illustration-count">
            Showing {countLabel(shown.length)}
            {activeCategory ? ` for ${activeCategory.name.toLowerCase()}` : ""}
          </p>

          <div className="mmba-layout">
            <ul className="mmba-grid" data-testid="list-illustrations">
              {shown.map((illustration) => (
                <li key={illustration.slug}>
                  <IllustrationCard illustration={illustration} mode={mode} onEnlarge={openModal} />
                </li>
              ))}
            </ul>

            <nav className="mmba-topics" aria-labelledby="mmba-topics-title">
              <h2 id="mmba-topics-title">{activeCategory ? activeCategory.name : "All treatments"}</h2>
              <ul>
                {shown.map((illustration) => (
                  <li key={illustration.slug}>
                    <a href={`#ba-${illustration.slug}`}>{illustration.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <section className="mmba-cta" aria-labelledby="mmba-cta-title">
            <div>
              <h2 id="mmba-cta-title">Questions about a treatment?</h2>
              <p>
                A MediMATCH care coordinator can talk you through your options and connect you with a
                specialist who can assess your situation.
              </p>
            </div>
            <HomeLink className="mmh-btn mmh-btn--orange mmh-btn--lg" href="/appointments" data-testid="link-plan-care">
              Plan my care <ArrowRight size={18} aria-hidden="true" />
            </HomeLink>
          </section>
        </div>
      </main>

      <HomeFooter />
      <IllustrationModal
        illustration={selected}
        mode={mode}
        onModeChange={setMode}
        onClose={closeModal}
      />
    </div>
  );
}
