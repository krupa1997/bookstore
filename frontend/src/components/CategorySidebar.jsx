import React from 'react';
import { CATEGORIES } from '../data/mockBooks';

export default function CategorySidebar({ activeCategory, onSelect }) {
  return (
    <aside className="hidden md:flex flex-col w-48 shrink-0 pt-4 pb-8 overflow-y-auto">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`text-left px-4 py-1.5 text-sm transition-colors rounded-none border-l-2 ${
            activeCategory === cat
              ? 'border-blue-500 text-white font-semibold bg-white/5'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {cat}
        </button>
      ))}
    </aside>
  );
}
