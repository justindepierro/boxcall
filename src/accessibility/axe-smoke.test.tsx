/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CalendarToolbar } from "@components/calendar";

describe("a11y smoke", () => {
  it("renders CalendarToolbar basic controls", () => {
    const { getByText } = render(
      <CalendarToolbar
        currentView="dayGridMonth"
        onViewChange={() => {}}
        onToday={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(getByText("Today")).toBeInTheDocument();
  });
});
