import React from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search...', className }) => {
  return (
    <div className={clsx('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
