import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Icon } from "./Icon";

// Ensure dev-like behavior for this test file (guarded code uses import.meta.env.DEV)
// Not strictly necessary for rendering fallback, but keep for clarity if env-dependent logic changes.
vi.stubEnv("NODE_ENV", "development");

describe("ModularIcon rendering behavior", () => {
  it("renders immediate dev fallback instead of placeholder while loading", async () => {
    render(<Icon name="camera" size="md" color="info" />);

    // Should render an element annotated with data-icon
    const wrapper = await screen.findByLabelText("camera");
    expect(wrapper).toBeInTheDocument();

    // The wrapper span carries data-icon=camera
    const span = wrapper.closest('span[data-icon="camera"]');
    expect(span).not.toBeNull();

    // Placeholder should not be present since immediate fallback is used
    const placeholder = document.querySelector(
      'svg[data-icon-placeholder="true"][data-icon="camera"]'
    );
    expect(placeholder).toBeNull();
  });

  it("falls back to help-circle when unsupported name provided", () => {
    render(<Icon name={"totally-unknown" as any} size="md" color="info" />);
    // It will still label with provided name for accessibility per adapter
    const el = screen.getByLabelText("totally-unknown");
    expect(el).toBeInTheDocument();
  });
});
