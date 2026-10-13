import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Mail, MessageCircle } from "lucide-react";
import { StudioMark } from "@/components/site/SiteShell";
import { galleryAvailable, galleryPath } from "@/lib/illustrations";
import { HomeLink, useHomeHref } from "./HomeLink";
import { contactLinks, navLinks } from "./homeContent";

export function HomeFooter() {
  const homeHref = useHomeHref();
  return (
    <footer className="mmh-footer" id="contact">
      <div className="mmh-container mmh-footer__inner">
        <Link href="/" className="mmh-footer__brand" aria-label="MediMATCH home">
          <StudioMark />
        </Link>
        <nav aria-label="Footer">
          <ul className="mmh-footer__links">
            <li>
              <HomeLink href={homeHref(navLinks.treatments)}>Treatments</HomeLink>
            </li>
            {galleryAvailable && (
              <li>
                <HomeLink href={galleryPath} data-testid="link-footer-before-after">
                  Before &amp; After
                </HomeLink>
              </li>
            )}
            <li>
              <HomeLink href={navLinks.doctors}>Doctors &amp; hospitals</HomeLink>
            </li>
            <li>
              <HomeLink href={homeHref(navLinks.howItWorks)}>How it works</HomeLink>
            </li>
            <li>
              <HomeLink href={homeHref(navLinks.about)}>About us</HomeLink>
            </li>
            <li>
              <a href={contactLinks.general}>Contact</a>
            </li>
          </ul>
        </nav>
        <div className="mmh-footer__contact">
          <a href={contactLinks.general}>
            <Mail size={16} aria-hidden="true" /> hello@medimatch.health
          </a>
          <a href={contactLinks.partners}>Partner with us</a>
        </div>
      </div>
    </footer>
  );
}

/** Primary actions the floating button should never sit on top of. */
const FAB_AVOID_SELECTOR = ".mmh-search, .mmh-btn";

function overlaps(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * The single floating support action: opens an email to the care desk.
 * It steps aside while it would cover the care request panel or a button.
 */
export function SupportButton() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    const button = ref.current;
    if (!button) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const own = button.getBoundingClientRect();
      const blocked = Array.from(document.querySelectorAll<HTMLElement>(FAB_AVOID_SELECTOR)).some(
        (element) => overlaps(own, element.getBoundingClientRect()),
      );
      setTucked(blocked);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <a
      ref={ref}
      className={tucked ? "mmh-support-fab is-tucked" : "mmh-support-fab"}
      href={contactLinks.support}
      title="Email support"
    >
      <MessageCircle size={24} aria-hidden="true" />
      <span className="mmh-support-fab__label">Email support</span>
    </a>
  );
}
