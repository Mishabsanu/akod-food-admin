"use client";

import React from 'react';
import Link from 'next/link';
import { RotateCcw, Plus, SearchX } from 'lucide-react';

interface TableEmptyStateProps {
  colSpan?: number;
  title?: string;
  description?: string;
  hasFilters?: boolean;
  onResetFilters?: () => void;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  imageSrc?: string;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  colSpan = 1,
  title = "No data records found",
  description = "No items matched your search query or filter parameters. Try refining your keywords or resetting filters.",
  hasFilters = false,
  onResetFilters,
  actionLabel,
  actionHref,
  onAction,
  imageSrc = "/empty-state.png",
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          {/* Empty State Image Illustration */}
          <div className="relative mb-3.5 group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/30 p-2 border border-slate-100/80 shadow-xs transition-transform duration-300 group-hover:scale-105">
              <img
                src={imageSrc}
                alt="No data found"
                className="w-full h-full object-contain drop-shadow-sm select-none"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400">
              <SearchX size={14} className="text-[#546b5a]" />
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-1">
            {title}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed font-normal">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {hasFilters && onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-all shadow-2xs hover:border-slate-400"
              >
                <RotateCcw size={13} className="text-slate-500" />
                <span>Reset Filters & Search</span>
              </button>
            )}

            {actionLabel && actionHref && (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#546b5a] hover:bg-[#415446] border border-[#546b5a] rounded-md transition-all shadow-xs"
              >
                <Plus size={14} />
                <span>{actionLabel}</span>
              </Link>
            )}

            {actionLabel && !actionHref && onAction && (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#546b5a] hover:bg-[#415446] border border-[#546b5a] rounded-md transition-all shadow-xs"
              >
                <Plus size={14} />
                <span>{actionLabel}</span>
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
