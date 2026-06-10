/* Server-rendered SVG charts in the four-shade LCD style.
   Stepped lines, square markers, crispEdges — no client JS. */

const DARK = "var(--color-gb-darkest)";
const MID = "var(--color-gb-dark)";

interface Point {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

function scale(values: number[], min: number, max: number, lo: number, hi: number) {
  return (v: number) => (max === min ? (lo + hi) / 2 : lo + ((v - min) / (max - min)) * (hi - lo));
}

export function StepLine({
  values,
  labels,
  height = 140,
  formatY = (v: number) => v.toFixed(0),
  invertY = false,
}: {
  values: number[];
  labels: string[];
  height?: number;
  formatY?: (v: number) => string;
  invertY?: boolean; // for pace: lower = better = plotted higher
}) {
  if (values.length === 0) return <Empty />;
  const W = 640;
  const PAD = { l: 44, r: 8, t: 10, b: 22 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sx = scale(values.map((_, i) => i), 0, values.length - 1, PAD.l, W - PAD.r);
  const syRaw = scale(values, min, max, height - PAD.b, PAD.t);
  const sy = (v: number) => (invertY ? height - PAD.b + PAD.t - syRaw(v) : syRaw(v));

  let d = `M ${sx(0)} ${sy(values[0])}`;
  for (let i = 1; i < values.length; i++) {
    d += ` H ${sx(i)} V ${sy(values[i])}`;
  }

  const every = Math.max(1, Math.ceil(values.length / 8));
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img">
      {/* y extremes */}
      <text x={4} y={sy(invertY ? min : max) + 4} fontSize={12} fill={MID} fontFamily="var(--font-vt323)">
        {formatY(invertY ? min : max)}
      </text>
      <text x={4} y={sy(invertY ? max : min) + 4} fontSize={12} fill={MID} fontFamily="var(--font-vt323)">
        {formatY(invertY ? max : min)}
      </text>
      <path d={d} fill="none" stroke={DARK} strokeWidth={3} />
      {values.map((v, i) => (
        <rect key={i} x={sx(i) - 3} y={sy(v) - 3} width={6} height={6} fill={DARK} />
      ))}
      {labels.map((label, i) =>
        i % every === 0 ? (
          <text key={i} x={sx(i)} y={height - 6} fontSize={11} fill={MID} textAnchor="middle" fontFamily="var(--font-vt323)">
            {label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function PixelBars({
  values,
  labels,
  height = 150,
  formatV = (v: number) => v.toFixed(1),
}: {
  values: number[];
  labels: string[];
  height?: number;
  formatV?: (v: number) => string;
}) {
  if (values.length === 0) return <Empty />;
  const W = 640;
  const PAD = { l: 8, r: 8, t: 18, b: 22 };
  const max = Math.max(...values, 0.001);
  const bw = Math.min(48, ((W - PAD.l - PAD.r) / values.length) * 0.7);
  const step = (W - PAD.l - PAD.r) / values.length;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img">
      {values.map((v, i) => {
        const h = Math.max(2, (v / max) * (height - PAD.t - PAD.b));
        const x = PAD.l + i * step + (step - bw) / 2;
        const y = height - PAD.b - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} fill={i === values.length - 1 ? DARK : MID} />
            <text x={x + bw / 2} y={y - 5} fontSize={11} fill={DARK} textAnchor="middle" fontFamily="var(--font-vt323)">
              {formatV(v)}
            </text>
            <text x={x + bw / 2} y={height - 6} fontSize={11} fill={MID} textAnchor="middle" fontFamily="var(--font-vt323)">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ScatterPlot({
  points,
  height = 200,
  xLabel,
  yLabel,
  formatX = (v: number) => v.toFixed(0),
  formatY = (v: number) => v.toFixed(0),
}: {
  points: Point[];
  height?: number;
  xLabel: string;
  yLabel: string;
  formatX?: (v: number) => string;
  formatY?: (v: number) => string;
}) {
  if (points.length === 0) return <Empty />;
  const W = 640;
  const PAD = { l: 52, r: 12, t: 12, b: 34 };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const sx = scale(xs, Math.min(...xs), Math.max(...xs), PAD.l, W - PAD.r);
  const sy = scale(ys, Math.min(...ys), Math.max(...ys), height - PAD.b, PAD.t);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img">
      <line x1={PAD.l} y1={height - PAD.b} x2={W - PAD.r} y2={height - PAD.b} stroke={MID} strokeWidth={2} />
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={height - PAD.b} stroke={MID} strokeWidth={2} />
      {points.map((p, i) => (
        <rect key={i} x={sx(p.x) - 4} y={sy(p.y) - 4} width={8} height={8} fill={p.color ?? DARK} stroke={DARK} strokeWidth={1} />
      ))}
      <text x={(PAD.l + W - PAD.r) / 2} y={height - 4} fontSize={12} fill={DARK} textAnchor="middle" fontFamily="var(--font-vt323)">
        {xLabel} ({formatX(Math.min(...xs))} → {formatX(Math.max(...xs))})
      </text>
      <text x={12} y={PAD.t + 2} fontSize={12} fill={DARK} fontFamily="var(--font-vt323)">
        {yLabel} ({formatY(Math.max(...ys))} top, {formatY(Math.min(...ys))} bottom)
      </text>
    </svg>
  );
}

function Empty() {
  return <p className="text-gb-dark py-6 text-center">Not enough data yet…</p>;
}
