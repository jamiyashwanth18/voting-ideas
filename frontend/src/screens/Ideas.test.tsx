import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

// openapi-fetch binds `fetch` once when the client is created (module import
// time), so stubbing global fetch per test is too late to reach it. Mocking
// the generated client itself is the seam the screen actually calls through.
vi.mock("@/api/client", () => ({
  api: { GET: vi.fn() },
}));

import { api } from "@/api/client";
import Screen from "./Ideas";

function renderScreen() {
  return render(
    <MemoryRouter>
      <Screen />
    </MemoryRouter>,
  );
}

describe("Idea Board", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("[AC-001] lists every idea ranked highest upvotes first, each with its title, description and upvote count", async () => {
    api.GET.mockResolvedValue({
      data: [
        {
          id: "idea-1",
          title: "Dark mode for the board",
          description: "A low-light theme for night reading.",
          upvoteCount: 42,
        },
        {
          id: "idea-2",
          title: "Export all ideas to CSV",
          description: "One download with every idea.",
          upvoteCount: 8,
        },
      ],
      error: undefined,
    });
    renderScreen();

    const list = await screen.findByTestId("all-ideas-list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);

    expect(within(items[0]).getByText("Dark mode for the board")).toBeInTheDocument();
    expect(within(items[0]).getByText("A low-light theme for night reading.")).toBeInTheDocument();
    expect(within(items[0]).getByText("42")).toBeInTheDocument();

    expect(within(items[1]).getByText("Export all ideas to CSV")).toBeInTheDocument();
    expect(within(items[1]).getByText("8")).toBeInTheDocument();
  });

  it("[AC-002] keeps the server's own order for ideas tied on upvote count, stable across reloads", async () => {
    api.GET.mockResolvedValue({
      data: [
        {
          id: "idea-b",
          title: "Posted second, tied at ten",
          description: "Second in the tie.",
          upvoteCount: 10,
        },
        {
          id: "idea-a",
          title: "Posted first, tied at ten",
          description: "First in the tie.",
          upvoteCount: 10,
        },
      ],
      error: undefined,
    });
    renderScreen();

    const list = await screen.findByTestId("all-ideas-list");
    const items = within(list).getAllByRole("listitem");
    // The board never re-sorts a tie itself: the order it shows is exactly the
    // order the server returned, so a reload cannot shuffle it.
    expect(within(items[0]).getByText("Posted second, tied at ten")).toBeInTheDocument();
    expect(within(items[1]).getByText("Posted first, tied at ten")).toBeInTheDocument();
  });

  it("[AC-003] shows the empty-state message when no ideas have been posted, and no error", async () => {
    api.GET.mockResolvedValue({ data: [], error: undefined });
    renderScreen();

    expect(
      await screen.findByTestId("no-ideas-yet-be-the-first-to-post-empty"),
    ).toBeInTheDocument();
    expect(screen.getByText("No ideas yet. Be the first to post one.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("[AC-001] shows an error state rather than crashing when the board fails to load", async () => {
    api.GET.mockResolvedValue({ data: undefined, error: { detail: "down" } });
    renderScreen();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The board could not be loaded. Try reloading the page.",
    );
  });

  it("shows the guest log-in-or-register link that sends a visitor to the login screen", async () => {
    api.GET.mockResolvedValue({ data: [], error: undefined });
    renderScreen();
    await screen.findByTestId("no-ideas-yet-be-the-first-to-post-empty");

    const link = screen.getByTestId("log-in-or-register-to-post-and-upvo-link");
    expect(link).toHaveTextContent("Log in or register to post and upvote");
  });

  it("asks a guest to log in or register when they try to post an idea", async () => {
    api.GET.mockResolvedValue({ data: [], error: undefined });
    renderScreen();
    await screen.findByTestId("no-ideas-yet-be-the-first-to-post-empty");

    fireEvent.click(screen.getByTestId("post-an-idea-btn"));
    expect(await screen.findByText("Log in or register to post an idea")).toBeInTheDocument();
  });
});
