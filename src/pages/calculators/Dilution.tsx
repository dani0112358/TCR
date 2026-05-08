import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import Breadcrumb from '../../components/Breadcrumb';
import NumericInput from '../../components/NumericInput';
import CalcResultBox from '../../components/CalcResultBox';
import FormulaAccordion from '../../components/FormulaAccordion';
import { getBySlug } from '../../data/registry';

const entry = getBySlug('dilution')!;

type SolveFor = 'c1' | 'v1' | 'c2' | 'v2';

function solve(solveFor: SolveFor, c1: number, v1: number, c2: number, v2: number): number | null {
  switch (solveFor) {
    case 'c1': return v1 > 0 ? (c2 * v2) / v1 : null;
    case 'v1': return c1 > 0 ? (c2 * v2) / c1 : null;
    case 'c2': return v2 > 0 ? (c1 * v1) / v2 : null;
    case 'v2': return c2 > 0 ? (c1 * v1) / c2 : null;
  }
}

const fieldLabels: Record<SolveFor, string> = {
  c1: 'Initial Concentration (C₁)',
  v1: 'Initial Volume (V₁)',
  c2: 'Final Concentration (C₂)',
  v2: 'Final Volume (V₂)',
};

const fieldUnits: Record<SolveFor, string> = {
  c1: 'mol/L',
  v1: 'mL',
  c2: 'mol/L',
  v2: 'mL',
};

const fieldPlaceholders: Record<SolveFor, string> = {
  c1: 'e.g. 2.0',
  v1: 'e.g. 50',
  c2: 'e.g. 0.5',
  v2: 'e.g. 200',
};

export default function Dilution() {
  const [solveFor, setSolveFor] = useState<SolveFor>('v2');
  const [c1, setC1] = useState('');
  const [v1, setV1] = useState('');
  const [c2, setC2] = useState('');
  const [v2, setV2] = useState('');

  const fields: { key: SolveFor; value: string; setter: (v: string) => void }[] = [
    { key: 'c1', value: c1, setter: setC1 },
    { key: 'v1', value: v1, setter: setV1 },
    { key: 'c2', value: c2, setter: setC2 },
    { key: 'v2', value: v2, setter: setV2 },
  ];

  const result = useMemo(() => {
    const vals: Record<SolveFor, number> = {
      c1: parseFloat(c1),
      v1: parseFloat(v1),
      c2: parseFloat(c2),
      v2: parseFloat(v2),
    };

    const inputKeys = (Object.keys(vals) as SolveFor[]).filter((k) => k !== solveFor);
    if (inputKeys.some((k) => isNaN(vals[k]))) return null;

    const r = solve(solveFor, vals.c1, vals.v1, vals.c2, vals.v2);
    if (r === null || r < 0 || !isFinite(r)) return null;
    return r.toFixed(4);
  }, [solveFor, c1, v1, c2, v2]);

  return (
    <Layout>
      <Breadcrumb
        crumbs={[
          { label: 'Home', to: '/' },
          { label: entry.category, to: '/' },
          { label: entry.name },
        ]}
      />

      <div className="mt-6 mb-8">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Solution Dilution Calculator</h1>
        <p className="mt-2 text-zinc-400 max-w-2xl" style={{ fontSize: '13px', lineHeight: 1.6 }}>
          Solves the dilution equation C₁V₁ = C₂V₂ for any single unknown variable.
          Select which quantity to solve for, then enter the remaining three known values.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-zinc-500 mb-2" style={{ fontSize: '12px' }}>Solve for</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(fieldLabels) as SolveFor[]).map((key) => (
            <button
              key={key}
              onClick={() => setSolveFor(key)}
              className={`px-3 py-1.5 rounded border mono transition-colors duration-100 ${
                solveFor === key
                  ? 'bg-zinc-700 border-zinc-600 text-zinc-100'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
              style={{ fontSize: '12px' }}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {fields.map(({ key, value, setter }) => (
          <NumericInput
            key={key}
            label={fieldLabels[key]}
            value={key === solveFor ? '' : value}
            onChange={setter}
            unit={fieldUnits[key]}
            placeholder={key === solveFor ? 'calculated' : fieldPlaceholders[key]}
            disabled={key === solveFor}
          />
        ))}
      </div>

      <CalcResultBox
        label={fieldLabels[solveFor]}
        value={result}
        unit={fieldUnits[solveFor]}
      />

      <FormulaAccordion
        formula={`C₁ · V₁ = C₂ · V₂\n\nRearranged for each unknown:\n  C₁ = (C₂ · V₂) / V₁\n  V₁ = (C₂ · V₂) / C₁\n  C₂ = (C₁ · V₁) / V₂\n  V₂ = (C₁ · V₁) / C₂`}
        variables={[
          { symbol: 'C₁', description: 'Initial (stock) solution concentration', unit: 'mol/L' },
          { symbol: 'V₁', description: 'Volume of stock solution to use', unit: 'mL' },
          { symbol: 'C₂', description: 'Final (diluted) solution concentration', unit: 'mol/L' },
          { symbol: 'V₂', description: 'Total final volume after dilution', unit: 'mL' },
        ]}
        notes="Units for C₁ and C₂ must match. Units for V₁ and V₂ must match but need not be the same as the concentration units. The formula assumes ideal mixing with no volume change upon mixing."
      />
    </Layout>
  );
}
