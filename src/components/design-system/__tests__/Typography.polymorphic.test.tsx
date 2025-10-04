import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Typography, { H1, H2, P, Label, Code } from "../Typography";

describe("Typography polymorphic behavior", () => {
  it("infers variant from element when variant is omitted", () => {
    render(<Typography as="span">Hello</Typography>);
    const el = screen.getByText("Hello");
    expect(el.tagName).toBe("SPAN");
    // body-sm includes text-[0.82rem]
    expect(el.className).toContain("text-[0.82rem]");
  });

  it("uses alias variant and resolves default element from actual variant", () => {
    render(<Typography variant="display">Hero</Typography>);
    const el = screen.getByText("Hero");
    // display alias -> display-lg -> h1
    expect(el.tagName).toBe("H1");
    expect(el.className).toContain("font-display");
  });

  it("respects explicit `as` even when variant would suggest a different element", () => {
    render(
      <Typography as="p" variant="headline-lg">
        Section
      </Typography>
    );
    const el = screen.getByText("Section");
    expect(el.tagName).toBe("P");
    // headline-lg includes font-semibold + text-[1.625rem]
    expect(el.className).toContain("text-[1.625rem]");
    expect(el.className).toContain("font-semibold");
  });

  it("applies htmlFor when rendering a label", () => {
    render(
      <Typography as="label" htmlFor="email">
        Email
      </Typography>
    );
    const el = screen.getByText("Email");
    expect(el.tagName).toBe("LABEL");
    expect(el.getAttribute("for")).toBe("email");
  });
});

describe("Typography shorthands", () => {
  it("H1 defaults to headline-xl", () => {
    render(<H1>Title</H1>);
    const el = screen.getByText("Title");
    expect(el.tagName).toBe("H1");
    expect(el.className).toContain("text-[2rem]");
    expect(el.className).toContain("font-semibold");
  });

  it("H2 defaults to headline-lg", () => {
    render(<H2>Subsection</H2>);
    const el = screen.getByText("Subsection");
    expect(el.tagName).toBe("H2");
    expect(el.className).toContain("text-[1.625rem]");
  });

  it("P defaults to body-md", () => {
    render(<P>Body</P>);
    const el = screen.getByText("Body");
    expect(el.tagName).toBe("P");
    expect(el.className).toContain("text-[0.9rem]");
  });

  it("Label defaults to label-md and forwards htmlFor", () => {
    render(<Label htmlFor="x">X</Label>);
    const el = screen.getByText("X");
    expect(el.tagName).toBe("LABEL");
    expect(el.getAttribute("for")).toBe("x");
    expect(el.className).toContain("uppercase");
  });

  it("Code defaults to code-md (mono)", () => {
    render(<Code>const x=1;</Code>);
    const el = screen.getByText("const x=1;");
    expect(el.tagName).toBe("CODE");
    expect(el.className).toContain("font-mono");
  });
});
