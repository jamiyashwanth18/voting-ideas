// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { api } from "@/api/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Label } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { AlertCircle, CheckCircle } = Icons;

const PASSWORD_MIN = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Visible messages (word for word, approved screen spec):
const MSG_EMAIL_INVALID = "Enter a valid email address";
const MSG_PASSWORD_TOO_SHORT = "Password must be at least 8 characters";
const MSG_EMAIL_TAKEN = "This email is already registered";
const MSG_SUCCESS = "Account created, you can post and upvote now";

export default function Screen() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [formError, setFormError] = React.useState(null);
  // idle | submitting | success
  const [status, setStatus] = React.useState("idle");

  const busy = status === "submitting";
  const done = status === "success";
  const locked = busy || done;

  const caps = {
    fontFamily: brand.fontHeading,
    textTransform: "uppercase",
    letterSpacing: "0.3em",
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (locked) return;

    const trimmedEmail = email.trim();
    const errors = {};
    // AC-008: a malformed email is rejected with a validation message, no account created.
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.email = MSG_EMAIL_INVALID;
    }
    // AC-008: a password shorter than the stated rule is rejected the same way.
    if (password.length < PASSWORD_MIN) {
      errors.password = MSG_PASSWORD_TOO_SHORT;
    }
    if (!errors.password && confirm !== password) {
      errors.confirm = "Passwords must match";
    }

    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setStatus("submitting");
    try {
      const { data, response } = await api.POST("/auth/register", {
        body: { email: trimmedEmail, password },
      });
      if (data) {
        // AC-006 / AC-009: the account is usable immediately, no email-verification step.
        setStatus("success");
        return;
      }
      if (response && response.status === 409) {
        // AC-007: a duplicate email is rejected, no duplicate account is created.
        setStatus("idle");
        setFormError(MSG_EMAIL_TAKEN);
        return;
      }
      setStatus("idle");
      setFormError("Something went wrong. Please try again.");
    } catch {
      setStatus("idle");
      setFormError("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-md space-y-8 px-4 py-10 sm:py-14"
      style={{ color: brand.primaryColor, fontFamily: brand.fontBody }}
    >
      <header className="space-y-3 text-center">
        <h1 data-testid="create-account-title" className="text-3xl" style={caps}>
          Create account
        </h1>
        <p className="text-sm" style={{ color: brand.neutralColor }}>
          Your account works straight away — there is no email-verification step.
        </p>
      </header>

      <div aria-live="polite">
        {formError ? (
          <p
            role="alert"
            className="flex items-start gap-2 px-4 py-3 text-sm"
            style={{
              border: `1px solid ${brand.primaryColor}`,
              backgroundColor: `${brand.primaryColor}11`,
            }}
          >
            <AlertCircle size={16} aria-hidden />
            <span>{formError}</span>
          </p>
        ) : null}

        {done ? (
          <p
            role="status"
            className="flex items-start gap-2 px-4 py-3 text-sm"
            style={{
              border: `1px solid ${brand.accentColor}`,
              backgroundColor: `${brand.accentColor}22`,
            }}
          >
            <CheckCircle size={16} aria-hidden />
            <span>{MSG_SUCCESS}</span>
          </p>
        ) : null}
      </div>

      <form data-testid="form-1" onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Label htmlFor="register-email">Email</Label>
          <Input
            data-testid="email-input"
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            disabled={locked}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            aria-invalid={fieldErrors.email ? "true" : "false"}
            aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
            className="mt-2 w-full"
          />
          {fieldErrors.email ? (
            <p
              id="register-email-error"
              className="mt-2 flex items-start gap-1.5 text-[13px]"
              style={{ color: brand.primaryColor }}
            >
              <AlertCircle size={14} aria-hidden />
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="register-password">Password (at least 8 characters)</Label>
          <Input
            data-testid="password-at-least-8-characters-input"
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            disabled={locked}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password)
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            aria-invalid={fieldErrors.password ? "true" : "false"}
            aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
            className="mt-2 w-full"
          />
          {fieldErrors.password ? (
            <p
              id="register-password-error"
              className="mt-2 flex items-start gap-1.5 text-[13px]"
              style={{ color: brand.primaryColor }}
            >
              <AlertCircle size={14} aria-hidden />
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="register-confirm">Confirm password</Label>
          <Input
            data-testid="confirm-password-input"
            id="register-confirm"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            disabled={locked}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (fieldErrors.confirm) setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
            }}
            aria-invalid={fieldErrors.confirm ? "true" : "false"}
            aria-describedby={fieldErrors.confirm ? "register-confirm-error" : undefined}
            className="mt-2 w-full"
          />
          {fieldErrors.confirm ? (
            <p
              id="register-confirm-error"
              className="mt-2 flex items-start gap-1.5 text-[13px]"
              style={{ color: brand.primaryColor }}
            >
              <AlertCircle size={14} aria-hidden />
              {fieldErrors.confirm}
            </p>
          ) : null}
        </div>

        <Button
          data-testid="create-account-btn"
          type="submit"
          disabled={locked}
          aria-busy={busy}
          className="w-full"
        >
          {busy ? "Creating account…" : done ? "Account created" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm" style={{ color: brand.neutralColor }}>
        Already registered?{" "}
        <button
          type="button"
          data-testid="already-registered-log-in-link"
          onClick={() => navigate("login")}
          className="underline underline-offset-4"
          style={{ color: brand.primaryColor }}
        >
          Log in
        </button>
      </p>
    </div>
  );
}
