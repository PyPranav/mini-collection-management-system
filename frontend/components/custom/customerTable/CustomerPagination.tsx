"use client";

import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";

interface CustomerPaginationProps {
  table: Table<any>;
  pagination: PaginationInfo;
  filters: FilterType;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export default function CustomerPagination({
  table,
  pagination,
  filters,
  loading,
  onPageChange,
}: CustomerPaginationProps) {
  // Debug logging
  console.log("Pagination Debug:", {
    pagination,
    filters,
    currentPage: filters.page,
    pageLimit: filters.limit,
  });

  // Ensure we have valid values with defaults
  const currentPage = filters.page || 1;
  const pageLimit = filters.limit || 10;
  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;

  // Calculate the range of items being shown
  const startItem = (currentPage - 1) * pageLimit + 1;
  const endItem = Math.min(currentPage * pageLimit, totalItems);

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
        <span className="ml-4">
          Showing {startItem} to {endItem} of {totalItems} entries
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from(
            { length: Math.min(5, totalPages) },
            (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              );
            }
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
