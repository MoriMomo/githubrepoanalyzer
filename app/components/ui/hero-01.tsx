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
  badge?: React.ReactNode;
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
  trustNotes?: React.ReactNode;
  techItems?: Array<{
    icon: JSX.Element;
    title: string;
  }>;
  className?: string;
}

export function Hero01({
  badge,
  headline,
  brandName = "Acme",
  brandPronunciation,
  description,
  primaryAction,
  secondaryAction,
  trustNotes,
  techItems,
  className,
}: Hero01Props = {}) {
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
    <div className={cn("relative w-full overflow-hidden py-10 sm:py-14", className)}>
      {/* Ambient subtle depth glow (zero harsh vectors) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[540px] sm:w-[720px] h-[320px] bg-accent/6 blur-[130px] rounded-full"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Category / Status Badge */}
        {badge && (
          <div className="flex justify-center">
            {badge}
          </div>
        )}

        {/* Primary Headline */}
        <div className="space-y-4">
          {headline ? (
            headline
          ) : (
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Plan. Build. Ship.
            </h1>
          )}
        </div>

        {/* Supporting Description */}
        <div className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans">
          {description ? (
            description
          ) : (
            <p>
              {brandName}{" "}
              <button
                type="button"
                onClick={handleSpeak}
                title={`Pronunciation: ${brandPronunciation ?? brandName}`}
                className="relative top-0.5 inline-flex items-center justify-center p-1 rounded-md text-accent hover:bg-surface-2 transition-[colors,transform] active:scale-95 cursor-pointer"
                aria-label="Pronunciation"
              >
                {isPlayingSound ? (
                  <VolumeXIcon className="size-4 animate-pulse" />
                ) : (
                  <Volume2Icon className="size-4" />
                )}
              </button>{" "}
              provides professional, high-quality software development services based on your ideas.
            </p>
          )}
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1">
          {primaryAction?.onClick ? (
            <Button
              className="w-full sm:w-auto px-7 py-3 text-sm font-bold shadow-md shadow-accent/20"
              size="lg"
              variant="primary"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto px-7 py-3 text-sm font-bold shadow-md shadow-accent/20"
              size="lg"
              variant="primary"
              asChild
            >
              <a href={primaryAction?.href ?? "#"}>
                {primaryAction?.label ?? "Launch Workspace"}
              </a>
            </Button>
          )}

          {secondaryAction?.onClick ? (
            <Button
              className="w-full sm:w-auto px-6 py-3 text-sm border-border hover:bg-surface-2"
              variant="outline"
              size="lg"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto px-6 py-3 text-sm border-border hover:bg-surface-2"
              variant="outline"
              size="lg"
              asChild
            >
              <a href={secondaryAction?.href ?? "#"}>
                {secondaryAction?.label ?? "Audit Sample"}
              </a>
            </Button>
          )}
        </div>

        {/* Trust Signals */}
        {trustNotes && (
          <div className="text-[11px] font-mono text-text-dim/80 pt-0.5">
            {trustNotes}
          </div>
        )}

        {/* Minimalist Verified Systems Strip */}
        <div className="pt-8 border-t border-border/50 max-w-2xl mx-auto">
          <div className="flex items-center justify-center flex-wrap gap-5 sm:gap-7">
            {items.map((tech) => (
              <TechBadge key={tech.title} icon={tech.icon} title={tech.title} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TechBadge({ icon, title }: { icon: JSX.Element; title: string }) {
  return (
    <div className="flex items-center space-x-2 text-text-dim hover:text-text transition-colors select-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
      {icon}
      <span className="text-xs font-mono font-medium whitespace-nowrap">{title}</span>
    </div>
  );
}

export default Hero01;
