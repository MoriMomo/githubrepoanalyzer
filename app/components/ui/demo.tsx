// This is a file with a demo for your component
// That's what users will see in the preview
// Create new files in this directory to add more demos

import { Component } from "@/components/ui/dev-tool-landing-page";
import { Hero01 } from "~/components/ui/hero-01";

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return <Component />;
}

export function Hero01Demo() {
  return <Hero01 />;
}
