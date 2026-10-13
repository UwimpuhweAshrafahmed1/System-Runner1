import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { Link } from "wouter";

type HomeLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

/** Opens the next page at the top instead of at the homepage's scroll position. */
export function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

/**
 * App routes go through the router and open at the top of the page; in-page
 * anchors and email links stay plain anchors.
 */
export function HomeLink({ href, onClick, ...rest }: HomeLinkProps) {
  if (!href.startsWith("/")) return <a href={href} onClick={onClick} {...rest} />;
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const opensElsewhere =
      event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!event.defaultPrevented && !opensElsewhere) scrollToPageTop();
  };
  return <Link href={href} onClick={handleClick} {...rest} />;
}
