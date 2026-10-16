"use client";

import { CardStack, type CardStackItem } from "@/components/ui/card-stack";

export const DEMO_CARD_ITEMS: CardStackItem[] = [
  {
    id: 1,
    title: "Luxury Performance",
    description: "Experience the thrill of precision engineering with low-latency event workers.",
    imageSrc: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    href: "https://github.com",
    tag: "High Throughput",
  },
  {
    id: 2,
    title: "Elegant Architecture",
    description: "Where beauty meets functionality in clean domain service boundaries.",
    imageSrc: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    href: "https://github.com",
    tag: "Distributed Systems",
  },
  {
    id: 3,
    title: "Power & Concurrency",
    description: "Unleash the true potential of multi-threaded distributed streams and CDC.",
    imageSrc: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    href: "https://github.com",
    tag: "Redis Streams",
  },
  {
    id: 4,
    title: "Timeless Craftsmanship",
    description: "Built with passion, driven by excellence and zero-hallucination code extraction.",
    imageSrc: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    href: "https://github.com",
    tag: "Grounded Proof",
  },
  {
    id: 5,
    title: "Future of Verification",
    description: "Innovation that defends every senior engineering claim with verbatim proof.",
    imageSrc: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    href: "https://github.com",
    tag: "AST Parsing",
  },
];

export default function CardStackDemoPage() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-8">
        <CardStack
          items={DEMO_CARD_ITEMS}
          initialIndex={0}
          autoAdvance
          intervalMs={2800}
          pauseOnHover
          showDots
        />
      </div>
    </div>
  );
}
