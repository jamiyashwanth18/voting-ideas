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
const { Check, ChevronRight, AlertCircle, CheckCircle } = Icons;

// ─────────────────────────────────────────────────────────────────────────────
// Create Account — route: register  (pre-sign-in, full page)
// ─────────────────────────────────────────────────────────────────────────────

// Accounts already on the board — used to reject a duplicate registration.
const REGISTERED_EMAILS = [
  "nora.whitfield@beaumont.co",
  "j.carraway@westegg.org",
  "elsie.mortimer@plazaworks.com",
  "dmitri.volkov@valleyofashes.net",
  "harriet.beaumont@gmail.com",
];

const PASSWORD_MIN = 8;
const EMAIL_MAX = 254;

function gxAlpha(hex, a) {
  const h = String(hex || "#000000").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

export default function Screen() {
  const navigate = useNavigate();
  const primary = brand.primaryColor;
  const accent = brand.accentColor;
  const bg = brand.backgroundColor;

  const ink = { color: primary };
  const muted = { color: gxAlpha(primary, 0.68) };

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);
  const [status, setStatus] = React.useState("idle"); // idle | submitting | success
  const [formError, setFormError] = React.useState(null);

  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const confirmRef = React.useRef(null);

  const trimmedEmail = email.trim();
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(trimmedEmail);
  const longEnough = password.length >= PASSWORD_MIN;
  const matches = confirm.length > 0 && confirm === password;

  const errors = {};
  if (!trimmedEmail) {
    errors.email = "Enter the email address you'll sign in with.";
  } else if (trimmedEmail.length > EMAIL_MAX) {
    errors.email = "That address is longer than 254 characters.";
  } else if (!emailLooksValid) {
    errors.email = "That isn't a complete address — check for a missing @ or domain.";
  }
  if (!password) {
    errors.password = "Choose a password of at least 8 characters.";
  } else if (!longEnough) {
    errors.password =
      "Use at least 8 characters. Yours has " + password.length + ".";
  }
  if (!confirm) {
    errors.confirm = "Type the password a second time to confirm it.";
  } else if (confirm !== password) {
    errors.confirm = "The two passwords don't match.";
  }

  const busy = status === "submitting";
  const done = status === "success";
  const locked = busy || done;

  // Simulated round-trip to POST /auth/register
  React.useEffect(() => {
    if (status !== "submitting") return undefined;
    const t = setTimeout(() => {
      const taken = REGISTERED_EMAILS.some(
        (e) => e.toLowerCase() === trimmedEmail.toLowerCase()
      );
      if (taken) {
        setStatus("idle");
        setFormError({
          title: "Registration refused",
          body:
            trimmedEmail +
            " is already registered on this board. Nothing you typed was lost — log in with that address, or register another one.",
        });
      } else {
        setFormError(null);
        setStatus("success");
      }
    }, 850);
    return () => clearTimeout(t);
  }, [status, trimmedEmail]);

  // On success, move the new member to the board.
  React.useEffect(() => {
    if (status !== "success") return undefined;
    const t = setTimeout(() => navigate("ideas"), 1600);
    return () => clearTimeout(t);
  }, [status]);

  function handleSubmit(e) {
    e.preventDefault();
    if (locked) return;
    setShowErrors(true);
    if (errors.email) {
      setFormError(null);
      if (emailRef.current) emailRef.current.focus();
      return;
    }
    if (errors.password) {
      setFormError(null);
      if (passwordRef.current) passwordRef.current.focus();
      return;
    }
    if (errors.confirm) {
      setFormError(null);
      if (confirmRef.current) confirmRef.current.focus();
      return;
    }
    setFormError(null);
    setStatus("submitting");
  }

  const fieldStyle = (invalid) => ({
    backgroundColor: "transparent",
    border: "1px solid " + (invalid ? primary : gxAlpha(primary, 0.28)),
    borderRadius: 0,
    color: primary,
    fontFamily: brand.fontBody,
    fontVariantNumeric: "tabular-nums",
    height: "48px",
    paddingLeft: "12px",
    paddingRight: invalid ? "12px" : "12px",
    boxShadow: invalid ? "inset 0 -2px 0 0 " + primary : "none",
  });

  const labelStyle = {
    color: primary,
    fontFamily: brand.fontHeading,
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  };

  // Decorative rule: two hairlines broken by a centre diamond.
  const Rule = ({ className }) => (
    <div className={"flex items-center " + (className || "")} aria-hidden="true">
      <span className="flex-1">
        <span className="block h-px" style={{ backgroundColor: gxAlpha(primary, 0.85) }} />
        <span className="mt-[3px] block h-px" style={{ backgroundColor: accent }} />
      </span>
      <span className="mx-3 flex items-center gap-[6px]">
        <span
          className="block h-[5px] w-[5px] rotate-45"
          style={{ backgroundColor: accent }}
        />
        <span
          className="block h-[9px] w-[9px] rotate-45"
          style={{ border: "1px solid " + primary, backgroundColor: gxAlpha(accent, 0.55) }}
        />
        <span
          className="block h-[5px] w-[5px] rotate-45"
          style={{ backgroundColor: accent }}
        />
      </span>
      <span className="flex-1">
        <span className="block h-px" style={{ backgroundColor: gxAlpha(primary, 0.85) }} />
        <span className="mt-[3px] block h-px" style={{ backgroundColor: accent }} />
      </span>
    </div>
  );

  const Requirement = ({ met, children }) => (
    <li className="flex items-center gap-2" style={met ? ink : muted}>
      {met ? (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <span
          className="block h-[7px] w-[7px] shrink-0 rotate-45"
          style={{ border: "1px solid " + gxAlpha(primary, 0.45) }}
          aria-hidden="true"
        />
      )}
      <span className="text-[12.5px] leading-5">
        {children}
        <span className="sr-only">{met ? " — met" : " — not yet met"}</span>
      </span>
    </li>
  );

  return (
    <div
      className="gx-root min-h-screen w-full px-4 py-12 sm:px-6 sm:py-16"
      style={{
        backgroundColor: bg,
        fontFamily: brand.fontBody,
        "--gx-primary": primary,
        "--gx-accent": accent,
      }}
    >
      <style>{`
        .gx-root :focus-visible {
          outline: 2px solid var(--gx-primary);
          outline-offset: 3px;
        }
        .gx-root .gx-field::placeholder { color: ${gxAlpha(primary, 0.35)}; }
        .gx-root .gx-field:hover:not(:disabled) { border-color: ${gxAlpha(primary, 0.55)}; }
        .gx-root .gx-field:focus { border-color: ${primary}; }
        .gx-root .gx-field:disabled { opacity: 0.6; cursor: not-allowed; }
        .gx-root .gx-submit { transition: background-color .18s ease, color .18s ease, box-shadow .18s ease; }
        .gx-root .gx-submit:hover:not(:disabled) {
          box-shadow: inset 0 0 0 1px ${accent}, inset 0 0 0 5px ${primary}, inset 0 0 0 6px ${gxAlpha(accent, 0.55)};
        }
        .gx-root .gx-submit:active:not(:disabled) { transform: translateY(1px); }
        .gx-root .gx-submit:disabled { cursor: not-allowed; }
        .gx-root .gx-textlink { transition: color .15s ease, border-color .15s ease; }
        .gx-root .gx-textlink:hover { border-color: ${primary}; }
        .gx-root .gx-textlink:hover .gx-textlink-mark { border-color: ${primary}; }
        @keyframes gxSpin { to { transform: rotate(360deg); } }
        @keyframes gxRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gxSweep { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .gx-rise { animation: gxRise .32s ease-out both; }
        .gx-spin { animation: gxSpin .9s linear infinite; }
        .gx-sweep { animation: gxSweep 1.6s linear both; transform-origin: left; }
        @media (prefers-reduced-motion: reduce) {
          .gx-root *, .gx-root *::before, .gx-root *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .001ms !important;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[560px]">
        {/* Deco crest ornament */}
        <div className="mb-8 flex flex-col items-center" aria-hidden="true">
          <span
            className="block h-[14px] w-[14px] rotate-45"
            style={{ border: "1px solid " + primary, backgroundColor: gxAlpha(accent, 0.5) }}
          />
          <span className="mt-2 block h-[18px] w-px" style={{ backgroundColor: accent }} />
          <div className="mt-2 flex items-end gap-[3px]">
            <span className="block w-px" style={{ height: "8px", backgroundColor: primary }} />
            <span className="block w-px" style={{ height: "14px", backgroundColor: primary }} />
            <span className="block w-px" style={{ height: "20px", backgroundColor: accent }} />
            <span className="block w-px" style={{ height: "14px", backgroundColor: primary }} />
            <span className="block w-px" style={{ height: "8px", backgroundColor: primary }} />
          </div>
        </div>

        {/* b-0-0 — page title */}
        <h1
          data-wf="b-0-0"
          className="text-center text-[30px] leading-[1.15] sm:text-[38px]"
          style={{
            ...ink,
            fontFamily: brand.fontHeading,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Create account
        </h1>

        <Rule className="mx-auto mt-6 max-w-[380px]" />

        {/* b-1-0 — intro text */}
        <p
          data-wf="b-1-0"
          className="mx-auto mt-6 max-w-[46ch] text-center text-[15px] leading-7"
          style={muted}
        >
          Your account works straight away. There is no email verification step.
        </p>

        {/* ── Double frame: accent hairline, primary outline offset outside ── */}
        <div
          className="mt-10"
          style={{ border: "1px solid " + primary, padding: "5px", borderRadius: 0 }}
        >
          <div
            style={{
              border: "1px solid " + accent,
              borderRadius: 0,
              backgroundColor: gxAlpha(accent, 0.06),
            }}
          >
            <div className="px-5 py-8 sm:px-10 sm:py-10">
              {/* Duplicate-email rejection (AC-007) */}
              {formError ? (
                <div
                  role="alert"
                  className="gx-rise mb-8 flex items-start gap-3 px-4 py-4"
                  style={{
                    border: "1px solid " + primary,
                    backgroundColor: gxAlpha(primary, 0.06),
                  }}
                >
                  <AlertCircle
                    className="mt-[2px] h-4 w-4 shrink-0"
                    style={ink}
                    aria-hidden="true"
                  />
                  <div>
                    <p
                      className="text-[11px]"
                      style={{
                        ...ink,
                        fontFamily: brand.fontHeading,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                      }}
                    >
                      {formError.title}
                    </p>
                    <p className="mt-2 text-[13.5px] leading-6" style={muted}>
                      {formError.body}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Account created (AC-006 / AC-009) */}
              {done ? (
                <div
                  role="status"
                  className="gx-rise mb-8 px-4 py-4"
                  style={{
                    border: "1px solid " + primary,
                    backgroundColor: gxAlpha(accent, 0.38),
                  }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      className="mt-[2px] h-4 w-4 shrink-0"
                      style={ink}
                      aria-hidden="true"
                    />
                    <div>
                      <p
                        className="text-[11px]"
                        style={{
                          ...ink,
                          fontFamily: brand.fontHeading,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                        }}
                      >
                        Account created
                      </p>
                      <p className="mt-2 text-[13.5px] leading-6" style={ink}>
                        {trimmedEmail} is signed in. No verification needed — opening the
                        idea board.
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-4 h-px w-full"
                    style={{ backgroundColor: gxAlpha(primary, 0.2) }}
                  >
                    <div
                      className="gx-sweep h-px w-full"
                      style={{ backgroundColor: primary }}
                    />
                  </div>
                </div>
              ) : null}

              {/* b-2-0 — registration form */}
              <form
                data-wf="b-2-0"
                onSubmit={handleSubmit}
                noValidate
                aria-label="Create your account"
                className="space-y-7"
              >
                {/* i-2-0-0 — Email */}
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <Label htmlFor="reg-email" style={labelStyle}>
                      Email
                    </Label>
                    <span
                      className="text-[11px]"
                      style={{ ...muted, fontVariantNumeric: "tabular-nums" }}
                    >
                      {trimmedEmail.length}/{EMAIL_MAX}
                    </span>
                  </div>
                  <Input
                    data-wf="i-2-0-0"
                    id="reg-email"
                    ref={emailRef}
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck="false"
                    disabled={locked}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="you@example.com"
                    aria-invalid={showErrors && !!errors.email}
                    aria-describedby="reg-email-note"
                    className="gx-field mt-2 w-full"
                    style={fieldStyle(showErrors && !!errors.email)}
                  />
                  <p
                    id="reg-email-note"
                    className="mt-2 flex items-start gap-2 text-[12.5px] leading-5"
                    style={showErrors && errors.email ? ink : muted}
                  >
                    {showErrors && errors.email ? (
                      <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : null}
                    <span>
                      {showErrors && errors.email
                        ? errors.email
                        : "This is the address you'll sign in with."}
                    </span>
                  </p>
                </div>

                {/* i-2-0-1 — Password */}
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <Label htmlFor="reg-password" style={labelStyle}>
                      Password (at least 8 characters)
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="gx-textlink text-[11px]"
                      style={{
                        ...ink,
                        fontFamily: brand.fontHeading,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid " + gxAlpha(primary, 0.4),
                      }}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    data-wf="i-2-0-1"
                    id="reg-password"
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    disabled={locked}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="<choose-a-password>"
                    aria-invalid={showErrors && !!errors.password}
                    aria-describedby="reg-password-rules"
                    className="gx-field mt-2 w-full"
                    style={fieldStyle(showErrors && !!errors.password)}
                  />
                  <ul id="reg-password-rules" className="mt-3 space-y-1.5">
                    <Requirement met={longEnough}>
                      At least 8 characters — {password.length} so far
                    </Requirement>
                    <Requirement met={password.length > 0 && !/\s/.test(password)}>
                      No spaces at the start or inside
                    </Requirement>
                  </ul>
                  {showErrors && errors.password ? (
                    <p
                      className="mt-2 flex items-start gap-2 text-[12.5px] leading-5"
                      style={ink}
                    >
                      <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.password}</span>
                    </p>
                  ) : null}
                </div>

                {/* i-2-0-2 — Confirm password */}
                <div>
                  <Label htmlFor="reg-confirm" style={labelStyle}>
                    Confirm password
                  </Label>
                  <Input
                    data-wf="i-2-0-2"
                    id="reg-confirm"
                    ref={confirmRef}
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    autoComplete="new-password"
                    disabled={locked}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="<repeat-your-password>"
                    aria-invalid={showErrors && !!errors.confirm}
                    aria-describedby="reg-confirm-note"
                    className="gx-field mt-2 w-full"
                    style={fieldStyle(showErrors && !!errors.confirm)}
                  />
                  <p
                    id="reg-confirm-note"
                    className="mt-2 flex items-start gap-2 text-[12.5px] leading-5"
                    style={showErrors && errors.confirm ? ink : muted}
                  >
                    {showErrors && errors.confirm ? (
                      <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : matches ? (
                      <Check className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : null}
                    <span>
                      {showErrors && errors.confirm
                        ? errors.confirm
                        : matches
                        ? "Both entries match."
                        : "Type it a second time so a typo can't lock you out."}
                    </span>
                  </p>
                </div>

                <Rule className="pt-1" />

                {/* b-3-0 — primary action */}
                <div data-wf="b-3-0">
                  <Button
                    type="submit"
                    disabled={locked}
                    aria-busy={busy}
                    className="gx-submit flex h-[56px] w-full items-center justify-center gap-3"
                    style={{
                      backgroundColor: primary,
                      color: done ? accent : accent,
                      borderRadius: 0,
                      border: "none",
                      opacity: locked ? 0.82 : 1,
                      fontFamily: brand.fontHeading,
                      fontSize: "13px",
                      letterSpacing: "0.26em",
                      textTransform: "uppercase",
                      boxShadow:
                        "inset 0 0 0 1px " +
                        primary +
                        ", inset 0 0 0 5px " +
                        primary +
                        ", inset 0 0 0 6px " +
                        gxAlpha(accent, 0.45),
                    }}
                  >
                    {busy ? (
                      <>
                        <span
                          className="gx-spin block h-[14px] w-[14px]"
                          style={{
                            border: "1px solid " + gxAlpha(accent, 0.35),
                            borderTopColor: accent,
                          }}
                          aria-hidden="true"
                        />
                        <span>Creating account…</span>
                      </>
                    ) : done ? (
                      <>
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        <span>Account created</span>
                      </>
                    ) : (
                      <span>Create account</span>
                    )}
                  </Button>
                  <p className="mt-4 text-center text-[12px] leading-5" style={muted}>
                    Free to join. Your password is stored hashed — we never keep the
                    original.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* b-4-0 — log in link */}
        <p className="mt-10 text-center text-[13.5px]">
          <button
            data-wf="b-4-0"
            type="button"
            onClick={() => navigate("login")}
            aria-label="Already registered? Log in"
            className="gx-textlink inline-flex items-baseline gap-2 py-1 align-baseline"
          >
            <span style={muted}>Already registered?</span>{" "}
            <span
              className="gx-textlink-mark inline-flex items-center gap-1.5"
              style={{
                ...ink,
                fontFamily: brand.fontHeading,
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                borderBottom: "1px solid " + accent,
              }}
            >
              Log in
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </button>
        </p>

        <div className="mt-10 flex items-center justify-center" aria-hidden="true">
          <span className="block h-px w-10" style={{ backgroundColor: gxAlpha(primary, 0.4) }} />
          <span
            className="mx-3 block h-[6px] w-[6px] rotate-45"
            style={{ backgroundColor: accent }}
          />
          <span className="block h-px w-10" style={{ backgroundColor: gxAlpha(primary, 0.4) }} />
        </div>
      </div>
    </div>
  );
}
