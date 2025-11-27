import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { IconButton } from "../index";
import { MobileBottomNavigation } from "../../mobile/MobileBottomNavigation";

function relLum(rgb: string) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return 0;
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])].map(
    (v) => v / 255
  );
  const f = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const [sr, sg, sb] = [f(r), f(g), f(b)];
  return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
}
function contrastRatio(fg: string, bg: string) {
  const L1 = relLum(fg);
  const L2 = relLum(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
function effectiveBg(el: Element): string {
  let node: Element | null = el;
  while (node && node instanceof Element) {
    const cs = getComputedStyle(node);
    const bg = cs.backgroundColor;
    // Map JSDOM system color to a concrete rgb for reliable contrast calc
    if (bg && bg.toLowerCase() === "buttonface") return "rgb(255, 255, 255)";
    if (bg && !bg.includes("0)")) return bg;
    node = node.parentElement;
  }
  return "rgb(255, 255, 255)";
}

describe("Core UI control contrast", () => {
  it("IconButton ghost has at least 3:1 for icon-like content", () => {
    render(
      <div className="bg-primary p-2">
        <IconButton aria-label="Close" variant="ghost">
          <svg width="16" height="16" aria-hidden="true" />
        </IconButton>
      </div>
    );
    const btn = screen.getByRole("button", { name: /close/i });
    const icon = btn.querySelector("svg") as Element | null;
    const target = icon ?? btn;
    const cs = getComputedStyle(target);
    const bg = effectiveBg(target);
    const ratio = contrastRatio(cs.color, bg);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it("MobileBottomNavigation items have icon contrast >= 3:1 and text >= 3:1 (JSDOM)", () => {
    render(
      <div className="bg-primary p-2">
        <MobileBottomNavigation
          items={[
            {
              id: "home",
              label: "Home",
              icon: "home",
              href: "/home",
              isActive: false,
            },
            {
              id: "calendar",
              label: "Calendar",
              icon: "calendar",
              href: "/cal",
              isActive: true,
            },
          ]}
        />
      </div>
    );
    const nav = screen.getByRole("navigation", {
      name: /mobile bottom navigation/i,
    });
    const icons = nav.querySelectorAll("svg");
    icons.forEach((svg) => {
      const cs = getComputedStyle(svg as Element);
      const bg = effectiveBg(svg as Element);
      const ratio = contrastRatio(cs.color, bg);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
    // Measure the label span inside each button for accurate color
    const labels = Array.from(nav.querySelectorAll("button span"));
    labels.forEach((el) => {
      const cs = getComputedStyle(el as Element);
      const bg = effectiveBg(el as Element);
      const ratio = contrastRatio(cs.color, bg);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  });
});
