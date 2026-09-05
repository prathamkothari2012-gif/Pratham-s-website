/**
 * A decorative, code-drawn stand-in for a product photo: a part mid-print on a
 * build plate. Swap this component for an <Image> once real photography of the
 * workshop is available.
 */
export function PrintVisual() {
  const layers = Array.from({ length: 14 });

  return (
    <div className="relative animate-rise [animation-delay:120ms]" aria-hidden>
      <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl shadow-brand-900/10">
        {/* Gantry rail */}
        <div className="absolute inset-x-6 top-10 h-1 rounded-full bg-border" />
        <div className="absolute top-8 left-1/2 h-5 w-16 -translate-x-1/2 rounded-md bg-gradient-to-b from-brand-500 to-brand-700 shadow-lg shadow-brand-600/40" />
        <div className="absolute top-13 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-b bg-brand-700" />

        {/* Stacked layers of the part being printed */}
        <div className="absolute inset-x-0 bottom-20 flex flex-col-reverse items-center gap-[3px]">
          {layers.map((_, i) => {
            // Waist the stack slightly so it reads as a turned object.
            const t = i / (layers.length - 1);
            const width = 132 - Math.sin(t * Math.PI) * 44;
            return (
              <div
                key={i}
                className="h-[7px] rounded-[3px] bg-gradient-to-r from-brand-500 to-brand-400"
                style={{ width, opacity: 0.55 + t * 0.45 }}
              />
            );
          })}
        </div>

        {/* Build plate */}
        <div className="absolute inset-x-8 bottom-16 h-2.5 rounded-full bg-gradient-to-r from-border via-foreground/25 to-border" />

        {/* Readout */}
        <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3 backdrop-blur">
          <div>
            <p className="font-mono text-xs text-muted">bracket_v4.gcode</p>
            <p className="mt-0.5 text-sm font-medium">Layer 142 / 210</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-muted">ETA</p>
            <p className="mt-0.5 text-sm font-medium">38 min</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute inset-x-6 bottom-[4.75rem] h-1 overflow-hidden rounded-full bg-border">
          <div className="h-full w-2/3 rounded-full bg-brand-500" />
        </div>
      </div>

      {/* Floating spec chips */}
      <div className="absolute -top-3 -left-3 hidden rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium shadow-lg sm:block">
        <span className="text-muted">Material</span> · PETG
      </div>
      <div className="absolute -right-3 top-24 hidden rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium shadow-lg sm:block">
        <span className="text-muted">Layer</span> · 0.20 mm
      </div>
    </div>
  );
}
