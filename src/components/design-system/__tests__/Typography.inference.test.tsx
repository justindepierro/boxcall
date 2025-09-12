import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Typography } from "../../design-system/Typography";

// Tiny helper to extract the className from rendered element
function getClass(node: HTMLElement) {
  return node.getAttribute("class") || "";
}

describe("Typography variant ergonomics", () => {
  it("infers headline-lg for h2 when no variant provided", () => {
    const { container } = render(<Typography as="h2">Title</Typography>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("H2");
    // headline-lg includes font-sans text-3xl font-bold
    expect(getClass(el)).toContain("text-3xl");
    expect(getClass(el)).toContain("font-bold");
  });

  it("defaults to body-md for p when no variant provided", () => {
    const { container } = render(<Typography as="p">Body</Typography>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("P");
    // body-md includes font-sans text-base leading-relaxed
    expect(getClass(el)).toContain("text-base");
    expect(getClass(el)).toContain("leading-relaxed");
  });

  it("normalizes alias 'body' to body-md classes", () => {
    const { container } = render(<Typography variant="body">Alias</Typography>);
    const el = container.firstElementChild as HTMLElement;
    expect(getClass(el)).toContain("text-base");
    expect(getClass(el)).toContain("leading-relaxed");
  });

  it("honors explicit display-lg variant and element mapping", () => {
    const { container } = render(
      <Typography variant="display-lg">Hero</Typography>
    );
    const el = container.firstElementChild as HTMLElement;
    // display-lg maps to font-display text-5xl ... and default element h1
    expect(el.tagName).toBe("H1");
    expect(getClass(el)).toContain("font-display");
    expect(getClass(el)).toContain("text-5xl");
  });
});
