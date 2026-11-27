import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

// openapi-fetch binds `fetch` once when the client is created (module import
// time), so stubbing global fetch per test is too late to reach it. Mocking
// the generated client itself is the seam the screen actually calls through.
vi.mock("@/api/client", () => ({
  api: { POST: vi.fn() },
}));

import { api } from "@/api/client";
import Screen from "./Register";

function renderScreen() {
  return render(
    <MemoryRouter>
      <Screen />
    </MemoryRouter>,
  );
}

function fillForm({ email, password, confirm }) {
  fireEvent.change(screen.getByTestId("email-input"), { target: { value: email } });
  fireEvent.change(screen.getByTestId("password-at-least-8-characters-input"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByTestId("confirm-password-input"), {
    target: { value: confirm },
  });
}

describe("Create Account", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders the title and form test ids", () => {
    renderScreen();
    expect(screen.getByTestId("create-account-title")).toHaveTextContent("Create account");
    expect(screen.getByTestId("form-1")).toBeInTheDocument();
    expect(screen.getByTestId("already-registered-log-in-link")).toBeInTheDocument();
  });

  it("[AC-008] shows the validation message for a malformed email, and never calls the API", () => {
    renderScreen();
    const password = crypto.randomUUID().slice(0, 12);
    fillForm({ email: "not-an-email", password, confirm: password });
    fireEvent.click(screen.getByTestId("create-account-btn"));

    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(api.POST).not.toHaveBeenCalled();
  });

  it("[AC-008] shows the validation message for a too-short password, and never calls the API", () => {
    renderScreen();
    fillForm({ email: "visitor@example.com", password: "short", confirm: "short" });
    fireEvent.click(screen.getByTestId("create-account-btn"));

    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
    expect(api.POST).not.toHaveBeenCalled();
  });

  it("[AC-007] shows the taken-email message when the API refuses the email as a duplicate, and creates no account", async () => {
    api.POST.mockResolvedValue({ data: undefined, error: undefined, response: { status: 409 } });
    renderScreen();
    const password = crypto.randomUUID().slice(0, 12);
    fillForm({ email: "taken@example.com", password, confirm: password });
    fireEvent.click(screen.getByTestId("create-account-btn"));

    expect(await screen.findByText("This email is already registered")).toBeInTheDocument();
    expect(
      screen.queryByText("Account created, you can post and upvote now"),
    ).not.toBeInTheDocument();
  });

  it("[AC-006] [AC-009] creates the account on a valid, unused email and password, and shows it is usable immediately", async () => {
    api.POST.mockResolvedValue({
      data: { id: "new-user-1", email: "visitor@example.com" },
      error: undefined,
      response: { status: 201 },
    });
    renderScreen();
    const password = crypto.randomUUID().slice(0, 12);
    fillForm({ email: " visitor@example.com ", password, confirm: password });
    fireEvent.click(screen.getByTestId("create-account-btn"));

    expect(
      await screen.findByText("Account created, you can post and upvote now"),
    ).toBeInTheDocument();
    expect(api.POST).toHaveBeenCalledWith("/auth/register", {
      body: { email: "visitor@example.com", password },
    });
  });

  it("blocks submission when the confirmation does not match the password, and never calls the API", () => {
    renderScreen();
    const password = crypto.randomUUID().slice(0, 12);
    fillForm({ email: "visitor@example.com", password, confirm: password + "x" });
    fireEvent.click(screen.getByTestId("create-account-btn"));

    expect(screen.getByText("Passwords must match")).toBeInTheDocument();
    expect(api.POST).not.toHaveBeenCalled();
  });
});
