// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { api } from "@/api/client";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Label } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { AlertCircle } = Icons;

// Visible messages (word for word, approved screen spec):
const MSG_INVALID_CREDENTIALS = "Email or password is incorrect";
const MSG_SESSION_EXPIRED = "Your session has expired, please log in again";
const MSG_DEACTIVATED = "This account has been deactivated";

export default function Screen() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [formError, setFormError] = React.useState(null);
  const [sessionExpired, setSessionExpired] = React.useState(false);
  // idle | submitting
  const [status, setStatus] = React.useState("idle");

  const busy = status === "submitting";

  // AC-012 / NFR-002: a session left over from before it expired is only found out
  // the next time it is actually used. A token already on the device is checked
  // against GET /auth/me as soon as this screen mounts; if the session has expired
  // (or was revoked), the stale token is dropped and the prompt is shown here.
  React.useEffect(() => {
    const token = getSessionToken();
    if (!token) return undefined;
    let active = true;
    api
      .GET("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        if (!data) {
          clearSessionToken();
          setSessionExpired(true);
        }
      })
      .catch(() => {
        if (active) {
          clearSessionToken();
          setSessionExpired(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;

    setFormError(null);
    setSessionExpired(false);
    setStatus("submitting");
    try {
      const { data, response } = await api.POST("/auth/login", {
        body: { email: email.trim(), password },
      });
      if (data && data.token) {
        // AC-010: correct credentials for an active account log the user in and
        // start a session.
        setSessionToken(data.token);
        setStatus("idle");
        navigate("ideas");
        return;
      }
      if (response && response.status === 403) {
        setStatus("idle");
        setFormError(MSG_DEACTIVATED);
        return;
      }
      // AC-011 / NFR-005: an incorrect password or an unknown email both land
      // here, worded so neither field is named as the one that was wrong, and
      // no session is started.
      setStatus("idle");
      setFormError(MSG_INVALID_CREDENTIALS);
    } catch {
      setStatus("idle");
      setFormError(MSG_INVALID_CREDENTIALS);
    }
  }

  const caps = {
    fontFamily: brand.fontHeading,
    textTransform: "uppercase",
    letterSpacing: "0.3em",
  };

  return (
    <div
      className="mx-auto w-full max-w-md space-y-8 px-4 py-10 sm:py-14"
      style={{ color: brand.primaryColor, fontFamily: brand.fontBody }}
    >
      <header className="space-y-3 text-center">
        <h1 data-testid="log-in-title" className="text-3xl" style={caps}>
          Log in
        </h1>
        <p className="text-sm" style={{ color: brand.neutralColor }}>
          Log in with the email and password on your account.
        </p>
      </header>

      <div aria-live="polite">
        {sessionExpired ? (
          <p
            role="status"
            className="flex items-start gap-2 px-4 py-3 text-sm"
            style={{
              border: `1px solid ${brand.primaryColor}`,
              backgroundColor: `${brand.primaryColor}11`,
            }}
          >
            <AlertCircle size={16} aria-hidden />
            <span>{MSG_SESSION_EXPIRED}</span>
          </p>
        ) : null}

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
      </div>

      <form data-testid="form-1" onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Label htmlFor="login-email">Email</Label>
          <Input
            data-testid="email-input"
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            disabled={busy}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full"
          />
        </div>

        <div>
          <Label htmlFor="login-password">Password</Label>
          <Input
            data-testid="password-input"
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            disabled={busy}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full"
          />
        </div>

        <Button
          data-testid="log-in-btn"
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="w-full"
        >
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm" style={{ color: brand.neutralColor }}>
        <button
          type="button"
          data-testid="no-account-yet-create-one-link"
          onClick={() => navigate("register")}
          className="underline underline-offset-4"
          style={{ color: brand.primaryColor }}
        >
          No account yet? Create one
        </button>
      </p>
    </div>
  );
}
