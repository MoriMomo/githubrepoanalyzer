import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check, FileCode2, Cpu, ShieldCheck, Activity } from 'lucide-react';

// ----------------------------------------------------------------------
// 1. Data Structures
// ----------------------------------------------------------------------
const DEMO_CODE = [
  { num: 1, type: 'comment', text: '// This is a file with a demo for your component' },
  { num: 2, type: 'comment', text: '// That\'s what users will see in the preview' },
  { num: 3, type: 'comment', text: '// Create new files in this directory to add more demos' },
  { num: 4, type: 'empty', text: '' },
  { num: 5, type: 'code', tokens: [
    { text: 'import ', className: 'text-rose-400' },
    { text: '{ ', className: 'text-amber-400' },
    { text: 'Component', className: 'text-amber-400' },
    { text: ' } ', className: 'text-amber-400' },
    { text: 'from ', className: 'text-rose-400' },
    { text: '"@/components/ui/component"', className: 'text-emerald-300/90' },
    { text: ';', className: 'text-zinc-500' }
  ]},
  { num: 6, type: 'empty', text: '' },
  { num: 7, type: 'comment', text: '// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO' },
  { num: 8, type: 'code', tokens: [
    { text: 'export default function ', className: 'text-rose-400' },
    { text: 'DemoOne', className: 'text-amber-400' },
    { text: '() {', className: 'text-amber-400' }
  ]},
  { num: 9, type: 'code', indent: true, tokens: [
    { text: 'return ', className: 'text-rose-400' },
    { text: '<', className: 'text-amber-400' },
    { text: 'Component ', className: 'text-amber-400' },
    { text: '/>;', className: 'text-amber-400' }
  ]},
  { num: 10, type: 'code', tokens: [
    { text: '}', className: 'text-amber-400' }
  ]},
  { num: 11, type: 'empty', text: '' },
];

const EXPLANATIONS: Record<number, string> = {
  5: "Import your isolated components from the generated registry.",
  8: "The default export acts as the entry point for the visualizer.",
  9: "Return the component. We handle the hot-reloading context automatically."
};

const FEATURES = [
  {
    id: 'runtime',
    title: 'Zero-runtime overhead',
    description: 'Styles are statically extracted during the build step. We emit standard CSS files—no style injection, no client-side parsing, no layout thrashing.',
    icon: Activity,
    accent: 'text-emerald-400',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.15)]',
    proof: {
      label: 'Build Output',
      lines: [
        { text: '✓ 124 components compiled', dim: true },
        { text: '✓ 0.0ms runtime injection', dim: false },
        { text: '↳ out/main.css (4.2kb brotli)', dim: true }
      ]
    }
  },
  {
    id: 'types',
    title: 'Strictly typed APIs',
    description: 'Every interface is built from the ground up in TypeScript. Catch invalid prop combinations and layout collisions in your editor, long before they hit CI.',
    icon: ShieldCheck,
    accent: 'text-amber-400',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(251,191,36,0.15)]',
    proof: {
      label: 'Editor Diagnostics',
      lines: [
        { text: 'Type \'string\' is not assignable', dim: true },
        { text: 'to type \'"solid" | "outline" | "ghost"\'.', dim: false },
        { text: 'ts(2322) [14, 5]', dim: true }
      ]
    }
  },
  {
    id: 'headless',
    title: 'Headless accessibility',
    description: 'Bring your own DOM. We manage the complex state machines, ARIA attributes, and keyboard navigation routing via abstract React hooks.',
    icon: Cpu,
    accent: 'text-rose-400',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(251,113,133,0.15)]',
    proof: {
      label: 'DOM Inspector',
      lines: [
        { text: '<button', dim: true },
        { text: '  aria-expanded="true"', dim: false },
        { text: '  aria-controls="radix-:R1:"', dim: false },
        { text: '>', dim: true }
      ]
    }
  }
];

// ----------------------------------------------------------------------
// 2. Individual Sections
// ----------------------------------------------------------------------
function InteractiveCodeHero() {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-6 md:p-12 border-b border-zinc-800/50">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Integration</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Zero-config previews.
            </h1>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
              Drop your component into the directory. We parse the AST, generate the sandbox, and handle the dependencies. No configuration files required.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Walkthrough</p>
            {[5, 8, 9].map((lineNum) => (
              <button
                key={lineNum}
                type="button"
                onMouseEnter={() => setActiveLine(lineNum)}
                onMouseLeave={() => setActiveLine(null)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group cursor-pointer ${
                  activeLine === lineNum 
                    ? 'bg-zinc-900/80 border-zinc-700 shadow-lg shadow-black/50' 
                    : 'bg-transparent border-transparent hover:border-zinc-800 hover:bg-zinc-900/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border text-[10px] transition-colors ${
                    activeLine === lineNum ? 'border-rose-500 text-rose-400' : 'border-zinc-700 text-zinc-500'
                  }`}>
                    {lineNum}
                  </div>
                  <p className={`text-sm transition-colors ${
                    activeLine === lineNum ? 'text-zinc-200' : 'text-zinc-500'
                  }`}>
                    {EXPLANATIONS[lineNum]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative rounded-xl overflow-hidden bg-[#0d0d0f] border border-zinc-800/80 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#111115] border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900/50 rounded-md border border-zinc-800 text-xs text-zinc-400 font-mono">
                  <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
                  demo.tsx
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy demo code"
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="p-4 font-mono text-sm leading-loose overflow-x-auto relative">
              {DEMO_CODE.map((line, idx) => {
                const isActive = activeLine === line.num;
                const isDimmed = activeLine !== null && activeLine !== line.num;
                return (
                  <motion.div key={idx} animate={{ opacity: isDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }} className="flex relative group/line">
                    <AnimatePresence>
                      {isActive && (
                        <motion.div layoutId="active-line-bg" className="absolute inset-y-0 -inset-x-4 bg-zinc-800/40 border-l-2 border-rose-400 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} />
                      )}
                    </AnimatePresence>
                    <span className="w-8 flex-shrink-0 text-right pr-4 text-zinc-600 select-none relative z-10">{line.num}</span>
                    <span className={`relative z-10 whitespace-pre ${line.indent ? 'pl-4' : ''}`}>
                      {line.type === 'comment' && <span className="text-zinc-500">{line.text}</span>}
                      {line.type === 'code' && line.tokens?.map((token, tIdx) => <span key={tIdx} className={token.className}>{token.text}</span>)}
                      {line.type === 'empty' && <span>{'\n'}</span>}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClaimAndProofFeatures() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="p-6 md:p-12 lg:p-24 min-h-screen flex items-center">
      <div className="max-w-5xl mx-auto space-y-16 w-full">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">Engineered for constraints.</h2>
          <p className="text-zinc-400 leading-relaxed">
            We didn't build another component library to save you from writing CSS. We built it to enforce strict boundaries between logic, state, and presentation.
          </p>
        </div>
        <div className="space-y-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`group relative flex flex-col md:flex-row items-stretch bg-[#111115] border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-500 hover:border-zinc-700 hover:bg-[#15151a] ${feature.glow}`}
            >
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800/50 ${feature.accent} transition-colors duration-300`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-100">{feature.title}</h3>
                </div>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">{feature.description}</p>
              </div>
              <div className="md:w-80 border-t md:border-t-0 md:border-l border-zinc-800/50 bg-[#0d0d0f] relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-[#111115]">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{feature.proof.label}</span>
                  <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center font-mono text-xs leading-relaxed relative">
                  <div className="absolute inset-4 flex flex-col justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                     <div className="h-2 w-3/4 bg-zinc-800/50 rounded mb-3" />
                     <div className="h-2 w-1/2 bg-zinc-800/50 rounded mb-3" />
                     <div className="h-2 w-5/6 bg-zinc-800/50 rounded" />
                  </div>
                  <div className="relative z-10 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                    {feature.proof.lines.map((line, idx) => (
                      <motion.div 
                        key={idx}
                        initial={false}
                        animate={{ color: line.dim ? '#71717a' : '#d4d4d8' }}
                        className={`whitespace-pre ${line.dim ? '' : feature.accent.replace('text-', 'text-')}`}
                        style={!line.dim ? { color: feature.accent === 'text-emerald-400' ? '#34d399' : feature.accent === 'text-amber-400' ? '#fbbf24' : '#fb7185' } : {}}
                      >
                        {line.text}
                      </motion.div>
                    ))}
                  </div>
                  <AnimatePresence>
                    {hoveredId === feature.id && (
                      <motion.div
                        initial={{ top: 0, opacity: 0 }}
                        animate={{ top: '100%', opacity: [0, 0.5, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                        className={`absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent to-${feature.accent.split('-')[1]}-500/10 pointer-events-none`}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------
// 3. Main Export (Fixed to provide the named export "Component")
// ----------------------------------------------------------------------
export function Component() {
  return (
    <div className="bg-[#09090b] text-zinc-300 font-sans selection:bg-rose-500/30">
      <InteractiveCodeHero />
      <ClaimAndProofFeatures />
    </div>
  );
}

// Named alias for cleaner consumer imports
export const DevToolLandingPage = Component;

// We also provide the default export just in case it's needed elsewhere
export default Component;
