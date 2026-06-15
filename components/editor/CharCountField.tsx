"use client";

type CharCountFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
};

export default function CharCountField({
  label,
  value,
  onChange,
  max,
  multiline = false,
  rows = 3,
  placeholder
}: CharCountFieldProps) {
  const count = value.length;
  const over = count > max;

  return (
    <label className="block text-sm font-bold text-[#53606d]">
      <span>{label}</span>
      <div className="relative mt-1">
        {multiline ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="w-full resize-y rounded-md border border-[#d7cec0] bg-white px-3 py-2 pb-6 text-sm font-medium text-ink outline-none focus:border-moss"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-md border border-[#d7cec0] bg-white px-3 pr-16 text-sm font-medium text-ink outline-none focus:border-moss"
          />
        )}
        <span
          className={`pointer-events-none absolute bottom-1.5 right-2 text-xs font-bold ${
            over ? "text-rust" : "text-[#a59c8c]"
          }`}
        >
          {count}/{max}
        </span>
      </div>
    </label>
  );
}
