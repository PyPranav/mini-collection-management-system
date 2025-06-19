interface FilterType {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  name_search?: string;
  email_search?: string;
  payment_status?: string;
  outstanding_amount_min?: number;
  outstanding_amount_max?: number;
  due_date_from?: string; // ISO date string, e.g., "2024-06-18"
  due_date_to?: string;
  created_after?: string;
  created_before?: string;
}

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StateType {
  customerFilters: FilterType;
  customers: Customer[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
}
