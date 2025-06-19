import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "@/lib/client";

const initialState: StateType = {
  customerFilters: {
    page: 1,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "desc",
  },
  customers: [],
  pagination: null,
  loading: false,
  error: null,
};

// Alternative thunk that gets filters from state
export const getCustomersWithCurrentFilters = createAsyncThunk(
  "customer/getWithCurrentFilters",
  async (_timestamp, { rejectWithValue, getState }) => {
    try {
      const state = (getState() as any).customer;
      const filters = state.customerFilters;

      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await client.get(`/customers?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customers"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (data: {
    due_date: string;
    email: string;
    name: string;
    outstanding_amount: number;
    payment_status: string;
    phone: string;
  }) => {
    console.log({
      data,
    });
    const response = await client.post("/customers", {
      ...data,
      contact_info: {
        email: data.email,
        phone: data.phone,
      },
    });
    return response.data;
  }
);

export const deleteCustomer = createAsyncThunk(
  "customer/deleteCustomer",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await client.delete(`/customers/${id}`);
      return {id, ...response.data};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete customer");
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customer/updateCustomer",
  async (data: {
    id: string;
    due_date: string;
    email: string;
    name: string;
    outstanding_amount: number;
    payment_status: string;
    phone: string;
  }, { rejectWithValue }) => {
      const response = await client.put(`/customers/${data.id}`, {
        ...data,
        contact_info: {
          email: data.email,
          phone: data.phone,
        },
      });
      return response.data;

  }
);

export const bulkCreateCustomer = createAsyncThunk(
  "customer/bulkCreate",
  async (file: any, { rejectWithValue }) => {
    try {
      // Validate file before sending
      if (!file) {
        throw new Error("No file provided");
      }

      // Validate file type
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        throw new Error("Please upload a valid Excel file (.xlsx or .xls)");
      }

      // Create FormData to send file
      const formData = new FormData();
      formData.append("file", file);

      // Make API call to bulk update endpoint
      const response = await client.post("/customers/excel/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Optional: Add timeout for large files
        timeout: 300000, // 5 minutes
      });

      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        return rejectWithValue({
          message: error.response.data.message || "Server error occurred",
          status: error.response.status,
          errors: error.response.data.errors || [],
          ...error.response.data,
        });
      } else if (error.request) {
        // Network error
        return rejectWithValue({
          message: "Network error. Please check your connection.",
          status: 0,
        });
      } else {
        // Other errors (validation, etc.)
        return rejectWithValue({
          message: error.message || "An unexpected error occurred",
          status: 0,
        });
      }
    }
  }
);

export const downloadExcelSample = createAsyncThunk(
  "customer/downloadExcelSample",
  async (_, { rejectWithValue }) => {
    try {
      // Make API call to get sample Excel file
      const response = await client.get("/customers/excel/sample", {
        responseType: "blob", // Important: Tell axios to expect binary data
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      // Create blob from response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = "sample_customers_template.xlsx";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        message: "Sample Excel file downloaded successfully",
        filename: filename,
      };
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        return rejectWithValue({
          message:
            error.response.data?.message || "Failed to download sample file",
          status: error.response.status,
        });
      } else if (error.request) {
        // Network error
        return rejectWithValue({
          message: "Network error. Please check your connection.",
          status: 0,
        });
      } else {
        // Other errors
        return rejectWithValue({
          message: error.message || "An unexpected error occurred",
          status: 0,
        });
      }
    }
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setFilter: (state, action: { payload: Partial<FilterType> }) => {
      // Merge new filters with existing ones
      state.customerFilters = {
        ...state.customerFilters,
        ...action.payload,
      };
    },
    resetFilters: (state) => {
      state.customerFilters = {
        page: 1,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
      };
    },
    setPage: (state, action: { payload: number }) => {
      state.customerFilters.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getCustomersWithCurrentFilters
      .addCase(getCustomersWithCurrentFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomersWithCurrentFilters.fulfilled, (state, action) => {
        console.log("API Response:", action.payload);
        state.loading = false;
        state.customers = action.payload.data.hits || [];
        state.pagination = action.payload.pagination;
        console.log("Updated pagination:", state.pagination);
        state.error = null;
      })
      .addCase(getCustomersWithCurrentFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        console.log("action.payload", action.payload, state.customers)
        state.customers = state.customers.filter((customer) => customer._id !== action.payload.id);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.customers = state.customers.map((customer) =>
          customer._id === action.payload._id ? action.payload : customer
        );
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilter, resetFilters, setPage, clearError } =
  customerSlice.actions;
export { customerSlice };
