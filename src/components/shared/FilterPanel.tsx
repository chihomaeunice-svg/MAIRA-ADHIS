import React from 'react';
import { clsx } from 'clsx';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterPanelProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ options, value, onChange, className }) => {
  return (
    <div className={clsx('flex flex-wrap gap-2', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-full border transition-all',
            value === opt.value
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600'
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className={clsx('ml-2 text-xs px-1.5 py-0.5 rounded-full', value === opt.value ? 'bg-white/20' : 'bg-gray-100')}>
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterPanel;
