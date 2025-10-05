import { useState, useEffect } from 'react';

interface HeadOption {
  value: string;
  label: string;
  image: string;
}

interface HeadSelectorProps {
  options: HeadOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function HeadSelector({ options, value, onChange, label = 'Disc / clamp head' }: HeadSelectorProps) {
  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange(optionValue);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(option.value);
              }
            }}
            className={`
              relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
              hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2
              ${
                selectedValue === option.value
                  ? 'border-sky-500 bg-sky-50 shadow-md'
                  : 'border-slate-300 bg-white hover:border-sky-300'
              }
            `}
            aria-label={option.label}
            aria-pressed={selectedValue === option.value}
          >
            {/* Selection indicator */}
            {selectedValue === option.value && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Image */}
            <div className="w-full aspect-square rounded-md overflow-hidden bg-slate-100">
              <img
                src={option.image}
                alt={option.label}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>

            {/* Label */}
            <span className="text-xs font-medium text-slate-700 text-center leading-tight">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
