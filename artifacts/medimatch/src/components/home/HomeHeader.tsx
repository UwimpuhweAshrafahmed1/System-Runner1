import { useEffect, useRef, useState, type FocusEvent, type RefObject } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ChevronDown, Globe, Headset, Menu, X } from "lucide-react";
import { StudioMark } from "@/components/site/SiteShell";
import { galleryAvailable, galleryPath } from "@/lib/illustrations";
import { HomeLink, useHomeHref } from "./HomeLink";
import { navLinks, treatmentMenu } from "./homeContent";

/** Closes a popup on Escape or on a click outside it. */
function useDismiss(
  open: boolean,
  close: () => void,
  containerRef: RefObject<HTMLElement | null>,
  returnFocusRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      returnFocusRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, containerRef, returnFocusRef]);
}

function TreatmentsMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useRef(() => setOpen(false)).current;
  const homeHref = useHomeHref();
  useDismiss(open, close, wrapRef, buttonRef);

  // Keyboard users tabbing past the last link close the menu. A null target
  // (a click that does not move focus) is left to the outside-click handler.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && !wrapRef.current?.contains(next)) close();
  };

  return (
    <div className="mmh-menu" ref={wrapRef} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        className="mmh-nav__link mmh-menu__button"
        aria-expanded={open}
        aria-controls="mmh-treatments-menu"
        onClick={() => setOpen((value) => !value)}
      >
        Treatments <ChevronDown size={15} aria-hidden="true" />
      </button>
      <div id="mmh-treatments-menu" className="mmh-menu__panel" hidden={!open}>
        <ul>
          {treatmentMenu.map((item) => (
            <li key={item.label}>
              <HomeLink href={item.href} onClick={close}>
                {item.label}
              </HomeLink>
            </li>
          ))}
        </ul>
        <HomeLink className="mmh-menu__all" href={homeHref(navLinks.treatments)} onClick={close}>
          Browse popular treatments <ArrowRight size={15} aria-hidden="true" />
        </HomeLink>
      </div>
    </div>
  );
}

export function HomeHeader() {
  const signInLabel = "Sign in";
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useRef(() => setMenuOpen(false)).current;
  useDismiss(menuOpen, closeMenu, headerRef, toggleRef);
  const homeHref = useHomeHref();
  const [location] = useLocation();
  const galleryCurrent = location === galleryPath ? "page" : undefined;

  return (
    <>
      <div className="mmh-utility">
        <div className="mmh-container mmh-utility__inner">
          <span className="mmh-utility__item">
            <Headset size={15} aria-hidden="true" /> International patient support
          </span>
          <span className="mmh-utility__item">
            <Globe size={15} aria-hidden="true" /> Language: EN
          </span>
        </div>
      </div>

      {/* mmba-gallery-nav: the extra link needs more width (styles/before-after.css). */}
      <header className={galleryAvailable ? "mmh-header mmba-gallery-nav" : "mmh-header"} ref={headerRef}>
        <div className="mmh-container mmh-header__inner">
          <Link href="/" className="mmh-header__brand" aria-label="MediMATCH home">
            <StudioMark />
          </Link>

          <nav className="mmh-nav" aria-label="Main">
            <ul>
              <li>
                <TreatmentsMenu />
              </li>
              {galleryAvailable && (
                <li>
                  <HomeLink
                    className="mmh-nav__link"
                    href={galleryPath}
                    aria-current={galleryCurrent}
                    data-testid="link-nav-before-after"
                  >
                    Before &amp; After
                  </HomeLink>
                </li>
              )}
              <li>
                <HomeLink className="mmh-nav__link" href={navLinks.doctors}>
                  Doctors &amp; hospitals
                </HomeLink>
              </li>
              <li>
                <HomeLink className="mmh-nav__link" href={homeHref(navLinks.howItWorks)}>
                  How it works
                </HomeLink>
              </li>
              <li>
                <HomeLink className="mmh-nav__link" href={homeHref(navLinks.about)}>
                  About us
                </HomeLink>
              </li>
              <li>
                {/* Every page with this header ends with the contact footer. */}
                <a className="mmh-nav__link" href={navLinks.contact}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="mmh-header__actions">
            <HomeLink className="mmh-header__signin" href={navLinks.signIn}>
              {signInLabel}
            </HomeLink>
            <HomeLink className="mmh-btn mmh-btn--orange mmh-header__cta" href={navLinks.planCare}>
              Plan my care <ArrowRight size={17} aria-hidden="true" />
            </HomeLink>
            <button
              ref={toggleRef}
              type="button"
              className="mmh-header__toggle"
              aria-expanded={menuOpen}
              aria-controls="mmh-mobile-menu"
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              <span className="mmh-visually-hidden">{menuOpen ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </div>

        <div id="mmh-mobile-menu" className="mmh-mobile-menu" hidden={!menuOpen}>
          <nav className="mmh-container" aria-label="Main (mobile)">
            <ul>
              <li>
                <HomeLink href={homeHref(navLinks.treatments)} onClick={closeMenu}>
                  Treatments
                </HomeLink>
              </li>
              {galleryAvailable && (
                <li>
                  <HomeLink
                    href={galleryPath}
                    onClick={closeMenu}
                    aria-current={galleryCurrent}
                    data-testid="link-mobile-before-after"
                  >
                    Before &amp; After
                  </HomeLink>
                </li>
              )}
              <li>
                <HomeLink href={navLinks.doctors} onClick={closeMenu}>
                  Doctors &amp; hospitals
                </HomeLink>
              </li>
              <li>
                <HomeLink href={homeHref(navLinks.howItWorks)} onClick={closeMenu}>
                  How it works
                </HomeLink>
              </li>
              <li>
                <HomeLink href={homeHref(navLinks.about)} onClick={closeMenu}>
                  About us
                </HomeLink>
              </li>
              <li>
                <a href={navLinks.contact} onClick={closeMenu}>
                  Contact
                </a>
              </li>
            </ul>
            <div className="mmh-mobile-menu__actions">
              <HomeLink className="mmh-btn mmh-btn--orange" href={navLinks.planCare} onClick={closeMenu}>
                Plan my care <ArrowRight size={17} aria-hidden="true" />
              </HomeLink>
              <HomeLink className="mmh-btn mmh-btn--outline" href={navLinks.signIn} onClick={closeMenu}>
                {signInLabel}
              </HomeLink>
            </div>
          </nav>
        </div>
      </header>

      <div className="mmh-accent-strip" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </>
  );
}
