// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { api } from "@/api/client";
import { getSessionToken } from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Empty, Input, Label, Textarea } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Plus, AlertCircle, Edit, Trash } = Icons;

const PRODUCT = "Voting ideas";
const SCREEN = "Ideas";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

// Visible messages (word for word, approved screen spec):
const MSG_NOT_AUTHOR_EDIT = "Only the author can edit this idea";

// A readable, deterministic id for a dynamic element: lower-cased words joined
// by single hyphens, kept to at most 40 characters including the suffix that
// names the kind of control (e.g. "-card", "-btn"), never cut mid-way through
// a hyphen.
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeTestId(text, suffix) {
  let slug = slugify(text);
  const max = 40 - suffix.length;
  if (slug.length > max) {
    slug = slug.slice(0, max).replace(/-+$/, "");
  }
  return `${slug}${suffix}`;
}

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
  const quietBtn = {
    backgroundColor: "transparent",
    color: brand.primaryColor,
    border: `1px solid ${brand.accentColor}`,
    borderRadius: brand.radius,
    fontFamily: brand.fontHeading,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
  };

  // Whether a session token is already on this device. A guest (no token) can
  // browse and is only ever prompted to log in or register (AC-016, AC-024);
  // nothing here claims to check the token is still valid -- an expired one
  // is caught the same way every other screen catches it, server-side.
  const [loggedIn] = React.useState(() => !!getSessionToken());

  // "loading" while GET /ideas is in flight, "error" if it failed, "ready" once
  // the board (possibly empty) is in hand. AC-003: an empty board is not an error.
  const [status, setStatus] = React.useState("loading");
  const [ideas, setIdeas] = React.useState([]);
  const [guestNotice, setGuestNotice] = React.useState(null);
  const [votedIds, setVotedIds] = React.useState(() => new Set());

  // Post-an-idea / edit-idea modal (US-006, US-007): one form, two modes.
  const [showPostModal, setShowPostModal] = React.useState(false);
  const [postMode, setPostMode] = React.useState("create");
  const [editingId, setEditingId] = React.useState(null);
  const [formTitle, setFormTitle] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formError, setFormError] = React.useState(null);
  const [formBusy, setFormBusy] = React.useState(false);

  // Delete-idea confirmation (US-008).
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

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

  const handlePostIdeaClick = () => {
    if (!loggedIn) {
      askToLogIn();
      return;
    }
    setPostMode("create");
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setFormError(null);
    setShowPostModal(true);
  };

  const openEditModal = (idea) => {
    if (!loggedIn) {
      askToLogIn();
      return;
    }
    setPostMode("edit");
    setEditingId(idea.id);
    setFormTitle(idea.title);
    setFormDescription(idea.description);
    setFormError(null);
    setShowPostModal(true);
  };

  const closePostModal = () => {
    if (formBusy) return;
    setShowPostModal(false);
    setFormError(null);
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    if (formBusy) return;

    const title = formTitle.trim();
    const description = formDescription.trim();
    // AC-015 / AC-019: empty or over-length text is rejected, nothing is sent.
    if (!title || !description) {
      setFormError("Title and description are required");
      return;
    }
    if (title.length > TITLE_MAX || description.length > DESCRIPTION_MAX) {
      setFormError("Title or description is too long");
      return;
    }

    setFormError(null);
    setFormBusy(true);
    try {
      if (postMode === "edit" && editingId) {
        const { data, error, response } = await api.PATCH(`/ideas/${editingId}`, {
          body: { title, description },
        });
        if (error || !data) {
          setFormBusy(false);
          // AC-018 / NFR-006: a non-author's edit is refused, worded exactly as the
          // approved screen states it; anything else falls back to a generic retry.
          setFormError(
            response && response.status === 403
              ? MSG_NOT_AUTHOR_EDIT
              : "Could not save your changes. Please try again.",
          );
          return;
        }
        setIdeas((prev) =>
          prev.map((idea) => (idea.id === editingId ? { ...idea, title, description } : idea)),
        );
      } else {
        const { data, error } = await api.POST("/ideas", {
          body: { title, description },
        });
        if (error || !data) {
          setFormBusy(false);
          setFormError("Could not post your idea. Please try again.");
          return;
        }
        setIdeas((prev) => [
          {
            id: data.id,
            title: data.title,
            description: data.description,
            upvoteCount: data.upvoteCount ?? 0,
          },
          ...prev,
        ]);
      }
      setFormBusy(false);
      setShowPostModal(false);
    } catch {
      setFormBusy(false);
      setFormError("Could not reach the server. Please try again.");
    }
  };

  const closeDeleteModal = () => {
    if (deleteBusy) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteBusy) return;
    setDeleteBusy(true);
    try {
      const { error } = await api.DELETE(`/ideas/${deleteTarget.id}`);
      if (error) {
        setDeleteBusy(false);
        return;
      }
      // AC-020: the idea and its upvotes are gone from the public list at once.
      setIdeas((prev) => prev.filter((idea) => idea.id !== deleteTarget.id));
      setDeleteBusy(false);
      setDeleteTarget(null);
    } catch {
      setDeleteBusy(false);
    }
  };

  const handleUpvote = async (idea) => {
    if (!loggedIn) {
      // AC-024: a visitor who is not logged in is refused and prompted instead.
      askToLogIn();
      return;
    }
    try {
      const { data, error } = await api.POST(`/ideas/${idea.id}/vote`, { body: {} });
      if (error || !data) return;
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === idea.id ? { ...i, upvoteCount: data.voteCount ?? i.upvoteCount } : i,
        ),
      );
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (data.voted) next.add(idea.id);
        else next.delete(idea.id);
        return next;
      });
    } catch {
      // Network error: leave the count exactly as it was.
    }
  };

  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-8 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
      style={{ color: brand.primaryColor, fontFamily: brand.fontBody }}
    >
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
              onClick={handlePostIdeaClick}
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

      <section aria-labelledby="all-ideas" className="p-6 sm:p-7 lg:p-8" style={frame}>
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
          <ul
            data-testid="all-ideas-list"
            className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6"
          >
            {ideas.map((idea, index) => {
              const cardTestId = makeTestId(`${idea.title} posted by a board member`, "-card");
              const upvoteTestId = makeTestId(`Upvoted ${idea.upvoteCount}`, "-btn");
              const alreadyVoted = votedIds.has(idea.id);
              return (
                <li
                  key={idea.id}
                  data-testid={cardTestId}
                  className="min-w-0"
                  style={{ border: `1px solid ${brand.accentColor}66`, borderRadius: brand.radius }}
                >
                  <div className="flex w-full items-start gap-4 px-3 py-4 text-left sm:items-center">
                    <span
                      className="w-8 shrink-0 text-center text-xs"
                      style={{ ...num, color: brand.accentColor, fontFamily: brand.fontHeading }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-xs sm:text-sm" style={caps}>
                        {idea.title}
                      </span>
                      <span
                        className="mt-1 block break-words text-[11px] leading-relaxed"
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
                  <div className="flex flex-wrap items-center gap-2 px-3 pb-4">
                    <Button
                      type="button"
                      data-testid={upvoteTestId}
                      onClick={() => handleUpvote(idea)}
                      className="px-3 py-1.5 text-[10px]"
                      style={alreadyVoted ? primaryBtn : quietBtn}
                    >
                      {alreadyVoted ? "Upvoted" : "Upvote"}
                    </Button>
                    {loggedIn ? (
                      <>
                        <Button
                          type="button"
                          data-testid="edit-btn"
                          onClick={() => openEditModal(idea)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px]"
                          style={quietBtn}
                        >
                          <Edit size={12} aria-hidden />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          data-testid="delete-btn"
                          onClick={() => setDeleteTarget(idea)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px]"
                          style={quietBtn}
                        >
                          <Trash size={12} aria-hidden />
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
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

      {showPostModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: `${brand.primaryColor}99` }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePostModal();
          }}
        >
          <div
            data-testid="post-an-idea-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-idea-title"
            className="w-full max-w-md p-6"
            style={{ ...frame, backgroundColor: brand.backgroundColor }}
          >
            <h2 id="post-idea-title" className="text-center text-xl" style={caps}>
              {postMode === "edit" ? "Edit idea" : "Post an idea"}
            </h2>

            <div aria-live="polite">
              {formError ? (
                <p
                  role="alert"
                  className="mt-4 flex items-start gap-2 px-3 py-2 text-[12px]"
                  style={{ border: `1px solid ${brand.accentColor}`, color: brand.primaryColor }}
                >
                  <AlertCircle size={14} aria-hidden />
                  <span>{formError}</span>
                </p>
              ) : null}
            </div>

            <form
              data-testid="form-1"
              className="mt-5 space-y-4"
              onSubmit={handlePublish}
              noValidate
            >
              <div>
                <Label htmlFor="idea-title">Title</Label>
                <Input
                  data-testid="title-input"
                  id="idea-title"
                  name="title"
                  value={formTitle}
                  disabled={formBusy}
                  onChange={(event) => setFormTitle(event.target.value)}
                  className="mt-2 w-full"
                />
              </div>
              <div>
                <Label htmlFor="idea-description">Short description</Label>
                <Textarea
                  data-testid="short-description-input"
                  id="idea-description"
                  name="description"
                  value={formDescription}
                  disabled={formBusy}
                  onChange={(event) => setFormDescription(event.target.value)}
                  className="mt-2 w-full"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <Button
                  type="submit"
                  data-testid="publish-idea-btn"
                  disabled={formBusy}
                  aria-busy={formBusy}
                  style={primaryBtn}
                  className="w-full px-4 py-2.5 text-[11px]"
                >
                  {formBusy
                    ? postMode === "edit"
                      ? "Saving…"
                      : "Publishing…"
                    : postMode === "edit"
                      ? "Save changes"
                      : "Publish idea"}
                </Button>
                <Button
                  type="button"
                  data-testid="cancel-btn"
                  disabled={formBusy}
                  onClick={closePostModal}
                  style={quietBtn}
                  className="w-full px-4 py-2.5 text-[11px]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: `${brand.primaryColor}99` }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeleteModal();
          }}
        >
          <div
            data-testid="delete-this-idea-its-upvotes-are-r-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-idea-title"
            className="w-full max-w-md p-6 text-center"
            style={{ ...frame, backgroundColor: brand.backgroundColor }}
          >
            <h2 id="delete-idea-title" className="text-xl" style={caps}>
              Delete this idea? Its upvotes are removed too.
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: brand.neutralColor }}>
              “{deleteTarget.title}” and every vote cast on it will be gone from the board. This
              cannot be undone.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                data-testid="delete-idea-btn"
                disabled={deleteBusy}
                aria-busy={deleteBusy}
                onClick={confirmDelete}
                style={primaryBtn}
                className="w-full px-4 py-2.5 text-[11px]"
              >
                {deleteBusy ? "Deleting…" : "Delete idea"}
              </Button>
              <Button
                type="button"
                data-testid="keep-idea-btn"
                disabled={deleteBusy}
                onClick={closeDeleteModal}
                style={quietBtn}
                className="w-full px-4 py-2.5 text-[11px]"
              >
                Keep idea
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
