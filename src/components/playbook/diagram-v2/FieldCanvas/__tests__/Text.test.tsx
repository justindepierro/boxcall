import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Text } from "../Text";

describe("Text", () => {
  it("renders with text", () => {
    render(<Text x={5} y={5} text="Hello" color="#111827" fontSize={18} />);
  });
});
