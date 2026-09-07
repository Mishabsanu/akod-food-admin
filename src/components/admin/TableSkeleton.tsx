"use client";

import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showThumbnail?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 6,
  cols = 6,
  showThumbnail = false,
}) => {
  // Generate pseudo-random realistic widths for natural data look
  const getCellWidth = (rowIdx: number, colIdx: number) => {
    const widths = ['w-24', 'w-32', 'w-48', 'w-20', 'w-36', 'w-16', 'w-28', 'w-40'];
    const idx = (rowIdx * 3 + colIdx * 5) % widths.length;
    return widths[idx];
  };

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={`skeleton-row-${rowIdx}`} className="ecom-tr animate-pulse">
          {Array.from({ length: cols }).map((_, colIdx) => {
            // First column: typically an ID badge
            if (colIdx === 0) {
              return (
                <td key={`skeleton-cell-${rowIdx}-${colIdx}`} className="ecom-td">
                  <div className="h-4 w-24 bg-slate-200 rounded-sm"></div>
                </td>
              );
            }

            // If thumbnail column is requested or second column in product/category tables
            if (showThumbnail && colIdx === 1) {
              return (
                <td key={`skeleton-cell-${rowIdx}-${colIdx}`} className="ecom-td text-center">
                  <div className="w-8 h-8 rounded bg-slate-200 mx-auto"></div>
                </td>
              );
            }

            // Last column: typically actions (2 small square buttons)
            if (colIdx === cols - 1) {
              return (
                <td key={`skeleton-cell-${rowIdx}-${colIdx}`} className="ecom-td text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-6 h-6 rounded bg-slate-200"></div>
                    <div className="w-6 h-6 rounded bg-slate-200"></div>
                  </div>
                </td>
              );
            }

            // Second to last column (often status badge)
            if (colIdx === cols - 2) {
              return (
                <td key={`skeleton-cell-${rowIdx}-${colIdx}`} className="ecom-td text-center">
                  <div className="h-4 w-16 bg-slate-200 rounded-xs mx-auto"></div>
                </td>
              );
            }

            // Standard data cell
            return (
              <td key={`skeleton-cell-${rowIdx}-${colIdx}`} className="ecom-td">
                <div className={`h-3.5 ${getCellWidth(rowIdx, colIdx)} bg-slate-200 rounded-xs`}></div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};
