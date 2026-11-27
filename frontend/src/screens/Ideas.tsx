// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { api } from "@/api/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Plus, AlertCircle } = Icons;

const PRODUCT = "Voting ideas";
const SCREEN = "Ideas";

export default function Screen() {
  const navigate = useNavigate();
  const caps = {
    fontFamily: brand.fontHeading,
    textTransform: "uppercase",
    letterSpacing: "0.3em",
  };
  const num = { fontVariantNumeric: "tabular-nums" };
  const frame = {
    border: `1px solid ${brand.accentColor}`,
    outline: `1px solid ${brand.primaryColor}`,
    outlineOffset: 3,
    borderRadius: brand.radius,
  };
  const primaryBtn = {
    backgroundColor: brand.primaryColor,
    color: brand.accentColor,
    border: `1px solid ${brand.primaryColor}`,
    borderRadius: brand.radius,
    fontFamily: brand.fontHeading,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
  };

  // "loading" while GET /ideas is in flight, "error" if it failed, "ready" once
  // the board (possibly empty) is in hand. AC-003: an empty board is not an error.
  const [status, setStatus] = React.useState("loading");
  const [ideas, setIdeas] = React.useState([]);
  const [guestNotice, setGuestNotice] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    setStatus("loading");
    api
      .GET("/ideas")
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) {
          setStatus("error");
          return;
        }
        // The server ranks by upvote count with its own deterministic tie-break
        // (NFR-010); the board shows that order as given, never re-sorts it.
        setIdeas(data);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const rule = (
    <div aria-hidden className="flex items-center gap-3">
      <span className="h-px flex-1" style={{ backgroundColor: brand.accentColor }} />
      <span className="text-xs" style={{ color: brand.accentColor }}>
        ◆
      </span>
      <span className="h-px flex-1" style={{ backgroundColor: brand.accentColor }} />
    </div>
  );

  const askToLogIn = () => {
    setGuestNotice("Log in or register to post an idea");
  };

  return (
    <div className="space-y-8" style={{ color: brand.primaryColor, fontFamily: brand.fontBody }}>
      <header className="space-y-5">
        <div className="grid grid-cols-12 items-end gap-5">
          <div className="col-span-12 text-center sm:col-span-8 sm:text-left">
            <h1 data-testid="ideas-title" className="text-3xl" style={caps}>
              {SCREEN}
            </h1>
            <p
              className="mt-2 text-[10px] uppercase tracking-[0.35em]"
              style={{ ...num, color: brand.neutralColor }}
            >
              {PRODUCT} — {status === "ready" ? ideas.length : 0} on the board
            </p>
          </div>
          <div className="col-span-12 sm:col-span-4 sm:justify-self-end">
            <Button
              data-testid="post-an-idea-btn"
              onClick={askToLogIn}
              className="flex h-11 w-full items-center justify-center gap-2 px-6 text-[11px] sm:w-auto"
              style={primaryBtn}
            >
              <Plus size={14} aria-hidden />
              Post an idea
            </Button>
          </div>
        </div>
        <p
          className="mx-auto max-w-2xl text-center text-sm leading-relaxed"
          style={{ color: brand.neutralColor }}
        >
          Ranked by upvotes, highest first. Anyone can browse; log in to vote or post.
        </p>
        {rule}
        <div aria-live="polite">
          {guestNotice ? (
            <p
              className="mx-auto flex max-w-2xl items-start justify-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.18em]"
              style={{
                border: `1px solid ${brand.accentColor}`,
                color: brand.primaryColor,
                backgroundColor: `${brand.accentColor}22`,
              }}
            >
              <span className="mt-px shrink-0" aria-hidden>
                <AlertCircle size={14} />
              </span>
              <span>{guestNotice}</span>
            </p>
          ) : null}
        </div>
      </header>

      <section aria-labelledby="all-ideas" className="p-6 sm:p-7" style={frame}>
        <div className="text-center">
          <h2 id="all-ideas" className="text-sm" style={caps}>
            All ideas
          </h2>
          <div
            aria-hidden
            className="mx-auto mt-3 h-px w-12"
            style={{ backgroundColor: brand.accentColor }}
          />
        </div>

        {status === "loading" ? (
          <p
            className="mt-6 text-center text-sm"
            style={{ color: brand.neutralColor }}
            role="status"
          >
            Loading ideas…
          </p>
        ) : status === "error" ? (
          <p
            className="mt-6 text-center text-sm"
            style={{ color: brand.primaryColor }}
            role="alert"
          >
            The board could not be loaded. Try reloading the page.
          </p>
        ) : ideas.length === 0 ? (
          <div data-testid="no-ideas-yet-be-the-first-to-post-empty" className="mt-6">
            <Empty
              title="No ideas yet. Be the first to post one."
              description="The board is empty. Once someone posts an idea it appears here, ranked by upvotes."
            />
          </div>
        ) : (
          <ul data-testid="all-ideas-list" className="mt-5">
            {ideas.map((idea, index) => (
              <li
                key={idea.id}
                style={{ borderTop: index === 0 ? "none" : `1px solid ${brand.accentColor}66` }}
              >
                <div className="flex w-full items-center gap-4 px-2 py-4 text-left">
                  <span
                    className="w-8 shrink-0 text-center text-xs"
                    style={{ ...num, color: brand.accentColor, fontFamily: brand.fontHeading }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs sm:text-sm" style={caps}>
                      {idea.title}
                    </span>
                    <span
                      className="mt-1 block text-[11px] leading-relaxed"
                      style={{ color: brand.neutralColor }}
                    >
                      {idea.description}
                    </span>
                  </span>
                  <span
                    className="flex shrink-0 items-center gap-2 text-sm"
                    style={{ ...num, color: brand.neutralColor }}
                  >
                    <span className="font-semibold">{idea.upvoteCount}</span>
                    <span className="hidden text-[10px] uppercase tracking-[0.2em] sm:inline">
                      upvotes
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="space-y-4">
        {rule}
        <p
          className="text-center text-[11px] uppercase tracking-[0.2em]"
          style={{ color: brand.neutralColor }}
        >
          Browsing as a guest.{" "}
          <button
            type="button"
            data-testid="log-in-or-register-to-post-and-upvo-link"
            onClick={() => navigate("login")}
            className="underline underline-offset-4 transition-opacity duration-200 hover:opacity-70"
            style={{ color: brand.primaryColor, letterSpacing: "0.2em" }}
          >
            Log in or register to post and upvote
          </button>
        </p>
      </div>
    </div>
  );
}
