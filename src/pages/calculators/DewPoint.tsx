import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import Breadcrumb from '../../components/Breadcrumb';
import NumericInput from '../../components/NumericInput';
import CalcResultBox from '../../components/CalcResultBox';
import FormulaAccordion from '../../components/FormulaAccordion';
import { getBySlug } from '../../data/registry';

const entry = getBySlug('dew-point')!;

function calcDewPoint(tempC: number, rh: number): number {
  // Magnus-Tetens approximation
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
  return (b * alpha) / (a - alpha);
}

export default function DewPoint() {
  const [temp, setTemp] = useState('');
  const [humidity, setHumidity] = useState('');

  const result = useMemo(() => {
    const t = parseFloat(temp);
    const rh = parseFloat(humidity);
    if (isNaN(t) || isNaN(rh) || rh <= 0 || rh > 100) return null;
    return calcDewPoint(t, rh).toFixed(2);
  }, [temp, humidity]);

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
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">{entry.name} Calculator</h1>
        <p className="mt-2 text-zinc-400 max-w-2xl" style={{ fontSize: '13px', lineHeight: 1.6 }}>
          Calculates the dew point temperature from dry-bulb temperature and relative humidity.
          Uses the Magnus-Tetens approximation, accurate to within ±0.35 °C for temperatures between −40 °C and +60 °C.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <NumericInput
          label="Temperature"
          value={temp}
          onChange={setTemp}
          unit="°C"
          placeholder="e.g. 25"
        />
        <NumericInput
          label="Relative Humidity"
          value={humidity}
          onChange={setHumidity}
          unit="%"
          placeholder="e.g. 65"
        />
      </div>

      <CalcResultBox
        label="Dew Point Temperature"
        value={result}
        unit="°C"
      />

      <FormulaAccordion
        formula={`α(T, RH) = (a·T) / (b + T) + ln(RH / 100)\n\nTd = (b · α) / (a − α)\n\nwhere a = 17.27, b = 237.7`}
        variables={[
          { symbol: 'T', description: 'Dry-bulb temperature', unit: '°C' },
          { symbol: 'RH', description: 'Relative humidity', unit: '%' },
          { symbol: 'Td', description: 'Dew point temperature', unit: '°C' },
          { symbol: 'a', description: 'Magnus constant (17.27)', unit: '—' },
          { symbol: 'b', description: 'Magnus constant (237.7)', unit: '°C' },
        ]}
        notes="This approximation was introduced by Magnus (1844) and refined by Tetens (1930). It is widely used in meteorology and HVAC engineering."
      />
    </Layout>
  );
}
