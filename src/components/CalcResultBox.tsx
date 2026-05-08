import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CalcResultBoxProps {
  label: string;
  value: string | null;
  unit?: string;
}

export default function CalcResultBox({ label, value, unit }: CalcResultBoxProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (value === null) return;
    navigator.clipboard.writeText(unit ? `${value} ${unit}` : value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-zinc-500 mb-1" style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </p>
        {value !== null ? (
          <p
            className="text-zinc-100 mono font-bold"
            style={{ fontSize: '28px', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            {value}
            {unit && (
              <span className="text-zinc-400 font-normal ml-2" style={{ fontSize: '16px' }}>
                {unit}
              </span>
            )}
          </p>
        ) : (
          <p className="text-zinc-600 mono" style={{ fontSize: '22px' }}>—</p>
        )}
      </div>
      <button
        onClick={handleCopy}
        disabled={value === null}
        className="flex-shrink-0 p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Copy result"
      >
        {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
      </button>
    </div>
  );
}
