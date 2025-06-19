import { client } from "@/lib/client"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const initialState:any = {
    loading: false,
    error: null,
    details: {
        name: "",
        outstanding_amount: 0,
        due_date: null,
        email: "",
    },
}

export const getDetailsForPayment = createAsyncThunk("payment/getDetailsForPayment", async (customerId: string) => {
    const response = await client.get(`/payments/${customerId}`)
    return response.data
})

export const makePayment = createAsyncThunk("payment/makePayment", async (customerId: string) => {
    const response = await client.post("/payments", { customerId })
    return response.data
})

const paymentSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(makePayment.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(makePayment.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.details = {
                    name: action.payload.name,
                    outstanding_amount: 0,
                    due_date: action.payload.due_date,
                    email: action.payload.email,
                }
            })
            .addCase(makePayment.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload 
            })
            .addCase(getDetailsForPayment.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getDetailsForPayment.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.details = action.payload
            })
            .addCase(getDetailsForPayment.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload 
            })
    }
})

export const { clearError } = paymentSlice.actions
export default paymentSlice