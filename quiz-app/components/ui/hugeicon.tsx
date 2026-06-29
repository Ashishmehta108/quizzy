import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

/**
 * Adapts a hugeicons icon (a data object) into a component compatible with the
 * `{ size?, className? }` icon-prop shape used by EmptyState, StatCard, etc.
 *
 * Usage: <EmptyState icon={makeIcon(LibraryIcon)} ... />
 */
export function makeIcon(icon: IconSvgElement) {
  return function HugeIcon({
    size,
    className,
  }: {
    size?: string | number;
    className?: string;
  }) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={typeof size === "string" ? Number(size) : (size ?? 24)}
        className={className}
      />
    );
  };
}
