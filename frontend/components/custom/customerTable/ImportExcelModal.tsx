"use client";

import type React from "react";

import { useState } from "react";
import { Upload, Download, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDispatch } from "react-redux";
import {
  bulkCreateCustomer,
  downloadExcelSample,
} from "@/store/slices/customerSlice";

interface ImportExcelModalProps {
  onImportComplete: () => void;
}

export default function ImportExcelModal({
  onImportComplete,
}: ImportExcelModalProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const dispatch = useDispatch();

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setSelectedFile(file);
      } else {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setSelectedFile(file);
      } else {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Dispatch the bulk create customer thunk
      const result = await dispatch(
        bulkCreateCustomer(selectedFile) as any
      ).unwrap();

      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onImportComplete();
      }, 1000);

      // Handle successful response
      if (result.successCount > 0) {
        toast.success(
          `Successfully updated ${result.successCount} customer${
            result.successCount > 1 ? "s" : ""
          }`
        );
      }

      // Handle partial success with errors
      if (result.errorCount > 0) {
        toast.warning(
          `${result.errorCount} row${
            result.errorCount > 1 ? "s" : ""
          } failed to update. Check the details below.`
        );

        // Optionally log detailed errors to console or show in UI
        if (result.errors && result.errors.length > 0) {
          console.log("Upload errors:", result.errors);
          // You could also set these errors to state to display in the UI
          // setUploadErrors(result.errors);
        }
      }

      // If no customers were updated at all
      if (result.successCount === 0 && result.errorCount > 0) {
        toast.error(
          "No customers were updated. Please check your file format and data."
        );
      }

      // Reset form state on success
      if (result.successCount > 0) {
        setSelectedFile(null);
        setOpen(false);
        // onImportComplete();
      }
    } catch (error: any) {
      // Handle thunk rejection
      console.error("Bulk upload error:", error);

      if (error.status === 400) {
        toast.error(error.message || "Invalid file or data format");
      } else if (error.status === 500) {
        toast.error("Server error occurred. Please try again later.");
      } else if (error.status === 0) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(
          error.message || "An error occurred while importing customers"
        );
      }

      // Optionally show detailed errors if available
      if (error.errors && error.errors.length > 0) {
        console.log("Detailed errors:", error.errors);
        // You could display these errors in a modal or expandable section
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle sample download
  const handleDownloadSample = async () => {
    try {
      const result = await dispatch(downloadExcelSample() as any);
      toast.success("Sample Excel file downloaded successfully");
    } catch (error: any) {
      console.error("Download failed:", error);
      toast.error(error.message || "Failed to download sample file");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Import Customers from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import multiple customers at once, or
            download a sample template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Download Sample Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Download Sample
              </CardTitle>
              <CardDescription>
                Get a sample Excel template with the correct format and example
                data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDownloadSample}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample File
              </Button>
              <div className="mt-3 text-xs text-muted-foreground">
                <p>The sample includes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Required columns format</li>
                  <li>Example customer data</li>
                  <li>Proper date formatting</li>
                  <li>Payment status options</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Upload File Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Excel File
              </CardTitle>
              <CardDescription>
                Select or drag and drop your Excel file to import customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Drop your Excel file here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        or click to browse
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Excel File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Customers
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <strong>File Requirements:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>File format: .xlsx or .xls</li>
              <li>
                Required columns: name, email, phone, outstanding_amount,
                due_date, payment_status
              </li>
              <li>Date format: YYYY-MM-DD (e.g., 2024-12-31)</li>
              <li>Payment status: "paid", "pending", or "overdue"</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
