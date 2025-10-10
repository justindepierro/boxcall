import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileCard from "../ProfileCard";
import { DashboardContext } from "../../../contexts/DashboardContextInstance";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RoleProvider } from "../../../hooks/useRoles";

describe("ProfileCard quick-edit and navigation", () => {
  const baseProfile = {
    id: "u1",
    role: "player",
    full_name: "John Doe",
    display_name: "Johnny",
    bio: "Short bio",
    email: "john@example.com",
  } as any;

  function renderCard(override?: Partial<typeof baseProfile>) {
    const profile = { ...baseProfile, ...(override || {}) };
    const setProfile = vi.fn();
    return render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <RoleProvider>
                <DashboardContext.Provider
                  value={{ profile, setProfile } as any}
                >
                  <ProfileCard />
                </DashboardContext.Provider>
              </RoleProvider>
            }
          />
          <Route path="/profile" element={<div>Profile Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("navigates to /profile from avatar and name and button", async () => {
    const user = userEvent.setup();
    const r1 = renderCard();

    // Avatar button
    await user.click(screen.getByRole("button", { name: /view profile/i }));
    expect(screen.getByText("Profile Page")).toBeInTheDocument();
    r1.unmount();

    // Re-render to reset route
    const r2 = renderCard();

    // Name link button
    await user.click(
      screen.getByRole("button", { name: /open profile page/i })
    );
    expect(screen.getByText("Profile Page")).toBeInTheDocument();
    r2.unmount();

    // Re-render to reset route
    const r3 = renderCard();

    // Footer action
    await user.click(
      screen.getByRole("button", { name: /view full profile/i })
    );
    expect(screen.getByText("Profile Page")).toBeInTheDocument();
    r3.unmount();
  });

  it("opens quick edit modal from header edit button", async () => {
    const user = userEvent.setup();
    renderCard();

    // Use exact match to avoid 'Edit profile picture'
    await user.click(screen.getByRole("button", { name: /^Edit profile$/ }));
    // Modal title for quick mode
    expect(screen.getByText(/quick edit profile/i)).toBeInTheDocument();
    // Has display name and bio fields visible
    expect(screen.getByText(/quick details/i)).toBeInTheDocument();
  });
});
