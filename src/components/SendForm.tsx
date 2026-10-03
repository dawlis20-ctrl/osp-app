"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type State = { status: "idle" | "sending" | "done" | "error"; message?: string };

// The report is never stored: the form is posted to an API route that fills the Word template
// and e-mails it. Doing it with fetch (instead of a form action) keeps everything the user typed
// and every chosen photo on screen if sending fails, so nothing has to be re-entered.
export function SendForm({
  endpoint,
  submitLabel,
  doneTitle,
  children,
}: {
  endpoint: string;
  submitLabel: string;
  doneTitle: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "sending" });
    try {
      const response = await fetch(endpoint, { method: "POST", body: new FormData(event.currentTarget) });
      if (response.redirected && response.url.includes("/login")) {
        throw new Error("Sesja wygasła — zaloguj się ponownie (dane w formularzu zostaną na ekranie).");
      }
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; message?: string } | null;
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || `Nie udało się wysłać (błąd ${response.status}).`);
      }
      setState({ status: "done", message: result.message });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Nie udało się wysłać." });
    }
  }

  if (state.status === "done") {
    return (
      <div className="flex max-w-xl flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-800">{doneTitle}</h2>
        {state.message && <p className="text-sm text-emerald-800">{state.message}</p>}
        <p className="text-sm text-emerald-700">Dokument nie jest zapisywany w aplikacji — został tylko w wiadomości e-mail.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="self-start rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Przygotuj kolejny
        </button>
      </div>
    );
  }

  const sending = state.status === "sending";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {children}

      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Nie wysłano: {state.message}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:cursor-wait disabled:opacity-60"
        >
          {sending ? "Wysyłanie…" : submitLabel}
        </button>
        {sending && <span className="text-sm text-gray-500">To potrwa chwilę — nie zamykaj strony.</span>}
      </div>
    </form>
  );
}
