import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { Icon } from "./Icon";

describe("Icon component", () => {
  it("renders the correct icon by name", () => {
    render(<Icon name="check" size="md" color="info" />);
    // Should render an SVG with correct aria-label
    const svg = screen.getByLabelText(/check/i);
    expect(svg).toBeInTheDocument();
  });

  it("renders fallback if icon name is invalid", () => {
    render(<Icon name={"nonexistent" as any} size="md" color="info" />);
    // Should render fallback icon (e.g., help-circle)
    const fallback = screen.getByLabelText("nonexistent");
    expect(fallback).toBeInTheDocument();
  });

  it("applies accessibility attributes", () => {
    render(<Icon name="star" size="md" color="info" aria-label="Favorite" />);
    const svg = screen.getByLabelText("Favorite");
    expect(svg).toHaveAttribute("role", "img");
  });

  it("renders different sizes and colors", () => {
    render(
      <>
        <Icon name="star" size="sm" color="info" />
        <Icon name="star" size="md" color="success" />
        <Icon name="star" size="lg" color="error" />
      </>
    );
    const icons = screen.getAllByLabelText("star");
    expect(icons.length).toBe(3);
    // You could add more assertions for style/class if needed
  });

  it("handles missing props gracefully", () => {
    // @ts-expect-error: intentionally missing required props
    expect(() => render(<Icon />)).not.toThrow();
    // No assertion needed, just checking for crash
  });

  it("handles invalid type for size", () => {
    // @ts-expect-error: invalid size
    render(<Icon name="star" size={"xlarge"} color="info" />);
    const icons = screen.getAllByLabelText("star");
    expect(icons.length).toBeGreaterThan(0);
  });
});
