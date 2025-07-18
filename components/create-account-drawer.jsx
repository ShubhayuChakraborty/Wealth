"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, CreditCard, PiggyBank } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  if (!open) {
    return (
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="relative p-6 text-white bg-gradient-to-r from-blue-600 to-purple-600">
          <button
            onClick={() => setOpen(false)}
            className="absolute p-2 transition-colors rounded-full top-4 right-4 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-white/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create New Account</h2>
              <p className="text-sm text-blue-100">Add a new bank account</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Account Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                Account Name
              </label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="e.g., Main Checking"
                  {...register("name")}
                  className="py-3 pl-4 pr-4 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                />
              </div>
              {errors.name && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger className="py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-2 rounded-xl">
                  <SelectItem value="CURRENT" className="py-3">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Current Account</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SAVINGS" className="py-3">
                    <div className="flex items-center gap-3">
                      <PiggyBank className="w-4 h-4 text-green-600" />
                      <span>Savings Account</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Initial Balance */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Initial Balance
              </label>
              <div className="relative">
                <span className="absolute font-medium text-gray-500 -translate-y-1/2 left-4 top-1/2">
                  $
                </span>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("balance")}
                  className="py-3 pl-8 pr-4 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                />
              </div>
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            {/* Default Account Toggle */}
            <div className="p-4 border-2 border-gray-100 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Set as Default Account
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    This account will be selected by default for transactions
                  </p>
                </div>
                <Switch
                  id="isDefault"
                  checked={watch("isDefault")}
                  onCheckedChange={(checked) => setValue("isDefault", checked)}
                  className="ml-4"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 py-3 font-semibold border-2 border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 font-semibold text-white shadow-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}