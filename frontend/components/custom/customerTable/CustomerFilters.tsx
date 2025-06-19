"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Calendar, ChevronDown, IndianRupee } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Table } from "@tanstack/react-table";

interface CustomerFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
  onResetFilters: () => void;
  table: Table<any>;
}

export default function CustomerFilters({
  filters,
  onFilterChange,
  onResetFilters,
  table,
}: CustomerFiltersProps) {
  // Initialize local state from Redux filters to prevent conflicts
  const [nameSearch, setNameSearch] = useState(filters.name_search || "");
  const [emailSearch, setEmailSearch] = useState(filters.email_search || "");
  const [outstandingMin, setOutstandingMin] = useState(
    filters.outstanding_amount_min?.toString() || ""
  );
  const [outstandingMax, setOutstandingMax] = useState(
    filters.outstanding_amount_max?.toString() || ""
  );
  const [dueDateFrom, setDueDateFrom] = useState<Date | undefined>(
    filters.due_date_from ? new Date(filters.due_date_from) : undefined
  );
  const [dueDateTo, setDueDateTo] = useState<Date | undefined>(
    filters.due_date_to ? new Date(filters.due_date_to) : undefined
  );
  const [createdAfter, setCreatedAfter] = useState<Date | undefined>(
    filters.created_after ? new Date(filters.created_after) : undefined
  );
  const [createdBefore, setCreatedBefore] = useState<Date | undefined>(
    filters.created_before ? new Date(filters.created_before) : undefined
  );

  const nameSearchRef = useRef(nameSearch);
  const emailSearchRef = useRef(emailSearch);
  const outstandingMinRef = useRef(outstandingMin);
  const outstandingMaxRef = useRef(outstandingMax);

  // Handle search with debounce - use refs to prevent loops
  useEffect(() => {
    nameSearchRef.current = nameSearch;
    const timer = setTimeout(() => {
      if (nameSearchRef.current !== filters.name_search) {
        onFilterChange({
          name_search: nameSearchRef.current || undefined,
          page: 1,
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [nameSearch]); // Remove onFilterChange and filters.name_search from dependencies

  useEffect(() => {
    emailSearchRef.current = emailSearch;
    const timer = setTimeout(() => {
      if (emailSearchRef.current !== filters.email_search) {
        onFilterChange({
          email_search: emailSearchRef.current || undefined,
          page: 1,
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [emailSearch]); // Remove onFilterChange and filters.email_search from dependencies

  // Handle outstanding amount filters - use refs to prevent loops
  useEffect(() => {
    outstandingMinRef.current = outstandingMin;
    outstandingMaxRef.current = outstandingMax;
    const timer = setTimeout(() => {
      const minAmount = outstandingMinRef.current
        ? Number.parseFloat(outstandingMinRef.current)
        : undefined;
      const maxAmount = outstandingMaxRef.current
        ? Number.parseFloat(outstandingMaxRef.current)
        : undefined;

      if (
        minAmount !== filters.outstanding_amount_min ||
        maxAmount !== filters.outstanding_amount_max
      ) {
        onFilterChange({
          outstanding_amount_min: minAmount,
          outstanding_amount_max: maxAmount,
          page: 1,
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [outstandingMin, outstandingMax]); // Remove onFilterChange and filters from dependencies

  // Handle date filters - simplified to prevent loops
  useEffect(() => {
    const dueDateFromStr = dueDateFrom
      ? dueDateFrom.toISOString().split("T")[0]
      : undefined;
    const dueDateToStr = dueDateTo
      ? dueDateTo.toISOString().split("T")[0]
      : undefined;

    if (
      dueDateFromStr !== filters.due_date_from ||
      dueDateToStr !== filters.due_date_to
    ) {
      const timer = setTimeout(() => {
        onFilterChange({
          due_date_from: dueDateFromStr,
          due_date_to: dueDateToStr,
          page: 1,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dueDateFrom, dueDateTo]);

  useEffect(() => {
    const createdAfterStr = createdAfter
      ? createdAfter.toISOString().split("T")[0]
      : undefined;
    const createdBeforeStr = createdBefore
      ? createdBefore.toISOString().split("T")[0]
      : undefined;

    if (
      createdAfterStr !== filters.created_after ||
      createdBeforeStr !== filters.created_before
    ) {
      const timer = setTimeout(() => {
        onFilterChange({
          created_after: createdAfterStr,
          created_before: createdBeforeStr,
          page: 1,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [createdAfter, createdBefore]);

  const handlePaymentStatusFilter = useCallback(
    (status: string) => {
      onFilterChange({
        payment_status: status === "all" ? undefined : status,
        page: 1,
      });
    },
    [onFilterChange]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: string) => {
      onFilterChange({ limit: Number.parseInt(newPageSize), page: 1 });
    },
    [onFilterChange]
  );

  const handleResetFilters = useCallback(() => {
    setNameSearch("");
    setEmailSearch("");
    setOutstandingMin("");
    setOutstandingMax("");
    setDueDateFrom(undefined);
    setDueDateTo(undefined);
    setCreatedAfter(undefined);
    setCreatedBefore(undefined);
    onResetFilters();
  }, [onResetFilters]);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name Search */}
        <div className="space-y-2">
          <Label htmlFor="name-search">Search by Name</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="name-search"
              placeholder="Customer name..."
              value={nameSearch}
              onChange={(event) => setNameSearch(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Email Search */}
        <div className="space-y-2">
          <Label htmlFor="email-search">Search by Email</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email-search"
              placeholder="Customer email..."
              value={emailSearch}
              onChange={(event) => setEmailSearch(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Payment Status Filter */}
        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select
            value={filters.payment_status || "all"}
            onValueChange={handlePaymentStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page Size */}
        <div className="space-y-2">
          <Label>Items per page</Label>
          <Select
            value={filters.limit?.toString() || "10"}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>

              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Outstanding Amount Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount-min">Min Outstanding Amount</Label>
          <div className="relative">
            <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount-min"
              type="number"
              placeholder="0.00"
              value={outstandingMin}
              onChange={(event) => setOutstandingMin(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount-max">Max Outstanding Amount</Label>
          <div className="relative">
            <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount-max"
              type="number"
              placeholder="999999.99"
              value={outstandingMax}
              onChange={(event) => setOutstandingMax(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Due Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dueDateFrom ? format(dueDateFrom, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={dueDateFrom}
                onSelect={setDueDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Due Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dueDateTo ? format(dueDateTo, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={dueDateTo}
                onSelect={setDueDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Created After</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {createdAfter ? format(createdAfter, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={createdAfter}
                onSelect={setCreatedAfter}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Created Before</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {createdBefore ? format(createdBefore, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={createdBefore}
                onSelect={setCreatedBefore}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleResetFilters}>
          Reset All Filters
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace("_source.", "").replace("_", " ")}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
