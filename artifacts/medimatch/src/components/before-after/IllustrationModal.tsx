import { useEffect, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import type { Illustration } from "@/lib/illustrations";
import { CompareModeToggle, CompareView, type CompareMode } from "./CompareView";
import {
  AskAboutTreatment,
  IllustrationDisclosure,
  IllustrationTags,
} from "./IllustrationDetails";

type IllustrationModalProps = {
  illustration: Illustration | null;
  mode: CompareMode;
  onModeChange: (mode: CompareMode) => void;
  /** Called after the dialog has closed (close button, Escape or a click outside). */
  onClose: () => void;
};

const SLIDER_SIZES = "(min-width: 960px) 560px, calc(100vw - 48px)";
const SIDE_SIZES = "(min-width: 960px) 520px, calc(50vw - 28px)";

const TABBABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Tab from the last control goes back to the first, and Shift+Tab from the
 * first goes to the last. Without this the browser lets focus leave a modal
 * dialog for its own toolbar.
 */
function keepFocusInside(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const dialog = event.currentTarget;
  const tabbable = Array.from(dialog.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (element) => element.getClientRects().length > 0,
  );
  if (!tabbable.length) return;
  const first = tabbable[0];
  const last = tabbable[tabbable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === dialog)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Enlarged comparison in a native modal dialog: the browser closes it on
 * Escape and makes the rest of the page inert while it is open; Tab and
 * Shift+Tab cycle through the dialog's own controls.
 */
export function IllustrationModal({ illustration, mode, onModeChange, onClose }: IllustrationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (illustration && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    } else if (!illustration && dialog.open) {
      dialog.close();
    }
  }, [illustration]);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="mmba-modal"
      aria-labelledby="mmba-modal-title"
      onClose={onClose}
      onKeyDown={keepFocusInside}
      // A click on the dimmed backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      data-testid="dialog-illustration"
    >
      {illustration && (
        <div className={`mmba-modal__inner mmba-modal__inner--${mode}`}>
          <div className="mmba-modal__bar">
            <CompareModeToggle mode={mode} onChange={onModeChange} testIdPrefix="modal" />
            <button
              ref={closeRef}
              type="button"
              className="mmba-modal__close"
              onClick={close}
              data-testid="button-close-illustration"
            >
              <X size={20} aria-hidden="true" />
              <span className="mmh-visually-hidden">Close</span>
            </button>
          </div>
          <div className={`mmba-modal__media mmba-media--${mode}`}>
            <CompareView
              key={illustration.slug}
              illustration={illustration}
              mode={mode}
              sliderSizes={SLIDER_SIZES}
              sideSizes={SIDE_SIZES}
              eager
              testId="modal-compare"
            />
          </div>
          <div className="mmba-modal__info">
            <IllustrationTags illustration={illustration} />
            <h2 id="mmba-modal-title">{illustration.title}</h2>
            <p>{illustration.summary}</p>
            <IllustrationDisclosure />
            <AskAboutTreatment illustration={illustration} testId="link-ask-modal" />
          </div>
        </div>
      )}
    </dialog>
  );
}
