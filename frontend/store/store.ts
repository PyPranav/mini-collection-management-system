import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./slices/authSlice";
import { customerSlice } from "./slices/customerSlice";
import notificationsSlice from "./slices/notificationsSlice";
import paymentSlice from "./slices/paymentSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      customer: customerSlice.reducer,
      notifications: notificationsSlice.reducer,
      payment: paymentSlice.reducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
