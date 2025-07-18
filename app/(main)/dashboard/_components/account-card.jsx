"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard, PiggyBank, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault(); // Prevent navigation

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return; // Don't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  const getAccountIcon = () => {
    return type === "SAVINGS" ? (
      <PiggyBank className="w-5 h-5 text-green-600" />
    ) : (
      <CreditCard className="w-5 h-5 text-blue-600" />
    );
  };

  const getCardGradient = () => {
    return type === "SAVINGS" 
      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100" 
      : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100";
  };

  return (
    <Card className={`${getCardGradient()} hover:shadow-lg transition-all duration-300 group relative border-2 rounded-2xl overflow-hidden`}>
      <Link href={`/account/${id}`}>
        {/* Header with Default Badge */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${type === "SAVINGS" ? "bg-green-100" : "bg-blue-100"}`}>
                {getAccountIcon()}
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800 capitalize">
                  {name}
                </CardTitle>
                <p className="text-sm font-medium text-gray-600">
                  {type.charAt(0) + type.slice(1).toLowerCase()} Account
                </p>
              </div>
            </div>
            
            {/* Default Badge */}
            {isDefault && (
              <Badge className="font-semibold bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Default
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Balance Section */}
        <CardContent className="py-4">
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold text-gray-900">
              ${parseFloat(balance).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Available Balance</p>
          </div>
        </CardContent>

        {/* Footer with Actions */}
        <CardFooter className="pt-4 pb-6 border-t border-gray-200/50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-green-100 rounded-full">
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Income</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-red-100 rounded-full">
                  <ArrowDownRight className="w-3 h-3 text-red-600" />
                </div>
                <span className="font-medium text-gray-700">Expense</span>
              </div>
            </div>
            
            {/* Default Account Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Default</span>
              <Switch
                checked={isDefault}
                onClick={handleDefaultChange}
                disabled={updateDefaultLoading}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        </CardFooter>
      </Link>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 transition-opacity duration-500 transform -translate-x-full -skew-x-12 opacity-0 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:opacity-100 group-hover:translate-x-full"></div>
    </Card>
  );
}