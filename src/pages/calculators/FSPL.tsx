import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import Breadcrumb from '../../components/Breadcrumb';
import NumericInput from '../../components/NumericInput';
import CalcResultBox from '../../components/CalcResultBox';
import FormulaAccordion from '../../components/FormulaAccordion';
import { getBySlug } from '../../data/registry';

const entry = getBySlug('fspl')!;

function calcFSPL(freqGHz: number, distKm: number): number {
  // FSPL (dB) = 20·log10(d) + 20·log10(f) + 92.45
  // where d is in km and f is in GHz
  return 20 * Math.log10(distKm) + 20 * Math.log10(freqGHz) + 92.45;
}

export default function FSPL() {
  const [freq, setFreq] = useState('');
  const [dist, setDist] = useState('');

  const result = useMemo(() => {
    const f = parseFloat(freq);
    const d = parseFloat(dist);
    if (isNaN(f) || isNaN(d) || f <= 0 || d <= 0) return null;
    return calcFSPL(f, d).toFixed(2);
  }, [freq, dist]);

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
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Free-Space Path Loss Calculator</h1>
        <p className="mt-2 text-zinc-400 max-w-2xl" style={{ fontSize: '13px', lineHeight: 1.6 }}>
          Computes free-space path loss (FSPL) in decibels for a given RF link frequency and distance.
          Assumes isotropic antennas with no atmospheric absorption; suitable for line-of-sight budget analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <NumericInput
          label="Frequency"
          value={freq}
          onChange={setFreq}
          unit="GHz"
          placeholder="e.g. 2.4"
        />
        <NumericInput
          label="Distance"
          value={dist}
          onChange={setDist}
          unit="km"
          placeholder="e.g. 10"
        />
      </div>

      <CalcResultBox
        label="Free-Space Path Loss"
        value={result}
        unit="dB"
      />

      <FormulaAccordion
        formula={`FSPL (dB) = 20·log₁₀(d) + 20·log₁₀(f) + 92.45`}
        variables={[
          { symbol: 'd', description: 'Link distance', unit: 'km' },
          { symbol: 'f', description: 'Signal frequency', unit: 'GHz' },
          { symbol: '92.45', description: 'Constant derived from 4π/λ with km and GHz units', unit: '—' },
        ]}
        notes="Derived from the Friis transmission equation. The constant 92.45 accounts for the unit system (GHz, km). For MHz and km, use 32.45; for GHz and meters, use 32.45."
      />
    </Layout>
  );
}
