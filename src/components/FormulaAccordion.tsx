import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Variable {
  symbol: string;
  description: string;
  unit?: string;
}

interface FormulaAccordionProps {
  formula: string;
  variables: Variable[];
  notes?: string;
}

export default function FormulaAccordion({ formula, variables, notes }: FormulaAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors duration-100"
        style={{ fontSize: '13px' }}
      >
        <span className="font-medium">Mathematical Derivation</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="mt-4 bg-zinc-950 border border-zinc-800 rounded p-4 overflow-x-auto">
            <p
              className="text-zinc-200 mono whitespace-pre-wrap"
              style={{ fontSize: '13px', lineHeight: 1.8 }}
            >
              {formula}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-zinc-600 mb-2" style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Variable Key
            </p>
            <div className="space-y-1.5">
              {variables.map((v) => (
                <div key={v.symbol} className="flex items-baseline gap-3" style={{ fontSize: '12px' }}>
                  <span className="text-zinc-300 mono w-8 flex-shrink-0">{v.symbol}</span>
                  <span className="text-zinc-500">{v.description}</span>
                  {v.unit && (
                    <span className="text-zinc-700 mono ml-auto flex-shrink-0">[{v.unit}]</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {notes && (
            <p className="mt-4 text-zinc-600" style={{ fontSize: '11px', lineHeight: 1.6 }}>
              {notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
