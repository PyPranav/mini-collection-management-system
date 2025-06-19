"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { useRef } from "react";
import {
  clearError,
  getCustomersWithCurrentFilters,
  resetFilters,
  setFilter,
  setPage,
} from "@/store/slices/customerSlice";
import { useCustomerColumns } from "./CustomerTableColumn";
import AddCustomerModal from "./AddCustomerModal";
import CustomerFilters from "./CustomerFilters";
import CustomerTableView from "./CustomerTableView";
import CustomerPagination from "./CustomerPagination";
import { useAppSelector } from "@/store/hooks";
import ImportExcelModal from "./ImportExcelModal";
import NotificationsModal from "./NotificationsModel";
import { fetchNotifications } from "@/store/slices/notificationsSlice";


export default function CustomerTable() {
  const dispatch = useDispatch();
  const { customers, customerFilters, pagination, loading, error } =
    useAppSelector((state) => state.customer);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [editData, setEditData] = useState<any | null>(null);
  const fetchingRef = useRef(false);

  // Handle filter changes - memoize to prevent rerenders
  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterType>) => {
      dispatch(setFilter(newFilters));
    },
    [dispatch]
  );

  // Handle page change - memoize to prevent rerenders
  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  // Handle reset filters - memoize to prevent rerenders
  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Handle sort change - memoize to prevent rerenders
  const handleSort = useCallback(
    (sortBy: string) => {
      const currentSortOrder =
        customerFilters.sortBy === sortBy && customerFilters.sortOrder === "asc"
          ? "desc"
          : "asc";
      dispatch(setFilter({ sortBy, sortOrder: currentSortOrder, page: 1 }));
    },
    [dispatch, customerFilters.sortBy, customerFilters.sortOrder]
  );

  // Get columns with sort handler - memoize to prevent rerenders
  const customerColumns = useCustomerColumns({ onSort: handleSort, setEditData });
  const columns = useMemo(() => customerColumns, [customerColumns]);

  const table = useReactTable({
    data: customers,
    columns,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination?.totalPages || 0,
    state: {
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: (customerFilters.page || 1) - 1,
        pageSize: customerFilters.limit || 10,
      },
    },
  });

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!fetchingRef.current) {
        fetchingRef.current = true;
        try {
          await dispatch(getCustomersWithCurrentFilters() as any);
          await dispatch(fetchNotifications() as any);
        } finally {
          fetchingRef.current = false;
        }
      }
    };

    fetchData();
  }, [
    dispatch,
    customerFilters.page,
    customerFilters.limit,
    customerFilters.sortBy,
    customerFilters.sortOrder,
    customerFilters.name_search,
    customerFilters.email_search,
    customerFilters.payment_status,
    customerFilters.outstanding_amount_min,
    customerFilters.outstanding_amount_max,
    customerFilters.due_date_from,
    customerFilters.due_date_to,
    customerFilters.created_after,
    customerFilters.created_before,
  ]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              Manage your customers and track their payment status.
            </CardDescription>
          </div>
          <div className="flex flex-row gap-5">
            <ImportExcelModal
              onImportComplete={() =>
                dispatch(
                  getCustomersWithCurrentFilters(Date.now() as any) as any
                )
              }
            />
            <AddCustomerModal
              editData={editData}
              onAddComplete={() =>
              {
                dispatch(
                  getCustomersWithCurrentFilters(Date.now() as any) as any
                )
                setEditData(null)
              }}
            />
            <NotificationsModal />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => dispatch(clearError())}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <CustomerFilters
          filters={customerFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          table={table}
        />

        <CustomerTableView
          table={table}
          loading={loading}
          columns={columns}
          limit={customerFilters.limit || 10}
        />

        {pagination && (
          <CustomerPagination
            table={table}
            pagination={pagination}
            filters={customerFilters}
            loading={loading}
            onPageChange={handlePageChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
