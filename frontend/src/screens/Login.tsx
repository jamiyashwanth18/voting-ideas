// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Label } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Check } = Icons;

const PRODUCT_NAME = "The Idea Board";

const SESSION_IDLE_MINUTES = 30;

// Seeded accounts for the prototype session check (no credentials stored here).
const KNOWN_ACCOUNTS = [
  { email: "ada.whitfield@meridiangroup.co", name: "Ada Whitfield" },
  { email: "j.okonkwo@meridiangroup.co", name: "Joseph Okonkwo" },
  { email: "rosalind.vance@meridiangroup.co", name: "Rosalind Vance" },
  { email: "h.delacroix@meridiangroup.co", name: "Henri Delacroix" },
  { email: "yashwanth.jami@quorq.ai", name: "Yashwanth Jami" },
];

const tint = (hex, alpha) => {
  const h = String(hex).replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export default function Screen() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [formError, setFormError] = React.useState(null);
  const [status, setStatus] = React.useState("idle"); // idle | loading | error | success
  const [greeting, setGreeting] = React.useState(null);
  const [focused, setFocused] = React.useState(null);
  const [showExpired, setShowExpired] = React.useState(true);

  const timers = React.useRef([]);
  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => clearTimeout(t));
  }, []);

  const ink = brand.primaryColor;
  const gold = brand.accentColor;
  const muted = brand.neutralColor;
  const hairline = tint(ink, 0.22);

  const fieldStyle = (name, invalid) => ({
    borderRadius: 0,
    height: "48px",
    backgroundColor: "rgba(255,255,255,0.78)",
    border: `1px solid ${invalid ? ink : focused === name ? gold : tint(ink, 0.3)}`,
    boxShadow: focused === name ? `inset 0 -2px 0 0 ${gold}` : "none",
    color: ink,
    fontFamily: brand.fontBody,
    fontSize: "15px",
    transition: "border-color 160ms ease, box-shadow 160ms ease",
  });

  const busy = status === "loading";
  const done = status === "success";

  const onSubmit = (event) => {
    event.preventDefault();
    if (busy || done) return;

    const trimmed = email.trim();
    const next = {};
    if (!trimmed) {
      next.email = "Enter the email address on your account.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      next.email = "That is not a complete email address — check for a typo.";
    }
    if (!password) next.password = "Enter your password to continue.";

    setFieldErrors(next);
    if (Object.keys(next).length > 0) {
      setFormError(null);
      setStatus("idle");
      return;
    }

    setFormError(null);
    setShowExpired(false);
    setStatus("loading");

    timers.current.push(
      setTimeout(() => {
        const match = KNOWN_ACCOUNTS.find((a) => a.email.toLowerCase() === trimmed.toLowerCase());
        if (match && password.length >= 8) {
          setGreeting(match.name.split(" ")[0]);
          setStatus("success");
          timers.current.push(setTimeout(() => navigate("ideas"), 950));
        } else {
          setStatus("error");
          setFormError(
            "Those details do not match an account. Check the email and password, then try again.",
          );
        }
      }, 850),
    );
  };

  const Rule = ({ className = "" }) => (
    <div className={"flex items-center justify-center gap-3 " + className} aria-hidden="true">
      <span className="h-px flex-1" style={{ backgroundColor: hairline }} />
      <span className="flex items-center gap-1.5">
        <span className="block h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
        <span className="block h-2.5 w-2.5 rotate-45" style={{ border: `1px solid ${ink}` }} />
        <span className="block h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
      </span>
      <span className="h-px flex-1" style={{ backgroundColor: hairline }} />
    </div>
  );

  const corner = (pos) => (
    <span
      aria-hidden="true"
      className={"absolute block h-2 w-2 rotate-45 " + pos}
      style={{ backgroundColor: gold, border: `1px solid ${ink}` }}
    />
  );

  return (
    <div
      className="min-h-screen w-full px-4 py-10 sm:py-16"
      style={{
        backgroundColor: brand.backgroundColor,
        color: ink,
        fontFamily: brand.fontBody,
      }}
    >
      <style>{`
        @keyframes gbRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes gbSweep { 0% { transform: translateX(-110%); } 100% { transform: translateX(110%); } }
        .gb-rise { animation: gbRise 320ms ease-out both; }
        .gb-sweep { animation: gbSweep 1100ms linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .gb-rise, .gb-sweep { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[460px]">
        <p
          className="mb-6 text-center text-[11px] uppercase"
          style={{
            fontFamily: brand.fontHeading,
            letterSpacing: "0.42em",
            color: muted,
          }}
        >
          {PRODUCT_NAME}
        </p>

        {/* Double frame: outer rule in brand primary, inner rule in accent gold */}
        <div className="relative p-[6px]" style={{ border: `1px solid ${ink}`, borderRadius: 0 }}>
          <div
            className="relative px-6 py-9 sm:px-10 sm:py-11"
            style={{
              border: `1px solid ${gold}`,
              backgroundColor: "rgba(255,255,255,0.55)",
              borderRadius: 0,
            }}
          >
            {corner("-top-1 -left-1")}
            {corner("-top-1 -right-1")}
            {corner("-bottom-1 -left-1")}
            {corner("-bottom-1 -right-1")}

            {/* b-0-0 — page title */}
            <header data-wf="b-0-0" className="text-center">
              <h1
                className="text-[30px] leading-tight sm:text-[34px]"
                style={{
                  fontFamily: brand.fontHeading,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: ink,
                }}
              >
                Log in
              </h1>
              <p
                className="mx-auto mt-3 max-w-[38ch] text-[13.5px] leading-6"
                style={{ color: muted }}
              >
                Members may post ideas and cast one upvote apiece. Browsing the board needs no
                account at all.
              </p>
            </header>

            <Rule className="mt-7" />

            {/* b-1-0 — credentials form */}
            <form data-wf="b-1-0" onSubmit={onSubmit} noValidate className="mt-7">
              {showExpired && status === "idle" && (
                <div
                  className="gb-rise mb-7 flex items-start gap-3 px-4 py-3"
                  style={{
                    border: `1px solid ${tint(gold, 0.9)}`,
                    backgroundColor: tint(gold, 0.16),
                  }}
                >
                  <Icons.Clock
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: ink }}
                    aria-hidden="true"
                  />
                  <p className="text-[13px] leading-6" style={{ color: ink }}>
                    <span
                      className="mr-1 uppercase"
                      style={{
                        fontFamily: brand.fontHeading,
                        letterSpacing: "0.14em",
                        fontSize: "11.5px",
                      }}
                    >
                      Session ended
                    </span>
                    After{" "}
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      {SESSION_IDLE_MINUTES}
                    </span>{" "}
                    minutes idle we closed your session. Log in to carry on where you left off.
                  </p>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="gb-rise mb-7 flex items-start gap-3 px-4 py-3"
                  style={{
                    border: `1px solid ${ink}`,
                    backgroundColor: tint(ink, 0.07),
                  }}
                >
                  <Icons.AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: ink }}
                    aria-hidden="true"
                  />
                  <div>
                    <p
                      className="uppercase"
                      style={{
                        fontFamily: brand.fontHeading,
                        letterSpacing: "0.16em",
                        fontSize: "11.5px",
                        color: ink,
                      }}
                    >
                      Sign-in refused
                    </p>
                    <p className="mt-1 text-[13px] leading-6" style={{ color: ink }}>
                      {formError}
                    </p>
                  </div>
                </div>
              )}

              {done && (
                <div
                  role="status"
                  className="gb-rise mb-7 flex items-start gap-3 px-4 py-3"
                  style={{
                    border: `1px solid ${gold}`,
                    backgroundColor: tint(gold, 0.2),
                  }}
                >
                  <Icons.CheckCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: ink }}
                    aria-hidden="true"
                  />
                  <p className="text-[13px] leading-6" style={{ color: ink }}>
                    Welcome back{greeting ? `, ${greeting}` : ""}. Opening the board…
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="login-email"
                    className="mb-2 block uppercase"
                    style={{
                      fontFamily: brand.fontHeading,
                      letterSpacing: "0.2em",
                      fontSize: "11px",
                      color: ink,
                    }}
                  >
                    Email
                  </Label>
                  <Input
                    data-wf="i-1-0-0"
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    disabled={busy || done}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                    }}
                    aria-invalid={fieldErrors.email ? "true" : "false"}
                    aria-describedby={fieldErrors.email ? "login-email-error" : "login-email-hint"}
                    className="w-full px-3 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ ...fieldStyle("email", !!fieldErrors.email), outlineColor: ink }}
                  />
                  {fieldErrors.email ? (
                    <p
                      id="login-email-error"
                      className="mt-2 flex items-start gap-1.5 text-[12.5px] leading-5"
                      style={{ color: ink }}
                    >
                      <Icons.AlertCircle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      {fieldErrors.email}
                    </p>
                  ) : (
                    <p
                      id="login-email-hint"
                      className="mt-2 text-[12.5px] leading-5"
                      style={{ color: muted }}
                    >
                      The address you registered with.
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="login-password"
                    className="mb-2 block uppercase"
                    style={{
                      fontFamily: brand.fontHeading,
                      letterSpacing: "0.2em",
                      fontSize: "11px",
                      color: ink,
                    }}
                  >
                    Password
                  </Label>
                  <Input
                    data-wf="i-1-0-1"
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="&lt;your-password&gt;"
                    value={password}
                    disabled={busy || done}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password)
                        setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    aria-invalid={fieldErrors.password ? "true" : "false"}
                    aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                    className="w-full px-3 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      ...fieldStyle("password", !!fieldErrors.password),
                      outlineColor: ink,
                      letterSpacing: password ? "0.18em" : "normal",
                    }}
                  />
                  {fieldErrors.password && (
                    <p
                      id="login-password-error"
                      className="mt-2 flex items-start gap-1.5 text-[12.5px] leading-5"
                      style={{ color: ink }}
                    >
                      <Icons.AlertCircle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* b-2-0 — primary action */}
              <div className="mt-8">
                <Button
                  data-wf="b-2-0"
                  type="submit"
                  disabled={busy || done}
                  aria-busy={busy ? "true" : "false"}
                  className="relative w-full overflow-hidden px-6 py-3.5 uppercase focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: ink,
                    color: gold,
                    borderRadius: 0,
                    border: `1px solid ${ink}`,
                    boxShadow: `inset 0 0 0 1px ${tint(gold, 0.55)}`,
                    outlineColor: ink,
                    minHeight: "52px",
                    fontFamily: brand.fontHeading,
                    letterSpacing: "0.26em",
                    fontSize: "12.5px",
                    opacity: busy ? 0.82 : 1,
                    transition: "opacity 160ms ease",
                  }}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {done && <Icons.Check className="h-4 w-4" aria-hidden="true" />}
                    {busy ? "Verifying…" : done ? "Signed in" : "Log in"}
                  </span>
                  {busy && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden"
                    >
                      <span
                        className="gb-sweep block h-full w-1/3"
                        style={{ backgroundColor: gold }}
                      />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <Rule className="mt-9" />

            {/* b-3-0 — route to registration */}
            <div className="mt-7 text-center">
              <button
                data-wf="b-3-0"
                type="button"
                onClick={() => navigate("register")}
                className="inline-block px-2 py-2 text-[13px] underline underline-offset-[6px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  color: ink,
                  textDecorationColor: gold,
                  outlineColor: ink,
                  backgroundColor: "transparent",
                }}
              >
                No account yet? Create one
              </button>
              <p className="mt-3 text-[12px] leading-5" style={{ color: muted }}>
                Registration takes an email and a password — no verification message to wait for.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11.5px] leading-5" style={{ color: muted }}>
          Sessions close after{" "}
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{SESSION_IDLE_MINUTES}</span> minutes
          of inactivity.
        </p>
      </div>
    </div>
  );
}
