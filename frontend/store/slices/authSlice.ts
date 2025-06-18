import { createSlice, configureStore } from "@reduxjs/toolkit";
import { client } from "@/lib/client";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await client.post("/users/login", {
      email,
      password,
    });
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    return response.data;
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await client.post("/users/register", {
      email,
      password,
    });
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    return response.data;
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    const response = await client.get("/users/profile");
    return response.data;
  }
);

const initialState = {
  data: {
    id: null,
    email: null,
  },
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => (state = initialState),
  },
  extraReducers: (builder) => {
    // Generic handlers for all auth actions
    const authActions = [loginUser, registerUser, getCurrentUser];

    authActions.forEach((action) => {
      builder
        .addCase(action.pending, (state) => {
          state.status = "pending";
        })
        .addCase(action.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.data.email = action.payload.email;
          state.data.id = action.payload.id;
        })
        .addCase(action.rejected, (state) => {
          state.status = "failed";
        });
    });
  },
});

export const { logout } = authSlice.actions;

export { authSlice };
