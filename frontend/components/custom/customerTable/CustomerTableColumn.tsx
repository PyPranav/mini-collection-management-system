"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/store/hooks";
import { deleteCustomer } from "@/store/slices/customerSlice";
import { toast } from "sonner";

interface UseCustomerColumnsProps {
  onSort: (sortBy: string) => void;
  setEditData: (data: any) => void;
}

export function useCustomerColumns({
  onSort,
  setEditData,
}: UseCustomerColumnsProps): ColumnDef<Customer>[] {
  const dispatch = useAppDispatch();
  return useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="mr-2"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "_source.name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original._source.name}</div>
        ),
      },
      {
        accessorKey: "_source.contact_info.email",
        header: () => {
          return (
            <Button
              variant="ghost"
              onClick={() => onSort("contact_info.email")}
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const email = row.original._source.contact_info.email;
          return <div className="lowercase">{email || "N/A"}</div>;
        },
      },
      {
        accessorKey: "_source.contact_info.phone",
        header: "Phone",
        cell: ({ row }) => {
          const phone = row.original._source.contact_info.phone;
          return <div>{phone || "N/A"}</div>;
        },
      },
      {
        accessorKey: "_source.payment_status",
        header: "Payment Status",
        cell: ({ row }) => {
          const status = row.original._source.payment_status;
          const getStatusVariant = (status: string) => {
            switch (status.toLowerCase()) {
              case "paid":
                return "default";
              case "pending":
                return "outline";
              case "overdue":
                return "destructive";
              default:
                return "secondary";
            }
          };
          return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
        },
      },
      {
        accessorKey: "_source.outstanding_amount",
        header: () => {
          return (
            <Button
              variant="ghost"
              onClick={() => onSort("outstanding_amount")}
            >
              Outstanding Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const amount = row.original._source.outstanding_amount;
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "INR",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "_source.due_date",
        header: () => {
          return (
            <Button variant="ghost" onClick={() => onSort("due_date")}>
              Due Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const dueDate = row.original._source.due_date;
          if (!dueDate) return <div>N/A</div>;
          const date = new Date(dueDate);
          const isOverdue =
            date < new Date() && row.original._source.payment_status !== "paid";
          return (
            <div className={isOverdue ? "text-red-600 font-medium" : ""}>
              {date.toLocaleDateString()}
            </div>
          );
        },
      },
      {
        accessorKey: "_source.created_at",
        header: () => {
          return (
            <Button variant="ghost" onClick={() => onSort("created_at")}>
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.original._source.created_at);
          return <div>{date.toLocaleDateString()}</div>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const customer = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setEditData({...customer._source, id: customer._id})
                  }}>
                  Edit customer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    dispatch(deleteCustomer(customer._id)).then((res) => {
                      if (res.meta.requestStatus === "fulfilled") {
                      } else {
                        toast.error("Failed to delete customer")
                      }
                    })
                  }}>
                  Delete customer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(customer._id)}
                >
                  Copy customer ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/payment/${customer._id}`)}
                >
                  Copy payment url
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onSort]
  );
}

