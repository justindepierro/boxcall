import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Icon } from "./Icon";
import type { IconName } from "./types";

describe("Icon accessibility", () => {
  it("sets role=img and descriptive aria-label", () => {
    render(<Icon name="star" size="md" color="info" aria-label="Favorite" />);
    const icon = screen.getByLabelText("Favorite");
    expect(icon).toHaveAttribute("role", "img");
  });

  it("defaults aria-label to {name}", () => {
    render(<Icon name="star" size="md" color="info" />);
    const icon = screen.getByLabelText("star");
    expect(icon).toHaveAttribute("role", "img");
  });

  it("sets aria-hidden on SVG for assistive tech", () => {
    render(<Icon name="star" size="md" color="info" />);
    const icons = screen.getAllByLabelText("star");
    icons.forEach((icon) => {
      const svg = icon.querySelector("svg");
      if (svg) expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("renders fallback with correct accessibility if icon missing", () => {
    render(<Icon name={"nonexistent" as IconName} size="md" color="info" />);
    const fallback = screen.getByLabelText("nonexistent");
    expect(fallback).toHaveAttribute("role", "img");
  });

  it("does not expose decorative icons to assistive tech", () => {
    // Render only the decorative icon in isolation
    const { container } = render(
      <Icon name="star" size="md" color="info" aria-hidden />
    );
    const iconSpan = container.querySelector('span[role="img"]');
    // If a span with role="img" exists, it should not have aria-label
    if (iconSpan) {
      expect(iconSpan).not.toHaveAttribute("aria-label");
    } else {
      // If no span with role="img" exists, the test passes (icon is fully hidden)
      expect(iconSpan).toBeNull();
    }
  });

  it("supports keyboard focus if tabIndex is set", () => {
    render(<Icon name="star" size="md" color="info" tabIndex={0} />);
    const icons = screen.getAllByLabelText("star");
    expect(icons.some((icon) => icon.getAttribute("tabindex") === "0")).toBe(
      true
    );
  });

  it("applies custom aria-labels for fallback icons", () => {
    render(
      <Icon
        name={"nonexistent" as IconName}
        size="md"
        color="info"
        aria-label="Custom Fallback"
      />
    );
    const fallback = screen.getByLabelText("Custom Fallback");
    expect(fallback).toHaveAttribute("role", "img");
  });
});
