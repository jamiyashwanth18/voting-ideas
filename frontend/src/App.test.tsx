import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

// openapi-fetch binds `fetch` once when the client is created (module import
// time), so stubbing global fetch per test is too late to reach it. Mocking
// the generated client itself is the seam the screen actually calls through.
vi.mock("@/api/client", () => ({
  api: { GET: vi.fn(), POST: vi.fn() },
}));

import { api } from "@/api/client";
import { getSessionToken, setSessionToken } from "@/lib/api";
import App from "./App";

describe("App", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders a screen inside the app shell and shows its menu", () => {
    api.GET.mockResolvedValue({ data: [], error: undefined });
    render(
      <MemoryRouter initialEntries={["/ideas"]}>
        <App />
      </MemoryRouter>,
    );
    // getAllByText, not getByText: the page may repeat its menu item's text.
    expect(screen.getAllByText("Ideas").length).toBeGreaterThan(0);
  });

  it("[AC-013] revokes the session server-side, clears it locally and returns to the login screen when the user logs out", async () => {
    api.GET.mockResolvedValue({ data: [], error: undefined });
    api.POST.mockResolvedValue({ data: {}, error: undefined, response: { status: 204 } });
    setSessionToken(crypto.randomUUID());

    render(
      <MemoryRouter initialEntries={["/ideas"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("log-out-btn"));

    await waitFor(() => expect(api.POST).toHaveBeenCalledWith("/auth/logout"));
    await waitFor(() => expect(getSessionToken()).toBeNull());
    expect(await screen.findByTestId("log-in-title")).toBeInTheDocument();
  });

  it("[AC-013] still ends the session locally and returns to the login screen when the logout call fails", async () => {
    api.GET.mockResolvedValue({ data: [], error: undefined });
    api.POST.mockRejectedValue(new Error("network down"));
    setSessionToken(crypto.randomUUID());

    render(
      <MemoryRouter initialEntries={["/ideas"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("log-out-btn"));

    await waitFor(() => expect(getSessionToken()).toBeNull());
    expect(await screen.findByTestId("log-in-title")).toBeInTheDocument();
  });
});
