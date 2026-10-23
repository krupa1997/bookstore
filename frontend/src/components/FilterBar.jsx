import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { catalogApi } from '../api/api';

function SelectFilter({ label, options = ['All'], value, onChange }) {
  return (
    <div className="relative flex-1 min-w-[130px]">
      <div className="flex flex-col px-3 py-2 bg-[#1e2026] border border-[#2a2c33] rounded h-full justify-center">
        <span className="text-[10px] text-gray-500 leading-none mb-0.5">{label}</span>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300 truncate">{value || 'All'}</span>
          <ChevronDown size={14} className="text-gray-500 shrink-0 ml-2" />
        </div>
      </div>
      <select
        className="absolute inset-0 opacity-0 w-full cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.id ?? o} value={o.id ?? o}>
            {o.name ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({ filters, onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands]         = useState([]);

  useEffect(() => {
    catalogApi.getCategories().then(setCategories).catch(() => {});
    catalogApi.getBrands().then(setBrands).catch(() => {});
  }, []);

  function set(key, value) {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  }

  return (
    <div className="flex items-stretch gap-2 px-4 py-3 bg-[#18191d] border-b border-[#2a2c33] flex-wrap">
      {/* Search */}
      <div className="flex items-center flex-1 min-w-[200px] bg-[#1e2026] border border-[#2a2c33] rounded px-3 gap-2">
        <div className="flex flex-col flex-1 py-2">
          <span className="text-[10px] text-gray-500 leading-none mb-0.5">Search you want to read here</span>
          <input
            type="text"
            placeholder="Search"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
          />
        </div>
        {filters.search
          ? <button onClick={() => set('search', '')}><X size={14} className="text-gray-500 hover:text-white" /></button>
          : <Search size={16} className="text-gray-500 shrink-0" />
        }
      </div>

      <SelectFilter
        label="Language"
        options={['English', 'Hindi', 'Spanish', 'French']}
        value={filters.language}
        onChange={(v) => set('language', v)}
      />
      <SelectFilter
        label="Format (Paperback, ebook etc)"
        options={['Paperback', 'Hardcover', 'eBook']}
        value={filters.format}
        onChange={(v) => set('format', v)}
      />
      <SelectFilter
        label="Category"
        options={categories}
        value={filters.categoryId}
        onChange={(v) => set('categoryId', v)}
      />
      <SelectFilter
        label="Publisher / Brand"
        options={brands}
        value={filters.brandId}
        onChange={(v) => set('brandId', v)}
      />
      <SelectFilter
        label="Sort by"
        options={['Relevance', 'Price: Low to High', 'Price: High to Low', 'Newest']}
        value={filters.sort}
        onChange={(v) => set('sort', v)}
      />
    </div>
  );
}
