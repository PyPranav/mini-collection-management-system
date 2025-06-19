"use client"
import { useAppSelector } from "@/store/hooks";
import { getDetailsForPayment, makePayment } from "@/store/slices/paymentSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon } from "lucide-react";

const PaymentPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { details, loading, error } = useAppSelector((state) => state.payment);
    const { name, outstanding_amount, due_date, email } = details || {};
    useEffect(() => {
        dispatch(getDetailsForPayment(id as string) as any);
    }, [id]);
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Make Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <>
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-2/5" />
                        </>
                    ) : error ? (
                        <div className="text-destructive">{String(error)}</div>
                    ) : outstanding_amount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <CheckIcon className="text-green-600 mb-2" size={48} />
                            <div className="text-green-700 font-semibold text-lg">No outstanding payments!</div>
                        </div>
                    ) : (
                        <>
                            <div><span className="font-medium">Name:</span> {name}</div>
                            <div><span className="font-medium">Email:</span> {email}</div>
                            <div><span className="font-medium">Outstanding Amount:</span> ₹{outstanding_amount}</div>
                            <div><span className="font-medium">Due Date:</span> {due_date ? new Date(due_date).toLocaleDateString() : "-"}</div>
                        </>
                    )}
                </CardContent>
                {(!loading && !error && outstanding_amount === 0) ? null : (
                    <CardFooter>
                        <Button className="w-full" disabled={loading} onClick={() => {
                            dispatch(makePayment(id as string) as any);
                        }}>Make Payment</Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
 
export default PaymentPage;