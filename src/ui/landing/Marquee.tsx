import { StarMark } from "@/ui/Logo";

/*
 * Decorative infinite marquee strip. The track holds the list twice so the
 * GSAP loop (xPercent: ±50) is seamless; aria-hidden because every phrase is
 * reinforced elsewhere on the page.
 */
export function Marquee({ items }: { items: string[] }) {
  const list = (
    <ul className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex shrink-0 items-center gap-7 pe-7 text-[13px] font-bold uppercase tracking-[0.18em] text-white"
        >
          <StarMark className="h-3.5 w-3.5 shrink-0 text-saffron [&>circle]:fill-terracotta" />
          <span className="whitespace-nowrap">{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div aria-hidden className="relative z-10 -my-5 -rotate-[1.2deg]">
      <div className="overflow-hidden bg-terracotta py-3.5 shadow-[0_12px_32px_-16px_var(--terracotta-strong)]">
        <div data-marquee-track className="flex w-max">
          {list}
          {list}
        </div>
      </div>
    </div>
  );
}
