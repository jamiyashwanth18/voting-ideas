// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Textarea, Label, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Plus, Check, X, Clock, Trash, Edit, AlertCircle, CheckCircle } = Icons;

const PRODUCT = "Voting ideas";
const SCREEN = "Ideas";

const TITLE_MAX = 80;
const DESC_MAX = 240;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const VIEWER = { id: "u-ada", email: "ada@example.com" };

const SEED_IDEAS = [
  {
    id: "idea-7",
    author_id: "u-ada",
    author_email: "ada@example.com",
    title: "Dark mode for the board",
    description: "A low-light theme so the board is comfortable to read at night on phone and desktop.",
    created_at: "2026-11-12",
    votes: 42,
    voted: true,
  },
  {
    id: "idea-3",
    author_id: "u-marcus",
    author_email: "marcus@example.com",
    title: "Keyboard shortcuts for voting",
    description: "J and K to move through the list, V to cast an upvote, so a long board can be read without reaching for the mouse.",
    created_at: "2026-11-02",
    votes: 31,
    voted: false,
  },
  {
    id: "idea-11",
    author_id: "u-nadia",
    author_email: "nadia@example.com",
    title: "Export all ideas to CSV",
    description: "One download with every idea and its upvote count, so the board can be taken into Monday planning.",
    created_at: "2026-11-19",
    votes: 31,
    voted: true,
  },
  {
    id: "idea-2",
    author_id: "u-ada",
    author_email: "ada@example.com",
    title: "Weekly digest of top ideas",
    description: "A Friday summary of the five ideas that climbed the most that week, kept to one short screen.",
    created_at: "2026-10-28",
    votes: 8,
    voted: false,
  },
  {
    id: "idea-14",
    author_id: "u-soren",
    author_email: "soren@example.com",
    title: "Let authors pin a status update",
    description: "A single line at the top of your own idea, such as shipped or under review, so readers know where it stands.",
    created_at: "2026-11-24",
    votes: 0,
    voted: false,
  },
];

export default function Screen() {
  const navigate = useNavigate();
  const frame = { border: `1px solid ${brand.accentColor}`, outline: `1px solid ${brand.primaryColor}`, outlineOffset: 3, borderRadius: brand.radius };
  const caps = { fontFamily: brand.fontHeading, textTransform: "uppercase", letterSpacing: "0.3em" };
  const num = { fontVariantNumeric: "tabular-nums" };

  const [session] = React.useState(VIEWER);
  const [ideas, setIdeas] = React.useState(SEED_IDEAS);
  const [selectedId, setSelectedId] = React.useState(SEED_IDEAS[0].id);
  const [boardNotice, setBoardNotice] = React.useState(null);
  const [actionNotice, setActionNotice] = React.useState(null);

  const [postOpen, setPostOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [draft, setDraft] = React.useState({ title: "", description: "" });
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [formError, setFormError] = React.useState(null);
  const [pending, setPending] = React.useState(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const timers = React.useRef([]);
  const titleRef = React.useRef(null);
  const postBtnRef = React.useRef(null);
  const deleteBtnRef = React.useRef(null);
  const keepBtnRef = React.useRef(null);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  React.useEffect(() => {
    if (!postOpen && !deleteOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (postOpen && !pending) closePost();
      if (deleteOpen && !deleting) closeDelete();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  React.useEffect(() => {
    if (postOpen && titleRef.current) titleRef.current.focus();
  }, [postOpen]);

  React.useEffect(() => {
    if (deleteOpen && keepBtnRef.current) keepBtnRef.current.focus();
  }, [deleteOpen]);

  const fmtDate = (iso) => {
    const parts = String(iso).split("-");
    return `${Number(parts[2])} ${MONTHS[Number(parts[1]) - 1]} ${parts[0]}`;
  };

  const ranked = ideas
    .slice()
    .sort((a, b) => b.votes - a.votes || (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id < b.id ? -1 : 1));

  const selected = ranked.find((i) => i.id === selectedId) || ranked[0] || null;
  const isAuthor = !!(session && selected && selected.author_id === session.id);

  const heart = (filled) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
      <path d="M12 20.5S4.5 15.9 4.5 10.6A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7.5 2.2c0 5.3-7.5 9.9-7.5 9.9z" />
    </svg>
  );

  const rule = (
    <div aria-hidden className="flex items-center gap-3">
      <span className="h-px flex-1" style={{ backgroundColor: brand.accentColor }} />
      <span className="text-xs" style={{ color: brand.accentColor }}>◆</span>
      <span className="h-px flex-1" style={{ backgroundColor: brand.accentColor }} />
    </div>
  );

  const primaryBtn = {
    backgroundColor: brand.primaryColor,
    color: brand.accentColor,
    border: `1px solid ${brand.primaryColor}`,
    borderRadius: brand.radius,
    fontFamily: brand.fontHeading,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
  };
  const ghostBtn = {
    backgroundColor: "transparent",
    color: brand.primaryColor,
    border: `1px solid ${brand.accentColor}`,
    borderRadius: brand.radius,
    fontFamily: brand.fontHeading,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
  };

  const fieldStyle = (bad) => ({
    backgroundColor: "transparent",
    border: `1px solid ${bad ? brand.primaryColor : brand.accentColor}`,
    borderRadius: brand.radius,
    color: brand.primaryColor,
  });

  const openPost = () => {
    if (!session) {
      setActionNotice({ tone: "auth", text: "Posting needs an account. Log in or register, then your idea goes straight on the board." });
      return;
    }
    setEditingId(null);
    setDraft({ title: "", description: "" });
    setFieldErrors({});
    setFormError(null);
    setPostOpen(true);
  };

  const openEdit = () => {
    if (!selected) return;
    if (!isAuthor) {
      setActionNotice({ tone: "denied", text: `Only ${selected.author_email} can edit or delete this idea. Ask them, or post your own version.` });
      return;
    }
    setEditingId(selected.id);
    setDraft({ title: selected.title, description: selected.description });
    setFieldErrors({});
    setFormError(null);
    setPostOpen(true);
  };

  const closePost = () => {
    setPostOpen(false);
    setPending(false);
    if (postBtnRef.current) postBtnRef.current.focus();
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleting(false);
    if (deleteBtnRef.current) deleteBtnRef.current.focus();
  };

  const validate = () => {
    const errs = {};
    const title = draft.title.trim();
    const description = draft.description.trim();
    if (!title) errs.title = "An idea needs a title. One line is plenty.";
    else if (title.length > TITLE_MAX) errs.title = `Titles run to ${TITLE_MAX} characters. Trim ${title.length - TITLE_MAX}.`;
    if (!description) errs.description = "Say what the idea does, in a sentence or two.";
    else if (description.length > DESC_MAX) errs.description = `Descriptions run to ${DESC_MAX} characters. Trim ${description.length - DESC_MAX}.`;
    return errs;
  };

  const submitIdea = (e) => {
    e.preventDefault();
    if (pending) return;
    setFormError(null);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    const title = draft.title.trim();
    const description = draft.description.trim();
    const clash = ideas.find((i) => i.id !== editingId && i.title.toLowerCase() === title.toLowerCase());
    if (clash) {
      setFormError(`“${clash.title}” is already on the board with ${clash.votes} upvotes. Give yours a different title, or upvote that one instead.`);
      return;
    }

    setPending(true);
    later(() => {
      if (editingId) {
        setIdeas((list) => list.map((i) => (i.id === editingId ? { ...i, title, description, updated_at: "2026-11-27" } : i)));
        setSelectedId(editingId);
        setBoardNotice({ tone: "success", text: `Saved. “${title}” now reads the way you wrote it.` });
      } else {
        const id = `idea-${Math.floor(Math.random() * 900) + 100}`;
        setIdeas((list) => [
          ...list,
          { id, author_id: session.id, author_email: session.email, title, description, created_at: "2026-11-27", votes: 0, voted: false },
        ]);
        setSelectedId(id);
        setBoardNotice({ tone: "success", text: `Published. “${title}” is on the board with 0 upvotes — it climbs as people vote.` });
      }
      setActionNotice(null);
      setPending(false);
      setPostOpen(false);
      if (postBtnRef.current) postBtnRef.current.focus();
    }, 480);
  };

  const toggleVote = () => {
    if (!selected) return;
    if (!session) {
      setActionNotice({ tone: "auth", text: "Voting needs an account — one upvote per person per idea. Log in or register to add yours." });
      return;
    }
    setActionNotice(null);
    setIdeas((list) => list.map((i) => (i.id === selected.id ? { ...i, voted: !i.voted, votes: i.voted ? i.votes - 1 : i.votes + 1 } : i)));
  };

  const askDelete = () => {
    if (!selected) return;
    if (!isAuthor) {
      setActionNotice({ tone: "denied", text: `Only ${selected.author_email} can edit or delete this idea. Ask them, or post your own version.` });
      return;
    }
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!selected) return;
    setDeleting(true);
    later(() => {
      const gone = selected;
      const rest = ranked.filter((i) => i.id !== gone.id);
      setIdeas((list) => list.filter((i) => i.id !== gone.id));
      setSelectedId(rest.length ? rest[0].id : null);
      setBoardNotice({ tone: "success", text: `Deleted. “${gone.title}” and its ${gone.votes} upvotes are off the board.` });
      setActionNotice(null);
      setDeleting(false);
      setDeleteOpen(false);
      if (postBtnRef.current) postBtnRef.current.focus();
    }, 420);
  };

  const noticeBar = (notice, wf) =>
    notice ? (
      <p
        data-wf={wf}
        className="deco-enter flex items-start gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.18em]"
        style={{ border: `1px solid ${brand.accentColor}`, color: brand.primaryColor, backgroundColor: `${brand.accentColor}22` }}
      >
        <span className="mt-px shrink-0" aria-hidden>
          {notice.tone === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
        </span>
        <span>
          <span className="font-semibold">{notice.tone === "success" ? "Done — " : notice.tone === "denied" ? "Not yours — " : "Account needed — "}</span>
          {notice.text}
        </span>
      </p>
    ) : null;

  return (
    <div
      className="space-y-8"
      style={{ color: brand.primaryColor, fontFamily: brand.fontBody, "--deco-accent": brand.accentColor, "--deco-primary": brand.primaryColor }}
    >
      <style>{`
        .deco-focus:focus-visible { outline: 2px solid var(--deco-primary); outline-offset: 3px; }
        .deco-row:hover { background-color: color-mix(in srgb, var(--deco-accent) 16%, transparent); }
        @keyframes deco-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes deco-veil { from { opacity: 0; } to { opacity: 1; } }
        .deco-enter { animation: deco-rise .28s ease-out both; }
        .deco-veil { animation: deco-veil .2s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .deco-enter, .deco-veil { animation: none; } }
      `}</style>

      <header className="space-y-5">
        <div className="grid grid-cols-12 items-end gap-5">
          <div data-wf="b-0-0" className="col-span-12 text-center sm:col-span-8 sm:text-left">
            <h1 className="text-3xl" style={caps}>{SCREEN}</h1>
            <p className="mt-2 text-[10px] uppercase tracking-[0.35em]" style={{ ...num, color: brand.neutralColor }}>
              {PRODUCT} — {ranked.length} on the board
            </p>
          </div>
          <div className="col-span-12 sm:col-span-4 sm:justify-self-end">
            <Button
              data-wf="b-0-1"
              ref={postBtnRef}
              onClick={openPost}
              className="deco-focus flex h-11 w-full items-center justify-center gap-2 px-6 text-[11px] sm:w-auto"
              style={primaryBtn}
            >
              <Plus size={14} aria-hidden />
              Post an idea
            </Button>
          </div>
        </div>
        <p data-wf="b-1-0" className="mx-auto max-w-2xl text-center text-sm leading-relaxed" style={{ color: brand.neutralColor }}>
          Ranked by upvotes, highest first. Anyone can browse; log in to vote or post.
        </p>
        {rule}
      </header>

      <section data-wf="b-2-0" aria-labelledby="all-ideas" className="p-6 sm:p-7" style={frame}>
        <div className="text-center">
          <h2 id="all-ideas" className="text-sm" style={caps}>All ideas</h2>
          <div aria-hidden className="mx-auto mt-3 h-px w-12" style={{ backgroundColor: brand.accentColor }} />
        </div>

        <div className="mt-5 space-y-4" aria-live="polite">{noticeBar(boardNotice)}</div>

        {ranked.length === 0 ? (
          <div data-wf="b-7-0" className="deco-enter mt-6">
            <Empty
              title="No ideas yet. Be the first to post one."
              description="The board is empty. Post an idea with a title and a short description and it appears here straight away, starting at zero upvotes."
            />
          </div>
        ) : (
          <ul className="mt-5">
            {ranked.map((idea, index) => {
              const active = selected && idea.id === selected.id;
              return (
                <li key={idea.id} className="deco-enter" style={{ borderTop: index === 0 ? "none" : `1px solid ${brand.accentColor}66` }}>
                  <button
                    type="button"
                    data-wf={`i-2-0-${index}`}
                    onClick={() => {
                      setSelectedId(idea.id);
                      setActionNotice(null);
                    }}
                    aria-current={active ? "true" : undefined}
                    className="deco-focus deco-row flex w-full items-center gap-4 px-2 py-4 text-left transition-colors duration-200"
                    style={{ backgroundColor: active ? `${brand.accentColor}26` : "transparent", borderRadius: brand.radius }}
                  >
                    <span className="w-8 shrink-0 text-center text-xs" style={{ ...num, color: brand.accentColor, fontFamily: brand.fontHeading }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs sm:text-sm" style={caps}>{idea.title}</span>
                      <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.2em]" style={{ ...num, color: brand.neutralColor }}>
                        {idea.author_email} — {fmtDate(idea.created_at)}
                        {active ? " — viewing" : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-sm" style={{ ...num, color: idea.voted ? brand.primaryColor : brand.neutralColor }}>
                      {heart(idea.voted)}
                      <span className="font-semibold">{idea.votes}</span>
                      <span className="hidden text-[10px] uppercase tracking-[0.2em] sm:inline">upvotes</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {selected ? (
        <section aria-labelledby="idea-detail" className="p-6 text-center sm:p-8" style={frame}>
          <div data-wf="b-3-0">
            <span
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg"
              style={{ border: `1px solid ${brand.accentColor}`, fontFamily: brand.fontHeading, color: brand.accentColor }}
              aria-hidden
            >
              {selected.author_email[0].toUpperCase()}
            </span>
            <h2 id="idea-detail" className="mt-4 text-sm sm:text-base" style={caps}>{selected.title}</h2>
            <div aria-hidden className="mx-auto mt-3 h-px w-12" style={{ backgroundColor: brand.accentColor }} />
            <p className="mt-3 text-[10px] uppercase tracking-[0.25em]" style={{ ...num, color: brand.neutralColor }}>
              posted by {selected.author_email} — {fmtDate(selected.created_at)}
              {selected.updated_at ? ` — edited ${fmtDate(selected.updated_at)}` : ""}
            </p>
          </div>

          <p data-wf="b-4-0" className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed" style={{ color: brand.primaryColor }}>
            {selected.description}
          </p>

          <div className="mt-7 grid grid-cols-12 gap-3">
            <Button
              data-wf="b-5-0"
              onClick={toggleVote}
              aria-pressed={selected.voted}
              className="deco-focus col-span-12 flex h-11 items-center justify-center gap-2 px-5 text-[11px] transition-colors duration-200 sm:col-span-4"
              style={selected.voted ? primaryBtn : ghostBtn}
            >
              {heart(selected.voted)}
              <span style={num}>{selected.voted ? "Upvoted" : "Upvote"} · {selected.votes}</span>
            </Button>
            <Button
              data-wf="b-5-1"
              onClick={openEdit}
              disabled={!isAuthor}
              aria-disabled={!isAuthor}
              className="deco-focus col-span-12 flex h-11 items-center justify-center gap-2 px-5 text-[11px] disabled:opacity-45 sm:col-span-4"
              style={ghostBtn}
            >
              <Edit size={14} aria-hidden />
              Edit
            </Button>
            <Button
              data-wf="b-5-2"
              ref={deleteBtnRef}
              onClick={askDelete}
              disabled={!isAuthor}
              aria-disabled={!isAuthor}
              className="deco-focus col-span-12 flex h-11 items-center justify-center gap-2 px-5 text-[11px] disabled:opacity-45 sm:col-span-4"
              style={ghostBtn}
            >
              <Trash size={14} aria-hidden />
              Delete
            </Button>
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-[0.2em]" style={{ color: brand.neutralColor }}>
            {isAuthor ? "Your idea — edit or delete it any time." : `Authored by ${selected.author_email}; only they can edit or delete it.`}
          </p>

          <div className="mx-auto mt-4 max-w-2xl text-left" aria-live="polite">{noticeBar(actionNotice)}</div>
        </section>
      ) : null}

      <div className="space-y-4">
        {rule}
        <p data-wf="b-6-0" className="text-center text-[11px] uppercase tracking-[0.2em]" style={{ color: brand.neutralColor }}>
          {session ? `Voting as ${session.email}. Someone else at this desk? ` : "Browsing as a guest. "}
          <button
            type="button"
            onClick={() => navigate("login")}
            className="deco-focus underline underline-offset-4 transition-opacity duration-200 hover:opacity-70"
            style={{ color: brand.primaryColor, letterSpacing: "0.2em" }}
          >
            Log in or register to post and upvote
          </button>
        </p>
      </div>

      {postOpen ? (
        <div className="deco-veil fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8" style={{ backgroundColor: `${brand.primaryColor}bf` }}>
          <div
            data-wf="b-8-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-modal-title"
            className="deco-enter w-full max-w-xl p-6 shadow-2xl sm:p-8"
            style={{ ...frame, backgroundColor: brand.backgroundColor }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="post-modal-title" className="flex-1 text-center text-sm" style={caps}>
                {editingId ? "Edit idea" : "Post an idea"}
              </h2>
              <button
                type="button"
                onClick={closePost}
                disabled={pending}
                aria-label="Close the post an idea dialog"
                className="deco-focus flex h-8 w-8 items-center justify-center disabled:opacity-45"
                style={{ border: `1px solid ${brand.accentColor}`, borderRadius: brand.radius }}
              >
                <X size={14} aria-hidden />
              </button>
            </div>
            <div aria-hidden className="mx-auto mt-3 h-px w-12" style={{ backgroundColor: brand.accentColor }} />

            <form data-wf="b-9-0" onSubmit={submitIdea} noValidate className="mt-6 space-y-5">
              {formError ? (
                <p
                  className="deco-enter flex items-start gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.18em]"
                  style={{ border: `1px solid ${brand.primaryColor}`, backgroundColor: `${brand.accentColor}22` }}
                >
                  <span className="mt-px shrink-0" aria-hidden><AlertCircle size={14} /></span>
                  <span><span className="font-semibold">Already on the board — </span>{formError}</span>
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="idea-title" className="text-[10px] uppercase tracking-[0.25em]" style={{ color: brand.neutralColor }}>
                  Title
                </Label>
                <Input
                  id="idea-title"
                  data-wf="i-9-0-0"
                  ref={titleRef}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  aria-invalid={fieldErrors.title ? "true" : undefined}
                  aria-describedby={fieldErrors.title ? "idea-title-error idea-title-count" : "idea-title-count"}
                  placeholder="Dark mode for the board"
                  className="deco-focus h-11 w-full bg-transparent px-4 text-sm outline-none"
                  style={fieldStyle(!!fieldErrors.title)}
                />
                <div className="flex items-baseline justify-between gap-3">
                  <span id="idea-title-count" className="text-[10px] uppercase tracking-[0.2em]" style={{ ...num, color: brand.neutralColor }}>
                    {draft.title.trim().length} / {TITLE_MAX}
                  </span>
                  {fieldErrors.title ? (
                    <span id="idea-title-error" className="flex items-center gap-1.5 text-[11px]" style={{ color: brand.primaryColor }}>
                      <AlertCircle size={13} aria-hidden />
                      {fieldErrors.title}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idea-description" className="text-[10px] uppercase tracking-[0.25em]" style={{ color: brand.neutralColor }}>
                  Short description
                </Label>
                <Textarea
                  id="idea-description"
                  data-wf="i-9-0-1"
                  rows={4}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  aria-invalid={fieldErrors.description ? "true" : undefined}
                  aria-describedby={fieldErrors.description ? "idea-desc-error idea-desc-count" : "idea-desc-count"}
                  placeholder="A low-light theme so the board is comfortable to read at night."
                  className="deco-focus w-full bg-transparent px-4 py-3 text-sm leading-relaxed outline-none"
                  style={fieldStyle(!!fieldErrors.description)}
                />
                <div className="flex items-baseline justify-between gap-3">
                  <span id="idea-desc-count" className="text-[10px] uppercase tracking-[0.2em]" style={{ ...num, color: brand.neutralColor }}>
                    {draft.description.trim().length} / {DESC_MAX}
                  </span>
                  {fieldErrors.description ? (
                    <span id="idea-desc-error" className="flex items-center gap-1.5 text-[11px]" style={{ color: brand.primaryColor }}>
                      <AlertCircle size={13} aria-hidden />
                      {fieldErrors.description}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 pt-1">
                <Button
                  data-wf="b-10-0"
                  type="submit"
                  disabled={pending}
                  className="deco-focus col-span-12 flex h-11 items-center justify-center gap-2 px-5 text-[11px] disabled:opacity-60 sm:col-span-6"
                  style={primaryBtn}
                >
                  {pending ? (
                    <>
                      <Clock size={14} aria-hidden />
                      {editingId ? "Saving…" : "Publishing…"}
                    </>
                  ) : (
                    <>
                      <Check size={14} aria-hidden />
                      {editingId ? "Save changes" : "Publish idea"}
                    </>
                  )}
                </Button>
                <Button
                  data-wf="b-10-1"
                  type="button"
                  onClick={closePost}
                  disabled={pending}
                  className="deco-focus col-span-12 flex h-11 items-center justify-center px-5 text-[11px] disabled:opacity-45 sm:col-span-6"
                  style={ghostBtn}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-center text-[10px] uppercase tracking-[0.2em]" style={{ color: brand.neutralColor }}>
                {editingId ? "Your wording changes; the upvotes stay as they are." : "Posted under your email and starts at zero upvotes."}
              </p>
            </form>
          </div>
        </div>
      ) : null}

      {deleteOpen && selected ? (
        <div className="deco-veil fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8" style={{ backgroundColor: `${brand.primaryColor}bf` }}>
          <div
            data-wf="b-11-0"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-body"
            className="deco-enter w-full max-w-lg p-6 text-center shadow-2xl sm:p-8"
            style={{ ...frame, backgroundColor: brand.backgroundColor }}
          >
            <h2 id="delete-modal-title" className="text-sm" style={caps}>Delete this idea? Its upvotes are removed too.</h2>
            <div aria-hidden className="mx-auto mt-3 h-px w-12" style={{ backgroundColor: brand.accentColor }} />
            <p id="delete-modal-body" className="mx-auto mt-4 max-w-md text-sm leading-relaxed" style={{ color: brand.neutralColor }}>
              “{selected.title}” and the <span style={num}>{selected.votes}</span> upvote{selected.votes === 1 ? "" : "s"} it has collected leave the board for good. This cannot be undone.
            </p>
            <div className="mt-7 grid grid-cols-12 gap-3">
              <Button
                data-wf="b-12-0"
                onClick={confirmDelete}
                disabled={deleting}
                className="deco-focus col-span-12 flex h-11 items-center justify-center gap-2 px-5 text-[11px] disabled:opacity-60 sm:col-span-6"
                style={primaryBtn}
              >
                {deleting ? <Clock size={14} aria-hidden /> : <Trash size={14} aria-hidden />}
                {deleting ? "Deleting…" : "Delete idea"}
              </Button>
              <Button
                data-wf="b-12-1"
                ref={keepBtnRef}
                onClick={closeDelete}
                disabled={deleting}
                className="deco-focus col-span-12 flex h-11 items-center justify-center px-5 text-[11px] disabled:opacity-45 sm:col-span-6"
                style={ghostBtn}
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
