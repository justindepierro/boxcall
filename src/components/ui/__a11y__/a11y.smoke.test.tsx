import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Button } from "../Button";

describe("a11y smoke", () => {
  it("Button renders with accessible role", () => {
    const { getByRole } = render(<Button variant="primary">Click Me</Button>);
    expect(getByRole("button", { name: /click me/i })).toBeTruthy();
  });
});
