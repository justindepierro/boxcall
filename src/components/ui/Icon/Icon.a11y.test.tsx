import { render, screen } from "@testing-library/react";
import { Icon } from "./Icon";
import type { IconName } from "./types";

describe("Icon accessibility", () => {
  it("sets role=img and descriptive aria-label", () => {
    render(<Icon name="star" size="md" color="info" aria-label="Favorite" />);
    const icon = screen.getByLabelText("Favorite");
    expect(icon).toHaveAttribute("role", "img");
  });

  it("defaults aria-label to icon-{name}", () => {
    render(<Icon name="star" size="md" color="info" />);
    const icon = screen.getByLabelText("icon-star");
    expect(icon).toHaveAttribute("role", "img");
  });

  it("sets aria-hidden on SVG for assistive tech", () => {
    render(<Icon name="star" size="md" color="info" />);
    const svg = screen.getByLabelText("icon-star").querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders fallback with correct accessibility if icon missing", () => {
    render(<Icon name={"nonexistent" as IconName} size="md" color="info" />);
    const fallback = screen.getByLabelText(
      /icon-nonexistent|icon-help-circle|icon-alert|icon-error/i
    );
    expect(fallback).toHaveAttribute("role", "img");
  });

  it("does not expose decorative icons to assistive tech", () => {
    render(<Icon name="star" size="md" color="info" aria-hidden />);
    const icon = screen.queryByLabelText("icon-star");
    expect(icon).toBeNull();
  });

  it("supports keyboard focus if tabIndex is set", () => {
    render(<Icon name="star" size="md" color="info" tabIndex={0} />);
    const icon = screen.getByLabelText("icon-star");
    expect(icon).toHaveAttribute("tabindex", "0");
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
