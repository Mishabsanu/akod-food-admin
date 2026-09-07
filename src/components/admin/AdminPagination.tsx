"use client";

import React, { memo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface Pagination {
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}

interface TablePaginationProps {
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  pagination?: Pagination;
  meta?: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onItemsPerPageChange?: (pageSize: number) => void;
  itemsPerPage?: number;
  currentPage?: number;
  pageSizeOptions?: number[];
  itemName?: string;
  label?: string;
}

function TablePaginationComponent({
  page: propPage,
  pageSize: propPageSize,
  totalItems: propTotalItems,
  totalPages: propTotalPages,
  pagination: propPagination,
  meta: propMeta,
  onPageChange,
  onPageSizeChange,
  onItemsPerPageChange,
  itemsPerPage,
  currentPage,
  pageSizeOptions = [10, 20, 50, 100],
  itemName,
  label = "transactions",
}: TablePaginationProps) {
  const pObj = propPagination || propMeta;
  const page = propPage ?? currentPage ?? pObj?.page ?? 1;
  const pageSize = propPageSize ?? itemsPerPage ?? pObj?.pageSize ?? 10;
  const totalItems = propTotalItems ?? pObj?.totalItems ?? 0;
  const computedTotalPages =
    propTotalPages ?? pObj?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);
  const displayLabel = itemName || label;

  const handleSizeChange = onPageSizeChange || onItemsPerPageChange;

  return (
    <div className="w-full flex items-center justify-between gap-3 px-3 py-2 text-[11px] text-slate-500 font-sans select-none bg-white border-t border-[#e5e7eb]">
      {/* LEFT: Record count */}
      <span className="font-medium text-slate-600 shrink-0">
        {totalItems === 0 ? `0 ${displayLabel}` : `${startItem} to ${endItem} of ${totalItems} ${displayLabel}`}
      </span>

      {/* RIGHT: Rows selector + Nav */}
      <div className="flex items-center gap-3">
        {handleSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 shrink-0">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (handleSizeChange) handleSizeChange(newSize);
                onPageChange(1);
              }}
              className="h-6 rounded border border-slate-200 bg-white text-[11px] text-slate-700 font-medium px-1 pr-5 focus:outline-none focus:ring-1 focus:ring-[#546b5a] cursor-pointer appearance-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 4px center",
                paddingRight: "20px",
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200" />

        {/* Page Nav */}
        <div className="flex items-center space-x-0.5 text-slate-500">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 text-slate-700 font-medium tabular-nums">
            {page} / {computedTotalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(computedTotalPages, page + 1))}
            disabled={page >= computedTotalPages || computedTotalPages === 0}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(computedTotalPages)}
            disabled={page >= computedTotalPages || computedTotalPages === 0}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const TablePagination = memo(TablePaginationComponent);
export const AdminPagination = TablePagination;
