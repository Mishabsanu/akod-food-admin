"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";

export interface FilterDropdownOption {
  label: string;
  value: string;
}

export interface FilterDropdownConfig {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterDropdownOption[];
  minWidth?: string;
  ariaLabel?: string;
}

export interface ColumnItem {
  key: string;
  label: string;
}

interface TableFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  placeholder?: string;
  statusFilter?: string;
  onStatusChange?: (val: string) => void;
  statusOptions?: FilterDropdownOption[];
  categoryFilter?: string;
  onCategoryChange?: (val: string) => void;
  categoryOptions?: FilterDropdownOption[];
  filters?: FilterDropdownConfig[];
  columns?: ColumnItem[];
  columnsCount?: number;
  visibleColumnKeys?: Set<string>;
  onToggleColumn?: (key: string) => void;
  onSelectAllColumns?: () => void;
  totalCount?: number;
  totalLabel?: string;
  children?: React.ReactNode;
}

const TableFilterBarComponent: React.FC<TableFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  placeholder,
  statusFilter,
  onStatusChange,
  statusOptions,
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  filters: propFilters,
  columns = [],
  columnsCount,
  visibleColumnKeys,
  onToggleColumn,
  onSelectAllColumns,
  totalCount,
  totalLabel,
  children,
}) => {
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const colPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colPickerRef.current && !colPickerRef.current.contains(e.target as Node)) {
        setShowColumnPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build filter list from props or convenience props
  const filters: FilterDropdownConfig[] = propFilters || [
    ...(statusOptions && onStatusChange ? [{
      id: "status",
      value: statusFilter || "All",
      onChange: onStatusChange,
      options: statusOptions,
      minWidth: "140px"
    }] : []),
    ...(categoryOptions && onCategoryChange ? [{
      id: "category",
      value: categoryFilter || "All",
      onChange: onCategoryChange,
      options: categoryOptions,
      minWidth: "140px"
    }] : [])
  ];

  const hasColumns = (columns && columns.length > 0) || columnsCount !== undefined;
  const colCount = visibleColumnKeys ? visibleColumnKeys.size : (columnsCount || columns.length || 9);
  const totalColCount = columns.length > 0 ? columns.length : colCount;
  const effectivePlaceholder = searchPlaceholder || placeholder || "Search records...";

  return (
    <div className="w-full bg-white select-none font-sans">
      {/* ── 1. Top Filter & Search Strip ── */}
      <div className="w-full border-b border-[#e5e7eb] bg-white flex items-stretch h-9 relative z-20">
        {/* Custom Filter Dropdowns */}
        {filters.map((f) => (
          <div
            key={f.id}
            style={{ minWidth: f.minWidth || "140px" }}
            className="relative border-r border-[#e5e7eb] flex items-center px-3 bg-white shrink-0"
          >
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              aria-label={f.ariaLabel || f.id}
              className="w-full text-xs text-slate-600 bg-transparent outline-none appearance-none cursor-pointer pr-5 font-normal"
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        ))}

        {/* Search Input */}
        <div className="relative flex-1 flex items-center px-3 bg-white min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={effectivePlaceholder}
            className="w-full text-xs text-slate-700 placeholder-slate-400 bg-transparent outline-none font-normal"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Optional Children Injections */}
        {children}

        {/* Column Picker Dropdown */}
        {hasColumns && (
          <div ref={colPickerRef} className="relative border-l border-[#e5e7eb] flex items-center px-3 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className={`text-xs flex items-center space-x-1.5 cursor-pointer font-medium transition-colors ${
                showColumnPicker ? 'text-[#546b5a]' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Configure Visible Columns"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#546b5a]" />
              <span>Columns ({colCount}{columns.length > 0 && columns.length !== colCount ? `/${columns.length}` : ''})</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${showColumnPicker ? 'rotate-180 text-[#546b5a]' : ''}`} />
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#cbd5e1] rounded-md shadow-2xl p-2.5 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Columns ({colCount}/{totalColCount})
                  </span>
                  {onSelectAllColumns && (
                    <button
                      type="button"
                      onClick={onSelectAllColumns}
                      className="text-[10.5px] text-[#546b5a] hover:text-[#415446] hover:underline cursor-pointer font-semibold"
                    >
                      {colCount === totalColCount ? "Deselect Extra" : "Select All"}
                    </button>
                  )}
                </div>

                {columns.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-0.5 py-0.5 no-scrollbar">
                    {columns.map((col) => {
                      const isChecked = visibleColumnKeys ? visibleColumnKeys.has(col.key) : true;
                      return (
                        <label
                          key={col.key}
                          className={`flex items-center space-x-2.5 text-xs p-1.5 rounded cursor-pointer select-none transition-colors ${
                            isChecked ? 'text-slate-800 hover:bg-[#eff4f0]' : 'text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleColumn?.(col.key)}
                            className="rounded border-[#cbd5e1] text-[#546b5a] focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-[#546b5a]"
                          />
                          <span className={`truncate text-[11.5px] ${isChecked ? 'font-medium' : 'font-normal'}`}>
                            {col.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-2 text-center text-slate-400 text-[11px]">
                    No columns configured for this view.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Compact Total Counter Strip ── */}
      {totalCount !== undefined && (
        <div className="flex justify-end px-3 py-1 text-[11px] text-slate-500 font-normal select-none bg-white">
          <span>{totalLabel ? `${totalLabel}: ${totalCount}` : `Total: ${totalCount}`}</span>
        </div>
      )}
    </div>
  );
};

export const TableFilterBar = memo(TableFilterBarComponent);
export const AdminSearch = TableFilterBar;
