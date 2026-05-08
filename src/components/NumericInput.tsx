interface NumericInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  unit?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function NumericInput({ label, value, onChange, unit, placeholder, disabled }: NumericInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow digits, one decimal point, and leading minus
    if (raw === '' || raw === '-' || /^-?\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  }

  return (
    <div>
      <label className="block text-zinc-400 mb-1.5" style={{ fontSize: '12px' }}>
        {label}
        {unit && <span className="text-zinc-600 ml-1.5 mono" style={{ fontSize: '11px' }}>[{unit}]</span>}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? '0'}
        disabled={disabled}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-200 mono placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontSize: '14px' }}
      />
    </div>
  );
}
