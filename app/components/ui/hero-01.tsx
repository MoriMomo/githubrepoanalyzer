import type { JSX } from "react";
import { useState } from "react";
import { Volume2Icon, VolumeXIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/Button";
import {
  LaravelIcon,
  NextJSIcon,
  NodeJSIcon,
  ReactIcon,
  TailwindCSSIcon,
} from "~/components/ui/hero-01-utils/hero-01-icons";

export interface Hero01Props {
  headline?: React.ReactNode;
  brandName?: string;
  brandPronunciation?: string;
  description?: React.ReactNode;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  techItems?: Array<{
    icon: JSX.Element;
    title: string;
  }>;
  rightSectorContent?: React.ReactNode;
  className?: string;
}

export function Hero01({
  headline,
  brandName = "Acme",
  brandPronunciation,
  description,
  primaryAction,
  secondaryAction,
  techItems,
  rightSectorContent,
  className,
}: Hero01Props = {}) {
  return (
    <div className={cn("relative w-full overflow-hidden py-8", className)}>
      <div className="container mx-auto px-2 sm:px-4">
        {/* Mobile View (< md) */}
        <div className="screen-line-top screen-line-bottom border-x border-line md:hidden">
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible text-line"
            viewBox="0 0 210 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="text-line">
              <path
                d="M380.853 105.099L-201.625 464.632"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M-165.247 -267.831L369.777 600.141"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <g>
              <path
                d="M209.5 260L130 260"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M129.5 339.5L129.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M159.5 260L159.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M3.09944e-06 210L209.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M160 240L130.133 240"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M149.5 240L149.5 260"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <g>
              <rect
                x="159.5"
                y="210"
                width="30"
                height="30"
                transform="rotate(90 159.5 210)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="149.5"
                y="240"
                width="20"
                height="20"
                transform="rotate(90 149.5 240)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="159.5"
                y="240"
                width="20"
                height="10"
                transform="rotate(90 159.5 240)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {/* golden spiral */}
            <path
              className="text-border"
              d="M149.643 239.897C155.106 239.897 159.619 244.414 159.619 249.882C159.619 255.35 155.106 259.868 149.643 259.868C138.717 259.868 129.69 250.833 129.69 239.897C129.69 223.493 143.23 209.941 159.619 209.941C186.935 209.941 209.5 232.527 209.5 259.868C209.5 303.613 173.396 339.75 129.69 339.75C58.6695 339.75 -1.22732e-05 281.027 -9.16589e-06 209.941C-4.14648e-06 95.1103 94.7738 0.24998 209.5 0.249985C395.69 0.250001 549.5 154.06 549.5 340.25"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative grid grid-cols-1 divide-y divide-border">
            <MainContent
              headline={headline}
              brandName={brandName}
              brandPronunciation={brandPronunciation}
              description={description}
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              techItems={techItems}
            />

            {rightSectorContent && (
              <div className="flex flex-col items-center justify-center overflow-hidden p-4">
                {rightSectorContent}
              </div>
            )}
          </div>
        </div>

        {/* Desktop View (>= md) */}
        <div className="screen-line-top screen-line-bottom hidden border-x border-line md:block">
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible text-line"
            viewBox="0 0 340 210"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="text-line">
              <path
                d="M105.1 -170.853L464.633 411.625"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M-267.831 375.247L600.141 -159.777"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <g>
              <path
                d="M260 0.5V80"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M339.5 80.5H210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M210 210V0.5"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <g>
              <rect
                x="210"
                y="50.5"
                width="30"
                height="30"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="240"
                y="60.5"
                width="20"
                height="20"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="240"
                y="50.5"
                width="20"
                height="10"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {/* golden spiral */}
            <path
              className="text-border"
              d="M239.897 60.3571C239.897 54.894 244.414 50.381 249.882 50.381C255.35 50.381 259.868 54.894 259.868 60.3571C259.868 71.2835 250.833 80.3095 239.897 80.3095C223.493 80.3095 209.941 66.7704 209.941 50.381C209.941 23.0652 232.527 0.499999 259.868 0.5C303.613 0.499995 339.75 36.6043 339.75 80.3095C339.75 151.33 281.027 210 209.941 210C95.1103 210 0.25 115.226 0.25 0.5C0.250008 -185.69 154.06 -339.5 340.25 -339.5"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative grid min-h-[460px] grid-cols-[1.618fr_minmax(0,1fr)]">
            <MainContent
              className="col-1"
              headline={headline}
              brandName={brandName}
              brandPronunciation={brandPronunciation}
              description={description}
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              techItems={techItems}
            />

            <div className="col-2 flex flex-col justify-between p-6 lg:p-8 border-l border-line/40 bg-surface/20 backdrop-blur-[2px]">
              <div className="flex items-center justify-between text-xs font-mono text-text-dim border-b border-border/40 pb-3">
                <span className="flex items-center gap-1.5 text-accent">
                  <span className="inline-block size-1.5 rounded-full bg-accent animate-pulse" />
                  Φ = 1.618033
                </span>
                <span className="text-[11px] text-text-muted">BLUEPRINT v2.4</span>
              </div>

              <div className="my-auto py-4">
                {rightSectorContent}
              </div>

              <div className="text-[11px] font-mono text-text-muted flex items-center justify-between pt-3 border-t border-border/40">
                <span>[AST GROUNDED]</span>
                <span>100% CLIENT-SIDE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MainContentProps {
  className?: string;
  headline?: React.ReactNode;
  brandName?: string;
  brandPronunciation?: string;
  description?: React.ReactNode;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  techItems?: Array<{
    icon: JSX.Element;
    title: string;
  }>;
}

function MainContent({
  className,
  headline,
  brandName = "Acme",
  brandPronunciation = "Acme /ˈæk.mi/",
  description,
  primaryAction,
  secondaryAction,
  techItems,
}: MainContentProps) {
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(brandName);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingSound(true);
      utterance.onend = () => setIsPlayingSound(false);
      utterance.onerror = () => setIsPlayingSound(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingSound(false);
    }
  };

  const defaultTechItems = [
    { icon: <NodeJSIcon />, title: "Node.js" },
    { icon: <LaravelIcon />, title: "Laravel" },
    { icon: <NextJSIcon />, title: "Next.js" },
    { icon: <ReactIcon />, title: "React" },
    { icon: <TailwindCSSIcon />, title: "Tailwind CSS" },
  ];

  const items = techItems && techItems.length > 0 ? techItems : defaultTechItems;

  return (
    <div
      className={cn(
        "flex flex-col justify-center overflow-hidden p-6 sm:p-8 lg:p-12",
        className
      )}
    >
      <div className="mb-4">
        {headline ? (
          headline
        ) : (
          <h1 className="font-heading text-[2.5rem]/none font-medium tracking-tight text-foreground sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl">
            Plan. Build. Ship.
          </h1>
        )}
      </div>

      <div className="mb-6 text-base leading-relaxed text-muted-foreground sm:mb-8 sm:text-xl sm:text-balance md:text-lg lg:text-xl">
        {description ? (
          description
        ) : (
          <p>
            {brandName}{" "}
            <button
              type="button"
              onClick={handleSpeak}
              title={`Pronunciation: ${brandPronunciation}`}
              className="relative top-0.75 inline-flex items-center justify-center p-1 rounded hover:bg-surface-2 transition-[scale,colors] outline-none active:scale-[0.97] sm:top-1 text-accent cursor-pointer"
              aria-label="Pronunciation"
            >
              {isPlayingSound ? (
                <VolumeXIcon className="size-[1.1em] animate-pulse" />
              ) : (
                <Volume2Icon className="size-[1.1em]" />
              )}
            </button>{" "}
            provides{" "}
            <strong className="font-normal text-foreground">professional,</strong>{" "}
            <strong className="font-normal text-foreground">high-quality</strong>{" "}
            software design and development services based on your ideas.
          </p>
        )}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        {primaryAction?.onClick ? (
          <Button
            className="border-none px-6 sm:px-8 font-semibold shadow-md shadow-accent/25"
            size="lg"
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        ) : (
          <Button className="border-none px-6 sm:px-8 font-semibold shadow-md shadow-accent/25" size="lg" asChild>
            <a href={primaryAction?.href ?? "#"}>
              {primaryAction?.label ?? "Sign up now"}
            </a>
          </Button>
        )}

        {secondaryAction?.onClick ? (
          <Button
            className="px-6 sm:px-8 border-border hover:bg-surface-2"
            variant="outline"
            size="lg"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        ) : (
          <Button className="px-6 sm:px-8 border-border hover:bg-surface-2" variant="outline" size="lg" asChild>
            <a href={secondaryAction?.href ?? "#"}>
              {secondaryAction?.label ?? "Learn more"}
            </a>
          </Button>
        )}
      </div>

      <div className="relative -ml-4 lg:ml-0 pt-2 border-t border-line/50">
        <div className="absolute -top-2 right-0 z-1 block h-10 w-20 bg-background mask-[linear-gradient(to_left,white,transparent)] lg:hidden" />

        <div className="no-scrollbar flex items-center gap-4 sm:gap-6 overflow-x-auto px-4 lg:px-0 pr-6">
          {items.map((tech) => (
            <TechItem key={tech.title} icon={tech.icon} title={tech.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TechItem({ icon, title }: { icon: JSX.Element; title: string }) {
  return (
    <div className="flex items-center space-x-2 text-muted-foreground select-none transition-colors hover:text-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5">
      {icon}
      <span className="text-xs font-mono font-medium whitespace-nowrap">{title}</span>
    </div>
  );
}

export default Hero01;
