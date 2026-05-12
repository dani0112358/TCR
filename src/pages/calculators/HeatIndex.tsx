import { useState, useEffect } from "react";
import {
  Thermometer,
  Droplets,
  AlertTriangle,
  Info,
  ArrowRightLeft,
  FlameKindling,
  BookOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TempUnit = "C" | "F";

interface HeatIndexResult {
  value: number;
  unit: TempUnit;
  level: DangerLevel;
  adjusted: boolean;
}

type DangerLevel =
  | "safe"
  | "caution"
  | "extreme_caution"
  | "danger"
  | "extreme_danger";

interface DangerConfig {
  label: string;
  description: string;
  color: string;        // Tailwind text colour
  bg: string;          // Tailwind bg colour (subtle)
  border: string;      // Tailwind border colour
  bar: string;         // Tailwind solid bar colour
  icon: string;        // emoji / symbol
  minF: number;        // lower bound in °F
}

// ─── Danger-level configuration ───────────────────────────────────────────────

const DANGER_LEVELS: Record<DangerLevel, DangerConfig> = {
  safe: {
    label: "Safe",
    description: "No significant risk from heat exposure.",
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    border: "border-emerald-800/60",
    bar: "bg-emerald-500",
    icon: "✓",
    minF: -Infinity,
  },
  caution: {
    label: "Caution",
    description: "Fatigue possible with prolonged exposure & activity.",
    color: "text-yellow-400",
    bg: "bg-yellow-950/40",
    border: "border-yellow-800/60",
    bar: "bg-yellow-400",
    icon: "◐",
    minF: 80,
  },
  extreme_caution: {
    label: "Extreme Caution",
    description: "Heat cramps & heat exhaustion possible.",
    color: "text-orange-400",
    bg: "bg-orange-950/40",
    border: "border-orange-800/60",
    bar: "bg-orange-400",
    icon: "⚠",
    minF: 91,
  },
  danger: {
    label: "Danger",
    description: "Heat cramps & exhaustion likely; heat stroke possible.",
    color: "text-red-400",
    bg: "bg-red-950/40",
    border: "border-red-800/60",
    bar: "bg-red-500",
    icon: "▲",
    minF: 103,
  },
  extreme_danger: {
    label: "Extreme Danger",
    description: "Heat stroke highly likely with continued exposure.",
    color: "text-rose-300",
    bg: "bg-rose-950/60",
    border: "border-rose-700/70",
    bar: "bg-rose-500",
    icon: "☠",
    minF: 125,
  },
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

const fToC = (f: number): number => (f - 32) * (5 / 9);
const cToF = (c: number): number => c * (9 / 5) + 32;

/**
 * Rothfusz regression equation for Heat Index (inputs & output in °F).
 * https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 */
function rothfuszHI(T: number, RH: number): number {
  return (
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH
  );
}

/**
 * Full NOAA Heat Index algorithm with Steadman simple formula below 80 °F
 * and Rothfusz adjustments for edge cases.
 */
function computeHeatIndex(
  tempInput: number,
  humidity: number,
  unit: TempUnit
): HeatIndexResult {
  const T = unit === "C" ? cToF(tempInput) : tempInput; // work in °F
  const RH = humidity;
  let hi: number;
  let adjusted = false;

  // Below 80 °F use Steadman's simple formula
  if (T < 80) {
    hi = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
  } else {
    hi = rothfuszHI(T, RH);

    // Low-humidity adjustment (RH < 13 % and 80 °F ≤ T ≤ 112 °F)
    if (RH < 13 && T >= 80 && T <= 112) {
      const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      hi -= adj;
      adjusted = true;
    }

    // High-humidity adjustment (RH > 85 % and 80 °F ≤ T ≤ 87 °F)
    if (RH > 85 && T >= 80 && T <= 87) {
      const adj = ((RH - 85) / 10) * ((87 - T) / 5);
      hi += adj;
      adjusted = true;
    }
  }

  // Determine danger level
  let level: DangerLevel = "safe";
  if (hi >= 125) level = "extreme_danger";
  else if (hi >= 103) level = "danger";
  else if (hi >= 91) level = "extreme_caution";
  else if (hi >= 80) level = "caution";

  // Return in the same unit as input
  const value = unit === "C" ? fToC(hi) : hi;
  return { value, unit, level, adjusted };
}

function getDangerBarWidth(hi: number, unit: TempUnit): number {
  const hiF = unit === "C" ? cToF(hi) : hi;
  // Map [60 °F … 140 °F] → [0 % … 100 %]
  return Math.min(100, Math.max(0, ((hiF - 60) / 80) * 100));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  icon: React.ReactNode;
  onChange: (v: number) => void;
}

function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  icon,
  onChange,
}: SliderInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium tracking-wide uppercase">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            className="w-20 text-right bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100 text-sm font-mono focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 transition-colors"
          />
          <span className="text-zinc-500 text-sm w-6">{unit}</span>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-zinc-700
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-zinc-200
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-zinc-600
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:hover:bg-white
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-zinc-200
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-zinc-600"
        />
        <div className="flex justify-between mt-1 text-zinc-600 text-xs font-mono">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HeatIndexCalculator() {
  const [unit, setUnit] = useState<TempUnit>("C");
  const [temp, setTemp] = useState<number>(35);
  const [humidity, setHumidity] = useState<number>(60);
  const [result, setResult] = useState<HeatIndexResult | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  // Temp range per unit
  const tempMin = unit === "C" ? -10 : 14;
  const tempMax = unit === "C" ? 60 : 140;

  // Recalculate whenever inputs change
  useEffect(() => {
    if (humidity >= 0 && humidity <= 100) {
      setResult(computeHeatIndex(temp, humidity, unit));
    }
  }, [temp, humidity, unit]);

  // Swap units, converting current temperature value
  const toggleUnit = () => {
    setUnit((prev) => {
      if (prev === "C") {
        setTemp(parseFloat(cToF(temp).toFixed(1)));
        return "F";
      } else {
        setTemp(parseFloat(fToC(temp).toFixed(1)));
        return "C";
      }
    });
  };

  const cfg = result ? DANGER_LEVELS[result.level] : null;
  const barWidth = result ? getDangerBarWidth(result.value, result.unit) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-zinc-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl">
            <FlameKindling className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Heat Index Calculator
          </h1>
          <span className="ml-auto text-xs font-mono text-zinc-600 border border-zinc-800 rounded-md px-2 py-0.5">
            NOAA / Rothfusz
          </span>
        </div>
        <p className="text-sm text-zinc-500 ml-14">
          Perceived temperature from ambient air temperature &amp; relative humidity.
        </p>
      </div>

      {/* Main grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Left column: Inputs ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
              Parameters
            </h2>
            {/* Unit toggle */}
            <button
              onClick={toggleUnit}
              className="flex items-center gap-2 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg px-3 py-1.5 text-zinc-300 transition-all duration-150 active:scale-95"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Switch to °{unit === "C" ? "F" : "C"}
            </button>
          </div>

          {/* Temperature slider */}
          <SliderInput
            label="Air Temperature"
            value={temp}
            min={tempMin}
            max={tempMax}
            step={0.5}
            unit={`°${unit}`}
            icon={<Thermometer className="w-4 h-4" />}
            onChange={setTemp}
          />

          {/* Humidity slider */}
          <SliderInput
            label="Relative Humidity"
            value={humidity}
            min={0}
            max={100}
            unit="%"
            icon={<Droplets className="w-4 h-4" />}
            onChange={setHumidity}
          />

          {/* Quick presets */}
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
              Quick Presets
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Desert", t: unit === "C" ? 42 : 108, h: 10 },
                { label: "Tropical", t: unit === "C" ? 32 : 90, h: 85 },
                { label: "Humid Summer", t: unit === "C" ? 35 : 95, h: 60 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setTemp(p.t); setHumidity(p.h); }}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg py-2 px-2 text-zinc-400 hover:text-zinc-200 transition-all duration-150 active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: Result card ── */}
        <div
          className={`border rounded-xl p-6 flex flex-col gap-6 transition-all duration-500 ${
            cfg ? `${cfg.bg} ${cfg.border}` : "bg-zinc-900 border-zinc-800"
          }`}
        >
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
            Feels Like
          </h2>

          {result && cfg ? (
            <>
              {/* Big temperature readout */}
              <div className="text-center py-4">
                <div
                  className={`text-7xl font-thin font-mono tabular-nums tracking-tighter ${cfg.color} transition-colors duration-500`}
                >
                  {result.value.toFixed(1)}
                  <span className="text-3xl ml-1 align-top mt-3 inline-block">
                    °{result.unit}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm mt-2 font-mono">
                  Input: {temp.toFixed(1)}°{unit} / {humidity}% RH
                </p>
                {result.adjusted && (
                  <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-zinc-500 bg-zinc-800/60 border border-zinc-700/50 rounded-full px-3 py-1">
                    <Info className="w-3 h-3" />
                    Adjustment factor applied
                  </div>
                )}
              </div>

              {/* Danger level badge */}
              <div className={`rounded-xl border px-4 py-3 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-4 h-4 ${cfg.color}`} />
                  <span className={`text-sm font-semibold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className="ml-auto text-lg">{cfg.icon}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {cfg.description}
                </p>
              </div>

              {/* Danger scale bar */}
              <div>
                <div className="flex justify-between text-xs text-zinc-600 mb-2">
                  <span>Safe</span>
                  <span>Caution</span>
                  <span>Danger</span>
                  <span>Extreme</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${cfg.bar}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {/* Scale ticks */}
                <div className="relative h-1 mt-1">
                  {[0, 25, 48, 81].map((pct) => (
                    <div
                      key={pct}
                      className="absolute top-0 w-px h-1.5 bg-zinc-700"
                      style={{ left: `${pct}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* NOAA thresholds reference */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    ["caution", "80 – 90 °F"],
                    ["extreme_caution", "91 – 103 °F"],
                    ["danger", "103 – 124 °F"],
                    ["extreme_danger", "≥ 125 °F"],
                  ] as [DangerLevel, string][]
                ).map(([lvl, range]) => {
                  const d = DANGER_LEVELS[lvl];
                  const active = result.level === lvl;
                  return (
                    <div
                      key={lvl}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 border transition-all ${
                        active
                          ? `${d.bg} ${d.border}`
                          : "bg-zinc-800/40 border-zinc-800"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${d.bar}`} />
                      <span className={active ? d.color : "text-zinc-500"}>
                        {d.label}
                      </span>
                      <span className="ml-auto text-zinc-600 font-mono">{range}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              Adjust inputs to calculate.
            </div>
          )}
        </div>
      </div>

      {/* ── Formula Reference section ── */}
      <div className="max-w-5xl mx-auto mt-4">
        <button
          onClick={() => setShowFormula((p) => !p)}
          className="w-full flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl px-5 py-3.5 text-sm text-zinc-400 hover:text-zinc-300 transition-all duration-150"
        >
          <BookOpen className="w-4 h-4" />
          Formula Reference — Rothfusz Regression Equation
          <span className="ml-auto text-zinc-600 text-xs">
            {showFormula ? "▲ collapse" : "▼ expand"}
          </span>
        </button>

        {showFormula && (
          <div className="bg-zinc-900 border border-zinc-800 border-t-0 rounded-b-xl px-5 pb-6 pt-4 space-y-5 text-sm text-zinc-400">

            <p className="text-zinc-500 leading-relaxed">
              The Heat Index is computed using the{" "}
              <strong className="text-zinc-300">Rothfusz regression equation</strong>{" "}
              developed for NOAA. When the simple Steadman formula yields a Heat Index
              below 80 °F it is used instead to avoid regression inaccuracy at lower
              temperatures.
            </p>

            {/* Main equation – formatted as monospaced block */}
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">
                Rothfusz Regression (T and HI in °F)
              </p>
              <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`HI = −42.379
   + 2.04901523·T
   + 10.14333127·RH
   − 0.22475541·T·RH
   − 6.83783×10⁻³·T²
   − 5.481717×10⁻²·RH²
   + 1.22874×10⁻³·T²·RH
   + 8.5282×10⁻⁴·T·RH²
   − 1.99×10⁻⁶·T²·RH²

Where:
  T   = Air temperature (°F)
  RH  = Relative humidity (%)
  HI  = Heat Index (°F)`}
              </pre>
            </div>

            {/* Adjustment factors */}
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">
                Adjustment Factors
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-300 text-xs font-semibold mb-2">
                    Low-Humidity Adjustment
                  </p>
                  <p className="text-zinc-500 text-xs mb-2">
                    Applied when <code className="text-zinc-400">RH &lt; 13%</code> and{" "}
                    <code className="text-zinc-400">80°F ≤ T ≤ 112°F</code>
                  </p>
                  <pre className="text-xs text-zinc-400 font-mono">
{`adj = ((13 − RH) / 4)
    × √((17 − |T − 95|) / 17)
HI = HI − adj`}
                  </pre>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-300 text-xs font-semibold mb-2">
                    High-Humidity Adjustment
                  </p>
                  <p className="text-zinc-500 text-xs mb-2">
                    Applied when <code className="text-zinc-400">RH &gt; 85%</code> and{" "}
                    <code className="text-zinc-400">80°F ≤ T ≤ 87°F</code>
                  </p>
                  <pre className="text-xs text-zinc-400 font-mono">
{`adj = ((RH − 85) / 10)
    × ((87 − T) / 5)
HI = HI + adj`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Steadman simple formula */}
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">
                Steadman Simple Formula (T &lt; 80 °F)
              </p>
              <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300">
{`HI = 0.5 × (T + 61.0 + (T − 68.0) × 1.2 + RH × 0.094)`}
              </pre>
            </div>

            {/* Unit conversion */}
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">
                Unit Conversion
              </p>
              <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300">
{`°F → °C :  C = (F − 32) × 5/9
°C → °F :  F = C × 9/5 + 32`}
              </pre>
            </div>

            <p className="text-zinc-600 text-xs">
              Source: NOAA Weather Prediction Center —{" "}
              <span className="text-zinc-500">
                wpc.ncep.noaa.gov/html/heatindex_equation.shtml
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
