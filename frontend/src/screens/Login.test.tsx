import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

// openapi-fetch binds `fetch` once when the client is created (module import
// time), so stubbing global fetch per test is too late to reach it. Mocking
// the generated client itself is the seam the screen actually calls through.
vi.mock("@/api/client", () => ({
  api: { POST: vi.fn(), GET: vi.fn() },
}));

import { api } from "@/api/client";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/api";
import Screen from "./Login";

function renderScreen() {
  return render(
    <MemoryRouter>
      <Screen />
    </MemoryRouter>,
  );
}

function fillForm({ email, password }: { email: string; password: string }) {
  fireEvent.change(screen.getByTestId("email-input"), { target: { value: email } });
  fireEvent.change(screen.getByTestId("password-input"), { target: { value: password } });
}

describe("Log In", () => {
  afterEach(() => {
    vi.resetAllMocks();
    clearSessionToken();
  });

  it("renders the title and form test ids", () => {
    renderScreen();
    expect(screen.getByTestId("log-in-title")).toHaveTextContent("Log in");
    expect(screen.getByTestId("form-1")).toBeInTheDocument();
    expect(screen.getByTestId("no-account-yet-create-one-link")).toBeInTheDocument();
  });

  it("[AC-010] logs the user in and starts a session when the email and password are correct", async () => {
    api.POST.mockResolvedValue({
      data: { token: "session-token-1" },
      error: undefined,
      response: { status: 200 },
    });
    renderScreen();
    const password = crypto.randomUUID();
    fillForm({ email: "member@example.com", password });
    fireEvent.click(screen.getByTestId("log-in-btn"));

    await waitFor(() => expect(getSessionToken()).toBe("session-token-1"));
    expect(api.POST).toHaveBeenCalledWith("/auth/login", {
      body: { email: "member@example.com", password },
    });
    expect(screen.queryByText("Email or password is incorrect")).not.toBeInTheDocument();
  });

  it("[AC-011] shows the generic failure message for an incorrect password or unknown email, and starts no session", async () => {
    api.POST.mockResolvedValue({
      data: undefined,
      error: undefined,
      response: { status: 401 },
    });
    renderScreen();
    const password = crypto.randomUUID();
    fillForm({ email: "member@example.com", password });
    fireEvent.click(screen.getByTestId("log-in-btn"));

    expect(await screen.findByText("Email or password is incorrect")).toBeInTheDocument();
    expect(getSessionToken()).toBeNull();
  });

  it("[AC-012] prompts the user to log in again once their session has expired from inactivity", async () => {
    setSessionToken("stale-session-token");
    api.GET.mockResolvedValue({ data: undefined, error: undefined, response: { status: 401 } });
    renderScreen();

    expect(
      await screen.findByText("Your session has expired, please log in again"),
    ).toBeInTheDocument();
    expect(getSessionToken()).toBeNull();
  });
});
