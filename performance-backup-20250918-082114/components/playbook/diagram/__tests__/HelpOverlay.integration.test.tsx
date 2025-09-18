import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelpOverlay } from "../components/HelpOverlay";

describe("Integration: HelpOverlay", () => {
  it("renders help overlay UI", () => {
    render(
      <HelpOverlay
        open={true}
        onClose={() => {}}
        dontShowAgain={false}
        onDontShowAgainChange={() => {}}
      />
    );
    expect(screen.getByTestId("help-overlay-root")).toBeInTheDocument();
  });
  // Add more tests for help overlay open/close and accessibility
});
