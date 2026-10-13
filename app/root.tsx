import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { Toaster } from "sonner";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Proof — Defensible Resume Bullets</title>
        <Meta />
        <Links />
        <script src="https://js.puter.com/v2/" defer></script>
      </head>
      <body
        suppressHydrationWarning
        className="bg-bg text-text min-h-screen selection:bg-accent/20 selection:text-accent"
      >
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            className: "bg-surface-2 border border-border text-text font-sans text-xs shadow-xl",
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { init } = usePuterStore();

  useEffect(() => {
    init();
  }, [init]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h1 className="text-xl font-semibold text-rose-400">{message}</h1>
        <p className="text-sm text-slate-400">{details}</p>
        {stack && (
          <pre className="w-full p-3 bg-slate-950 rounded text-xs font-mono text-slate-300 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
        <a
          href="/"
          className="inline-block text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          &larr; Return to Home
        </a>
      </div>
    </main>
  );
}
