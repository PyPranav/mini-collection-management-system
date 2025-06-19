"use client";

import { flexRender, type Table as TableType } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  _id: string;
  _source: {
    name: string;
    contact_info: {
      email?: string;
      phone?: string;
    };
    outstanding_amount: number;
    due_date?: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
  };
}

interface CustomerTableViewProps {
  table: TableType<Customer>;
  loading: boolean;
  columns: any[];
  limit: number;
}

export default function CustomerTableView({
  table,
  loading,
  columns,
  limit,
}: CustomerTableViewProps) {
  return (
    <div className="relative">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : loading ? (
              // Show skeleton rows while loading
              Array.from({ length: limit }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={`skeleton-cell-${cellIndex}`}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Loading overlay for table updates */}
        {loading && table.getRowModel().rows?.length > 0 && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-background p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Updating...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
