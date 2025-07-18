"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  // Watch form values for controlled components and conditional rendering
  const { type, accountId, category, date, isRecurring, recurringInterval } =
    watch();

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const handleTypeChange = (value) => {
    setValue("type", value);
    // When type changes, the selected category might not be valid anymore.
    setValue("category", undefined, { shouldValidate: true });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Receipt Scanner - Only show in create mode */}
        {!editMode && (
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <ReceiptScanner onScanComplete={handleScanComplete} />
          </div>
        )}

        {/* Transaction Type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Transaction Type
          </label>
          <Select
            onValueChange={handleTypeChange}
            value={type}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Expense
                </div>
              </SelectItem>
              <SelectItem value="INCOME">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Income
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="flex items-center gap-1 text-sm text-red-500">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.type.message}
            </p>
          )}
        </div>

        {/* Amount and Account */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <div className="relative">
              <span className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2 dark:text-gray-400">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 h-11"
                {...register("amount")}
              />
            </div>
            {errors.amount && (
              <p className="flex items-center gap-1 text-sm text-red-500">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Account
            </label>
            <div className="space-y-2">
              <Select
                onValueChange={(value) => setValue("accountId", value, { shouldValidate: true })}
                value={accountId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ${parseFloat(account.balance).toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.accountId && (
              <p className="flex items-center gap-1 text-sm text-red-500">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.accountId.message}
              </p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Category
          </label>
          <Select
            onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
            value={category || ""}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="flex items-center gap-1 text-sm text-red-500">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 pl-3 text-left font-normal justify-start",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => setValue("date", date)}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="flex items-center gap-1 text-sm text-red-500">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Input 
            placeholder="Enter description (optional)" 
            className="h-11"
            {...register("description")} 
          />
          {errors.description && (
            <p className="flex items-center gap-1 text-sm text-red-500">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Recurring Toggle */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Recurring Transaction
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set up a recurring schedule for this transaction
              </p>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={(checked) => setValue("isRecurring", checked)}
            />
          </div>
        </div>

        {/* Recurring Interval */}
        {isRecurring && (
          <div className="pl-4 space-y-2 border-l-2 border-blue-200 dark:border-blue-800">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Recurring Interval
            </label>
            <Select
              onValueChange={(value) => setValue("recurringInterval", value, { shouldValidate: true })}
              value={recurringInterval || ""}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {errors.recurringInterval && (
              <p className="flex items-center gap-1 text-sm text-red-500">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.recurringInterval.message}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1 h-11" 
            disabled={transactionLoading}
          >
            {transactionLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editMode ? "Updating..." : "Creating..."}
              </>
            ) : editMode ? (
              "Update Transaction"
            ) : (
              "Create Transaction"
            )}
          </Button>
        </div>
      </form>

      {/* Create Account Drawer - Moved outside of form */}
      <div className="mt-4">
        <CreateAccountDrawer>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-sm border-dashed h-9 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Account
          </Button>
        </CreateAccountDrawer>
      </div>
    </div>
  );
}