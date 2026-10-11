import type { JSX, SVGProps } from "react";

export function NodeJSIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-[#22c55e]"
      {...props}
    >
      <path d="M12 2L3 7.5v9L12 22l9-5.5v-9L12 2z" />
      <path d="M12 12l9-5.5" />
      <path d="M12 12v10" />
      <path d="M12 12L3 6.5" />
    </svg>
  );
}

export function LaravelIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-[#ef4444]"
      {...props}
    >
      <path d="M7 6l5-3 5 3v12l-5 3-5-3V6z" />
      <path d="M12 3v18" />
      <path d="M7 6l5 3 5-3" />
      <path d="M7 18l5-3 5 3" />
    </svg>
  );
}

export function NextJSIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-6 text-foreground"
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 8v8m0-8l7.5 9m-1.5-9v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ReactIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-6 text-[#38bdf8]"
      {...props}
    >
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function TailwindCSSIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-6 text-[#06b6d4]"
      {...props}
    >
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.287 1.624C7.666 17.818 9.027 19.2 12.001 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.287-1.624C10.336 13.382 8.975 12 6.001 12z" />
    </svg>
  );
}

/* Systems Stack Icons for Proof Grounded Engineering */
export function GoIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-[#00add8]"
      {...props}
    >
      <path d="M3 12h5m-5-3h3m-3 6h3" />
      <path d="M14 9.5a3.5 3.5 0 1 0 0 5h2v-2h-2" />
      <circle cx="20" cy="12" r="2.5" />
    </svg>
  );
}

export function RedisIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-[#dc2626]"
      {...props}
    >
      <path d="M12 2L3 6.5 12 11l9-4.5L12 2z" />
      <path d="M3 12l9 4.5 9-4.5" />
      <path d="M3 17.5l9 4.5 9-4.5" />
    </svg>
  );
}

export function PostgresIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-[#336791]"
      {...props}
    >
      <path d="M12 3a7 7 0 0 0-7 7c0 4.5 3.5 8 7 11 3.5-3 7-6.5 7-11a7 7 0 0 0-7-7z" />
      <path d="M9 10a3 3 0 0 0 6 0" />
      <path d="M12 13v4" />
    </svg>
  );
}

export function DockerIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-[#2496ed]"
      {...props}
    >
      <path d="M2 13.5c1 3.5 5 6.5 10 6.5s9-3 10-6.5C21 12 19 12 17 13c-2-3-7-3-8 0-2 0-5-.5-7 .5z" />
      <rect x="5" y="10" width="2" height="2" />
      <rect x="8" y="10" width="2" height="2" />
      <rect x="11" y="10" width="2" height="2" />
      <rect x="8" y="7" width="2" height="2" />
      <rect x="11" y="7" width="2" height="2" />
      <rect x="14" y="10" width="2" height="2" />
    </svg>
  );
}

export function TypeScriptIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-[#3178c6]"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h6m-3 0v8" />
      <path d="M17 11.5c-1 0-2 .5-2 1.5s1 1.5 2 2 1 1 1 2-1 1-2 1" />
    </svg>
  );
}
