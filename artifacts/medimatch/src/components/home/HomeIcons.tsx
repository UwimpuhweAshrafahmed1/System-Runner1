import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function baseProps({ size = 24, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

/** Tooth outline in the same stroke style as the lucide icon set. */
export function ToothIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M7.5 3.5c-2.3 0-4 1.8-4 4.2 0 2 .7 3.5 1.4 5.1.6 1.4.8 3 1.1 4.7.3 1.7.7 3 1.8 3 1.2 0 1.5-1.6 1.9-3.2.3-1.3.8-2.3 2.3-2.3s2 1 2.3 2.3c.4 1.6.7 3.2 1.9 3.2 1.1 0 1.5-1.3 1.8-3 .3-1.7.5-3.3 1.1-4.7.7-1.6 1.4-3.1 1.4-5.1 0-2.4-1.7-4.2-4-4.2-1.8 0-2.8.9-4.5.9s-2.7-.9-4.5-.9Z" />
    </svg>
  );
}

/** Hair strands rising from the scalp line. */
export function HairIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 20h16" />
      <path d="M7.5 20c0-4.5 1.2-8 4-11" />
      <path d="M12 20c0-5.5.8-10 3.8-14" />
      <path d="M16.5 20c0-3.6.8-6.4 2.8-8.6" />
    </svg>
  );
}
