import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertsList } from "@/components/alerts/AlertsList";

// alerts-actions.ts is a "use server" module that (via lib/auth/session.ts)
// imports the server-only package — Next.js strips that boundary in real
// builds, but Vitest executes the module graph directly, so it needs a mock.
vi.mock("@/lib/api/alerts-actions", () => ({
  followUpOnAlert: vi.fn().mockResolvedValue({ ok: true }),
}));

const alerts = [
  {
    id: "a1",
    entity: "Test Entity",
    type: "T-minus 5 Escalation",
    message: "No submission activity detected.",
    severity: "high" as const,
  },
];

describe("AlertsList", () => {
  it("marks an alert as followed up when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<AlertsList alerts={alerts} />);

    const button = screen.getByRole("button", { name: "Follow Up" });
    await user.click(button);

    expect(screen.getByRole("button", { name: /Followed up/i })).toBeDisabled();
  });
});
