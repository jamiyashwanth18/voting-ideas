// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Label, Table, THead, TBody, TR, TH, TD, Avatar, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Search, Check, X, User, Users, Settings, Clock, Trash, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } = Icons;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const hexToRgb = (hex) => {
  const h = String(hex || "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const SEED_IDEAS = [
  {
    id: "idea_2412",
    author_id: "u_118",
    title: "Dark mode for the board",
    description: "An ivory screen at midnight is a lot. Let the board follow the system theme.",
    upvotes: 212,
    created_at: "2026-11-05T09:14:00Z",
  },
  {
    id: "idea_2387",
    author_id: "u_104",
    title: "Let members sort by newest, not just top",
    description: "Good ideas posted on Friday never climb past the old ones.",
    upvotes: 164,
    created_at: "2026-11-11T16:02:00Z",
  },
  {
    id: "idea_2366",
    author_id: "u_131",
    title: "Show which ideas I have already upvoted",
    description: "A marked state on the vote control so I stop guessing.",
    upvotes: 141,
    created_at: "2026-11-14T08:41:00Z",
  },
  {
    id: "idea_2355",
    author_id: "u_127",
    title: "Merge duplicate ideas instead of deleting one",
    description: "Three people posted the same request about export this month.",
    upvotes: 98,
    created_at: "2026-11-17T12:30:00Z",
  },
  {
    id: "idea_2344",
    author_id: "u_112",
    title: "Weekly digest of the top five ideas",
    description: "One short note on Monday with whatever rose to the top.",
    upvotes: 76,
    created_at: "2026-11-19T07:55:00Z",
  },
  {
    id: "idea_2338",
    author_id: "u_104",
    title: "A 280 character limit on descriptions",
    description: "Short pitches read better in the ranked list.",
    upvotes: 76,
    created_at: "2026-11-20T18:12:00Z",
  },
  {
    id: "idea_2187",
    author_id: "u_109",
    title: "Idea board for the Chicago office",
    description: "Posted by an account that was deactivated on 18 Nov.",
    upvotes: 41,
    created_at: "2026-11-02T10:05:00Z",
    already_removed: true,
  },
  {
    id: "idea_2301",
    author_id: "u_144",
    title: "BUY CHEAP FOLLOWERS >>> fast delivery, DM now",
    description: "Repeat advertising post. Third from this account this week.",
    upvotes: 3,
    created_at: "2026-11-24T02:47:00Z",
    flagged: true,
  },
  {
    id: "idea_2299",
    author_id: "u_144",
    title: "FREE AIRDROP — claim your allocation today",
    description: "Off-topic promotion with an outbound link in the body text.",
    upvotes: 1,
    created_at: "2026-11-24T02:51:00Z",
    flagged: true,
  },
];

const SEED_USERS = [
  { id: "u_001", email: "ops@ideaboard.co", created_at: "2026-09-02T09:00:00Z", is_active: true, is_admin: true },
  { id: "u_104", email: "mara.ellis@northwind.co", created_at: "2026-09-14T11:22:00Z", is_active: true, is_admin: false },
  { id: "u_109", email: "lena.ruiz@northwind.co", created_at: "2026-09-28T15:40:00Z", is_active: false, is_admin: false, deactivated_at: "2026-11-18T13:04:00Z" },
  { id: "u_112", email: "s.delacroix@bellhaus.fr", created_at: "2026-10-03T08:10:00Z", is_active: true, is_admin: false },
  { id: "u_118", email: "hollis.wynn@madisonave.io", created_at: "2026-10-11T19:35:00Z", is_active: true, is_admin: false },
  { id: "u_127", email: "theo.brandt@aurelia.studio", created_at: "2026-10-22T13:18:00Z", is_active: true, is_admin: false },
  { id: "u_131", email: "june.okafor@pelham.dev", created_at: "2026-11-02T07:29:00Z", is_active: true, is_admin: false },
  { id: "u_144", email: "vance.hollow@mailinator.test", created_at: "2026-11-23T23:58:00Z", is_active: true, is_admin: false },
];

const TABS = [
  { key: "ideas", label: "All ideas" },
  { key: "users", label: "Users" },
];

const Ornament = ({ className = "" }) => (
  <div className={`flex items-center ${className}`} aria-hidden="true">
    <span className="flex-1">
      <span className="block h-px" style={{ backgroundColor: brand.accentColor }} />
      <span className="mt-1 block h-px" style={{ backgroundColor: rgba(brand.primaryColor, 0.28) }} />
    </span>
    <span
      className="mx-3 block"
      style={{ width: 8, height: 8, transform: "rotate(45deg)", backgroundColor: brand.primaryColor }}
    />
    <span className="flex-1">
      <span className="block h-px" style={{ backgroundColor: brand.accentColor }} />
      <span className="mt-1 block h-px" style={{ backgroundColor: rgba(brand.primaryColor, 0.28) }} />
    </span>
  </div>
);

const Frame = ({ children, className = "", surface = true, ...rest }) => (
  <div className={className} style={{ border: `1px solid ${brand.primaryColor}`, padding: 4 }} {...rest}>
    <div
      style={{
        border: `1px solid ${brand.accentColor}`,
        backgroundColor: surface ? "rgba(255,255,255,0.48)" : "transparent",
      }}
    >
      {children}
    </div>
  </div>
);

export default function Screen() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("ideas");
  const [ideas, setIdeas] = React.useState(SEED_IDEAS);
  const [users, setUsers] = React.useState(SEED_USERS);
  const [ideaQuery, setIdeaQuery] = React.useState("");
  const [userQuery, setUserQuery] = React.useState("");
  const [confirm, setConfirm] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const timersRef = React.useRef([]);
  const dialogRef = React.useRef(null);
  const confirmBtnRef = React.useRef(null);
  const cancelBtnRef = React.useRef(null);
  const closeBtnRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const tabRefs = React.useRef({});

  const later = React.useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  React.useEffect(() => {
    later(() => setLoading(false), 520);
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [later]);

  React.useEffect(() => {
    if (confirm && confirmBtnRef.current) confirmBtnRef.current.focus();
  }, [confirm]);

  const ideaCount = React.useCallback(
    (userId) => ideas.filter((i) => i.author_id === userId).length,
    [ideas]
  );

  const authorOf = React.useCallback(
    (authorId) => {
      const u = users.find((x) => x.id === authorId);
      return u ? u.email : "account removed";
    },
    [users]
  );

  const sortedIdeas = React.useMemo(() => {
    return [...ideas].sort((a, b) => {
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      const t = new Date(a.created_at) - new Date(b.created_at);
      return t !== 0 ? t : a.id.localeCompare(b.id);
    });
  }, [ideas]);

  const visibleIdeas = React.useMemo(() => {
    const q = ideaQuery.trim().toLowerCase();
    if (!q) return sortedIdeas;
    return sortedIdeas.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        authorOf(i.author_id).toLowerCase().includes(q)
    );
  }, [sortedIdeas, ideaQuery, authorOf]);

  const visibleUsers = React.useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  }, [users, userQuery]);

  const openConfirm = (kind, item, ev) => {
    triggerRef.current = ev && ev.currentTarget ? ev.currentTarget : null;
    setConfirm({ kind, item });
  };

  const closeConfirm = React.useCallback(() => {
    setConfirm(null);
    setBusy(false);
    if (triggerRef.current && document.contains(triggerRef.current)) {
      triggerRef.current.focus();
    }
  }, []);

  const runConfirm = () => {
    if (!confirm || busy) return;
    setBusy(true);
    const { kind, item } = confirm;
    later(() => {
      if (kind === "idea") {
        setIdeas((prev) => prev.filter((i) => i.id !== item.id));
        if (item.already_removed) {
          setNotice({
            tone: "error",
            text: `“${item.title}” was already taken down at 13:48 by ops@ideaboard.co. Nothing further to remove — the ledger below is refreshed.`,
          });
        } else {
          setNotice({
            tone: "success",
            text: `Removed “${item.title}” and its ${item.upvotes} upvote${item.upvotes === 1 ? "" : "s"}. It is gone from the public board.`,
          });
        }
      } else {
        const count = ideaCount(item.id);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, is_active: false, deactivated_at: new Date().toISOString() } : u
          )
        );
        setNotice({
          tone: count > 0 ? "warn" : "success",
          text:
            count > 0
              ? `${item.email} is deactivated and signed out of every session. Their ${count} idea${count === 1 ? " stays" : "s stay"} on the board — remove them one by one from All ideas.`
              : `${item.email} is deactivated and signed out of every session. They can no longer log in, post or vote.`,
        });
      }
      closeConfirm();
    }, 420);
  };

  const onDialogKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeConfirm();
      return;
    }
    if (e.key !== "Tab") return;
    const nodes = [closeBtnRef.current, confirmBtnRef.current, cancelBtnRef.current].filter(
      (n) => n && !n.disabled
    );
    if (nodes.length === 0) return;
    const idx = nodes.indexOf(document.activeElement);
    e.preventDefault();
    const next = e.shiftKey ? (idx <= 0 ? nodes.length - 1 : idx - 1) : (idx === nodes.length - 1 ? 0 : idx + 1);
    nodes[next].focus();
  };

  const onTabKeyDown = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.key === tab);
    const n = e.key === "ArrowRight" ? (i + 1) % TABS.length : (i - 1 + TABS.length) % TABS.length;
    setTab(TABS[n].key);
    const el = tabRefs.current[TABS[n].key];
    if (el) el.focus();
  };

  const hair = rgba(brand.primaryColor, 0.15);
  const soft = { color: brand.primaryColor, opacity: 0.72 };
  const capLabel = "uppercase tracking-[0.2em] text-[11px] font-semibold";
  const css = `
    #dz-admin { --dz-p: ${brand.primaryColor}; --dz-a: ${brand.accentColor}; --dz-hair: ${hair}; --dz-tint: ${rgba(brand.accentColor, 0.26)}; }
    #dz-admin .dz-btn { border-radius: 0; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; transition: background-color .18s ease, color .18s ease, border-color .18s ease; }
    #dz-admin .dz-focus:focus-visible, #dz-admin .dz-btn:focus-visible, #dz-admin input:focus-visible { outline: 2px solid var(--dz-p); outline-offset: 3px; }
    #dz-admin .dz-btn-primary { background: var(--dz-p); color: var(--dz-a); border: 1px solid var(--dz-p); }
    #dz-admin .dz-btn-primary:hover:not(:disabled) { background: var(--dz-a); color: var(--dz-p); }
    #dz-admin .dz-btn-primary:active:not(:disabled) { background: var(--dz-p); color: var(--dz-a); }
    #dz-admin .dz-btn-quiet { background: transparent; color: var(--dz-p); border: 1px solid var(--dz-hair); }
    #dz-admin .dz-btn-quiet:hover:not(:disabled) { background: var(--dz-tint); border-color: var(--dz-p); }
    #dz-admin .dz-btn:disabled { opacity: .42; cursor: not-allowed; }
    #dz-admin .dz-row { transition: background-color .15s ease; }
    #dz-admin .dz-row:hover { background: ${rgba(brand.accentColor, 0.18)}; }
    #dz-admin .dz-link { text-decoration: underline; text-decoration-color: var(--dz-a); text-decoration-thickness: 1px; text-underline-offset: 4px; }
    #dz-admin .dz-link:hover { text-decoration-color: var(--dz-p); }
    #dz-admin input { border-radius: 0 !important; }
    @keyframes dz-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes dz-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes dz-shimmer { 0%,100% { opacity: .3; } 50% { opacity: .75; } }
    #dz-admin .dz-enter, .dz-enter { animation: dz-rise .22s ease-out both; }
    .dz-veil { animation: dz-fade .18s ease-out both; }
    #dz-admin .dz-skel { animation: dz-shimmer 1.4s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      #dz-admin .dz-enter, .dz-enter, .dz-veil, #dz-admin .dz-skel { animation: none !important; }
      #dz-admin .dz-row, #dz-admin .dz-btn { transition: none !important; }
    }
  `;

  const noticeTone = (tone) => {
    if (tone === "error") return { border: brand.primaryColor, bg: rgba(brand.primaryColor, 0.08), label: "Nothing removed" };
    if (tone === "warn") return { border: brand.primaryColor, bg: rgba(brand.accentColor, 0.2), label: "Done, with a note" };
    return { border: brand.accentColor, bg: rgba(brand.accentColor, 0.26), label: "Done" };
  };

  const Notice = () => {
    if (!notice) return null;
    const t = noticeTone(notice.tone);
    return (
      <div
        className="dz-enter mb-6 flex items-start gap-3 px-4 py-3"
        style={{ border: `1px solid ${t.border}`, backgroundColor: t.bg }}
        role={notice.tone === "error" ? "alert" : "status"}
      >
        {notice.tone === "error" ? (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: brand.primaryColor }} aria-hidden="true" />
        ) : (
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: brand.primaryColor }} aria-hidden="true" />
        )}
        <p className="flex-1 text-sm leading-6" style={{ color: brand.primaryColor }}>
          <span className={`${capLabel} mr-2`}>{t.label}</span>
          {notice.text}
        </p>
        <button
          type="button"
          onClick={() => setNotice(null)}
          aria-label="Dismiss this message"
          className="dz-focus -m-1 p-1"
          style={{ color: brand.primaryColor }}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  };

  const Skeleton = ({ rows }) => (
    <div className="px-4 py-6 sm:px-6" aria-live="polite">
      <p className={`${capLabel} mb-5`} style={soft}>
        Opening the ledger…
      </p>
      <ul className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-4">
            <span className="dz-skel block h-3 flex-1" style={{ backgroundColor: rgba(brand.primaryColor, 0.3) }} />
            <span className="dz-skel hidden h-3 w-32 sm:block" style={{ backgroundColor: rgba(brand.accentColor, 0.6) }} />
            <span className="dz-skel block h-3 w-14" style={{ backgroundColor: rgba(brand.primaryColor, 0.2) }} />
          </li>
        ))}
      </ul>
    </div>
  );

  const CardTop = ({ title, count, children }) => (
    <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h2
          className="text-lg uppercase tracking-[0.22em]"
          style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
        >
          {title}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-xs tabular-nums" style={soft}>
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {count} · ledger synced 14:02 GMT today
        </p>
      </div>
      {children}
    </div>
  );

  const dialogTitleId = "dz-confirm-title";
  const dialogDescId = "dz-confirm-desc";

  return (
    <div
      id="dz-admin"
      className="min-h-full px-4 py-10 sm:px-6 lg:px-10"
      style={{ backgroundColor: brand.backgroundColor, fontFamily: brand.fontBody, color: brand.primaryColor }}
    >
      <style>{css}</style>

      <div className="mx-auto w-full max-w-6xl">
        {/* b-0-0 page title */}
        <header data-wf="b-0-0" className="text-center">
          <p className={capLabel} style={soft}>
            Restricted · seed-granted role
          </p>
          <h1
            className="mt-3 text-3xl uppercase tracking-[0.3em] sm:text-4xl"
            style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
          >
            Admin console
          </h1>
          <Ornament className="mx-auto mt-6 max-w-xl" />
        </header>

        {/* b-1-0 configuration note */}
        <section data-wf="b-1-0" className="mx-auto mt-6 max-w-2xl text-center">
          <p className="text-sm leading-7" style={{ color: brand.primaryColor }}>
            Admin access is granted by configuration or seed data. The admin credential is{" "}
            <code
              className="px-1.5 py-0.5 text-[13px] tabular-nums"
              style={{ backgroundColor: rgba(brand.accentColor, 0.3), border: `1px solid ${hair}` }}
            >
              &lt;set-at-first-login&gt;
            </code>
            . No member can grant themselves this role from inside the board.
          </p>
          <p className="mt-3 text-xs tabular-nums" style={soft}>
            Signed in as ops@ideaboard.co · user u_001 · session expires after 30 minutes idle
          </p>
        </section>

        {/* b-2-0 tabs */}
        <div data-wf="b-2-0" className="mt-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Admin sections"
            onKeyDown={onTabKeyDown}
            className="flex"
            style={{ border: `1px solid ${brand.primaryColor}`, padding: 3 }}
          >
            {TABS.map((t) => {
              const active = tab === t.key;
              const n = t.key === "ideas" ? ideas.length : users.length;
              return (
                <button
                  key={t.key}
                  data-wf={t.key === "ideas" ? "i-2-0-0" : "i-2-0-1"}
                  ref={(el) => {
                    tabRefs.current[t.key] = el;
                  }}
                  role="tab"
                  id={`dz-tab-${t.key}`}
                  aria-selected={active}
                  aria-controls={`dz-panel-${t.key}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTab(t.key)}
                  className="dz-btn dz-focus px-6 py-3 text-xs sm:px-10"
                  style={{
                    backgroundColor: active ? brand.primaryColor : "transparent",
                    color: active ? brand.accentColor : brand.primaryColor,
                    border: `1px solid ${active ? brand.primaryColor : "transparent"}`,
                  }}
                >
                  {t.label}
                  <span className="ml-2 tabular-nums" style={{ opacity: 0.75 }}>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ideas panel */}
        {tab === "ideas" && (
          <div
            id="dz-panel-ideas"
            role="tabpanel"
            aria-labelledby="dz-tab-ideas"
            className="dz-enter mt-8"
          >
            <Notice />
            <Frame data-wf="b-3-0">
              <CardTop
                title="All ideas (any author)"
                count={`${ideas.length} on the board`}
              >
                <div className="w-full md:w-72">
                  <Label htmlFor="dz-idea-search" className={`${capLabel} mb-2 block`} style={soft}>
                    Find an idea
                  </Label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: brand.primaryColor, opacity: 0.6 }}
                      aria-hidden="true"
                    />
                    <Input
                      id="dz-idea-search"
                      type="search"
                      value={ideaQuery}
                      onChange={(e) => setIdeaQuery(e.target.value)}
                      placeholder="Title, author or idea id"
                      className="dz-focus w-full pl-9 text-sm"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid ${hair}`,
                        color: brand.primaryColor,
                        minHeight: 44,
                      }}
                    />
                  </div>
                </div>
              </CardTop>

              <div style={{ borderTop: `1px solid ${hair}` }} />

              {loading ? (
                <Skeleton rows={5} />
              ) : visibleIdeas.length === 0 ? (
                <div className="px-4 py-12 sm:px-6">
                  {ideas.length === 0 ? (
                    <Empty
                      title="The board is clear"
                      description="Every idea has been removed. The moment a member posts again it appears here, newest votes and all."
                      action={
                        <Button
                          className="dz-btn dz-btn-primary px-6 py-3 text-xs"
                          onClick={() => navigate("ideas")}
                        >
                          Open the public board
                        </Button>
                      }
                    />
                  ) : (
                    <Empty
                      title={`Nothing matches “${ideaQuery.trim()}”`}
                      description={`Try a word from the title, an author's email, or an id such as idea_2412. The ledger holds ${ideas.length} ideas in total.`}
                      action={
                        <Button
                          className="dz-btn dz-btn-quiet px-6 py-3 text-xs"
                          onClick={() => setIdeaQuery("")}
                        >
                          Clear search
                        </Button>
                      }
                    />
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <THead>
                      <TR style={{ borderBottom: `1px solid ${rgba(brand.primaryColor, 0.35)}` }}>
                        <TH data-wf="i-3-0-0" scope="col" className={`${capLabel} px-4 py-3 text-left sm:px-6`} style={soft}>
                          Title
                        </TH>
                        <TH data-wf="i-3-0-1" scope="col" className={`${capLabel} hidden px-4 py-3 text-left md:table-cell`} style={soft}>
                          Author
                        </TH>
                        <TH data-wf="i-3-0-2" scope="col" className={`${capLabel} px-4 py-3 text-right`} style={soft}>
                          Upvotes
                        </TH>
                        <TH data-wf="i-3-0-3" scope="col" className={`${capLabel} hidden px-4 py-3 text-left sm:table-cell`} style={soft}>
                          Created
                        </TH>
                        <TH data-wf="i-3-0-4" scope="col" className={`${capLabel} px-4 py-3 text-right sm:px-6`} style={soft}>
                          Remove
                        </TH>
                      </TR>
                    </THead>
                    <TBody>
                      {visibleIdeas.map((idea) => (
                        <TR key={idea.id} className="dz-row dz-enter" style={{ borderBottom: `1px solid ${hair}` }}>
                          <TD className="px-4 py-4 align-top sm:px-6">
                            <button
                              type="button"
                              onClick={() => navigate("ideas")}
                              className="dz-focus dz-link max-w-md text-left text-[15px] font-medium leading-6"
                              style={{ color: brand.primaryColor }}
                            >
                              {idea.title}
                            </button>
                            <p className="mt-1 max-w-md text-xs leading-5" style={soft}>
                              {idea.description}
                            </p>
                            <p className="mt-1.5 text-xs tabular-nums md:hidden" style={soft}>
                              {authorOf(idea.author_id)} · {fmtDate(idea.created_at)}
                            </p>
                            {idea.flagged && (
                              <span
                                className={`${capLabel} mt-2 inline-flex items-center gap-1.5 px-2 py-1`}
                                style={{ border: `1px solid ${brand.primaryColor}`, color: brand.primaryColor }}
                              >
                                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                                Advertising
                              </span>
                            )}
                          </TD>
                          <TD className="hidden px-4 py-4 align-top text-sm md:table-cell" style={{ color: brand.primaryColor }}>
                            {authorOf(idea.author_id)}
                            <span className="mt-1 block text-xs tabular-nums" style={soft}>
                              {idea.author_id}
                            </span>
                          </TD>
                          <TD className="px-4 py-4 align-top text-right">
                            <span
                              className="inline-block min-w-[3rem] px-2 py-1 text-sm font-semibold tabular-nums"
                              style={{
                                backgroundColor: rgba(brand.accentColor, 0.34),
                                border: `1px solid ${brand.accentColor}`,
                                color: brand.primaryColor,
                              }}
                            >
                              {idea.upvotes}
                            </span>
                          </TD>
                          <TD className="hidden px-4 py-4 align-top text-sm tabular-nums sm:table-cell" style={soft}>
                            {fmtDate(idea.created_at)}
                          </TD>
                          <TD className="px-4 py-4 align-top text-right sm:px-6">
                            <Button
                              data-wf="i-3-0-4"
                              className="dz-btn dz-btn-quiet inline-flex items-center gap-2 px-4 py-3 text-[11px]"
                              aria-label={`Remove the idea “${idea.title}”`}
                              onClick={(e) => openConfirm("idea", idea, e)}
                            >
                              <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                              Remove
                            </Button>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              )}
            </Frame>
          </div>
        )}

        {/* Users panel */}
        {tab === "users" && (
          <div
            id="dz-panel-users"
            role="tabpanel"
            aria-labelledby="dz-tab-users"
            className="dz-enter mt-8"
          >
            <Notice />
            <Frame data-wf="b-4-0">
              <CardTop title="Users" count={`${users.filter((u) => u.is_active).length} active of ${users.length}`}>
                <div className="w-full md:w-72">
                  <Label htmlFor="dz-user-search" className={`${capLabel} mb-2 block`} style={soft}>
                    Find a member
                  </Label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: brand.primaryColor, opacity: 0.6 }}
                      aria-hidden="true"
                    />
                    <Input
                      id="dz-user-search"
                      type="search"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Email address or user id"
                      className="dz-focus w-full pl-9 text-sm"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid ${hair}`,
                        color: brand.primaryColor,
                        minHeight: 44,
                      }}
                    />
                  </div>
                </div>
              </CardTop>

              <div style={{ borderTop: `1px solid ${hair}` }} />

              {loading ? (
                <Skeleton rows={4} />
              ) : visibleUsers.length === 0 ? (
                <div className="px-4 py-12 sm:px-6">
                  <Empty
                    title={`No member matches “${userQuery.trim()}”`}
                    description={`Search by the full email address or a user id such as u_118. ${users.length} accounts are registered.`}
                    action={
                      <Button className="dz-btn dz-btn-quiet px-6 py-3 text-xs" onClick={() => setUserQuery("")}>
                        Clear search
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <THead>
                      <TR style={{ borderBottom: `1px solid ${rgba(brand.primaryColor, 0.35)}` }}>
                        <TH data-wf="i-4-0-0" scope="col" className={`${capLabel} px-4 py-3 text-left sm:px-6`} style={soft}>
                          Email
                        </TH>
                        <TH data-wf="i-4-0-1" scope="col" className={`${capLabel} hidden px-4 py-3 text-left sm:table-cell`} style={soft}>
                          Created
                        </TH>
                        <TH data-wf="i-4-0-2" scope="col" className={`${capLabel} px-4 py-3 text-left`} style={soft}>
                          Status
                        </TH>
                        <TH data-wf="i-4-0-3" scope="col" className={`${capLabel} px-4 py-3 text-right`} style={soft}>
                          Ideas
                        </TH>
                        <TH data-wf="i-4-0-4" scope="col" className={`${capLabel} px-4 py-3 text-right sm:px-6`} style={soft}>
                          Deactivate
                        </TH>
                      </TR>
                    </THead>
                    <TBody>
                      {visibleUsers.map((u) => {
                        const count = ideaCount(u.id);
                        return (
                          <TR key={u.id} className="dz-row dz-enter" style={{ borderBottom: `1px solid ${hair}` }}>
                            <TD className="px-4 py-4 align-top sm:px-6">
                              <div className="flex items-start gap-3">
                                <Avatar name={u.email} className="hidden h-8 w-8 shrink-0 sm:block" />
                                <div>
                                  <span className="block text-[15px] leading-6" style={{ color: brand.primaryColor }}>
                                    {u.email}
                                  </span>
                                  <span className="mt-0.5 block text-xs tabular-nums" style={soft}>
                                    {u.id}
                                    <span className="sm:hidden"> · joined {fmtDate(u.created_at)}</span>
                                  </span>
                                  {u.is_admin && (
                                    <span
                                      className={`${capLabel} mt-2 inline-flex items-center gap-1.5 px-2 py-1`}
                                      style={{ backgroundColor: brand.primaryColor, color: brand.accentColor }}
                                    >
                                      <Settings className="h-3 w-3" aria-hidden="true" />
                                      Admin · seed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TD>
                            <TD className="hidden px-4 py-4 align-top text-sm tabular-nums sm:table-cell" style={soft}>
                              {fmtDate(u.created_at)}
                            </TD>
                            <TD className="px-4 py-4 align-top">
                              <span
                                className={`${capLabel} inline-flex items-center gap-1.5 px-2 py-1`}
                                style={{
                                  border: `1px solid ${u.is_active ? brand.accentColor : brand.primaryColor}`,
                                  backgroundColor: u.is_active ? rgba(brand.accentColor, 0.3) : rgba(brand.primaryColor, 0.08),
                                  color: brand.primaryColor,
                                }}
                              >
                                {u.is_active ? (
                                  <Check className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                  <X className="h-3 w-3" aria-hidden="true" />
                                )}
                                {u.is_active ? "Active" : "Deactivated"}
                              </span>
                              {!u.is_active && u.deactivated_at && (
                                <span className="mt-1.5 block text-xs tabular-nums" style={soft}>
                                  since {fmtDate(u.deactivated_at)}
                                </span>
                              )}
                            </TD>
                            <TD className="px-4 py-4 align-top text-right text-sm tabular-nums" style={{ color: brand.primaryColor }}>
                              {count}
                            </TD>
                            <TD className="px-4 py-4 align-top text-right sm:px-6">
                              <Button
                                data-wf="i-4-0-4"
                                className="dz-btn dz-btn-quiet inline-flex items-center gap-2 px-4 py-3 text-[11px]"
                                disabled={u.is_admin || !u.is_active}
                                aria-label={`Deactivate the account ${u.email}`}
                                onClick={(e) => openConfirm("user", u, e)}
                              >
                                <User className="h-3.5 w-3.5" aria-hidden="true" />
                                {u.is_active ? "Deactivate" : "Deactivated"}
                              </Button>
                              {u.is_admin && (
                                <span className="mt-2 block text-xs leading-5" style={soft}>
                                  Seed admin — change this in configuration, not here.
                                </span>
                              )}
                            </TD>
                          </TR>
                        );
                      })}
                    </TBody>
                  </Table>
                </div>
              )}
            </Frame>
          </div>
        )}

        <Ornament className="mx-auto mt-12 max-w-sm" />
        <p className="mt-6 text-center text-xs leading-6" style={soft}>
          Removals and deactivations take effect at once on the public board.
        </p>
      </div>

      {/* b-5-0 confirmation dialog */}
      {confirm && (
        <div
          className="dz-veil fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: rgba(brand.primaryColor, 0.62) }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div
            data-wf="b-5-0"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescId}
            onKeyDown={onDialogKeyDown}
            className="dz-enter w-full max-w-lg"
            style={{ boxShadow: `0 24px 60px ${rgba(brand.primaryColor, 0.45)}` }}
          >
            <div style={{ border: `1px solid ${brand.accentColor}`, padding: 4, backgroundColor: brand.backgroundColor }}>
              <div style={{ border: `1px solid ${brand.primaryColor}` }} className="px-6 py-7 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <p className={capLabel} style={soft}>
                    {confirm.kind === "idea" ? "Confirm removal" : "Confirm deactivation"}
                  </p>
                  <button
                    type="button"
                    ref={closeBtnRef}
                    onClick={closeConfirm}
                    aria-label="Close this dialog"
                    className="dz-focus -m-1 p-1"
                    style={{ color: brand.primaryColor }}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <h2
                  id={dialogTitleId}
                  className="mt-4 text-center text-xl uppercase tracking-[0.22em]"
                  style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
                >
                  {confirm.kind === "idea" ? "Remove this idea and its upvotes?" : "Deactivate this account?"}
                </h2>

                <Ornament className="mx-auto mt-5 max-w-xs" />

                <div id={dialogDescId} className="mt-6 text-center">
                  {confirm.kind === "idea" ? (
                    <>
                      <p className="text-[15px] leading-7" style={{ color: brand.primaryColor }}>
                        “{confirm.item.title}”
                      </p>
                      <p className="mt-2 text-sm leading-6 tabular-nums" style={soft}>
                        {authorOf(confirm.item.author_id)} · {confirm.item.upvotes} upvote
                        {confirm.item.upvotes === 1 ? "" : "s"} · posted {fmtDate(confirm.item.created_at)}
                      </p>
                      <p className="mx-auto mt-4 max-w-sm text-sm leading-6" style={soft}>
                        The idea and every vote cast on it are deleted from the public board. This cannot be undone.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] leading-7" style={{ color: brand.primaryColor }}>
                        {confirm.item.email}
                      </p>
                      <p className="mt-2 text-sm leading-6 tabular-nums" style={soft}>
                        {confirm.item.id} · joined {fmtDate(confirm.item.created_at)} · {ideaCount(confirm.item.id)} idea
                        {ideaCount(confirm.item.id) === 1 ? "" : "s"}
                      </p>
                      <p className="mx-auto mt-4 max-w-sm text-sm leading-6" style={soft}>
                        They are signed out of every session at once and cannot log in, post or vote again. Their existing
                        ideas stay on the board until you remove them.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    data-wf="b-6-0"
                    ref={confirmBtnRef}
                    className="dz-btn dz-btn-primary w-full px-6 py-3 text-xs"
                    disabled={busy}
                    onClick={runConfirm}
                  >
                    {busy
                      ? confirm.kind === "idea"
                        ? "Removing…"
                        : "Deactivating…"
                      : confirm.kind === "idea"
                      ? "Remove idea"
                      : "Deactivate account"}
                  </Button>
                  <Button
                    data-wf="b-6-1"
                    ref={cancelBtnRef}
                    className="dz-btn dz-btn-quiet w-full px-6 py-3 text-xs"
                    disabled={busy}
                    onClick={closeConfirm}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="mt-4 text-center text-xs" style={soft}>
                  Press Esc to close without changing anything.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
