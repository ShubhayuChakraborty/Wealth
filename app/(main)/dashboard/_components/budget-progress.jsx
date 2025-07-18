"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const remaining = initialBudget ? initialBudget.amount - currentExpenses : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  const getBudgetStatus = () => {
    if (!initialBudget) return { color: "gray", text: "No Budget", icon: DollarSign };
    if (percentUsed >= 90) return { color: "red", text: "Over Budget", icon: AlertTriangle };
    if (percentUsed >= 75) return { color: "yellow", text: "High Usage", icon: TrendingUp };
    return { color: "green", text: "On Track", icon: TrendingUp };
  };

  const status = getBudgetStatus();

  const getProgressColor = () => {
    if (percentUsed >= 90) return "bg-red-500";
    if (percentUsed >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getCardGradient = () => {
    if (percentUsed >= 90) return "bg-gradient-to-br from-red-50 to-pink-50 border-red-200";
    if (percentUsed >= 75) return "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200";
    return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200";
  };

  return (
    <Card className={`${getCardGradient()} border-2 rounded-2xl hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              percentUsed >= 90 ? "bg-red-100" : 
              percentUsed >= 75 ? "bg-yellow-100" : 
              "bg-green-100"
            }`}>
              <status.icon className={`h-5 w-5 ${
                percentUsed >= 90 ? "text-red-600" : 
                percentUsed >= 75 ? "text-yellow-600" : 
                "text-green-600"
              }`} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">
                Monthly Budget
              </CardTitle>
              <p className="text-sm font-medium text-gray-600">
                Default Account
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge className={`${
            percentUsed >= 90 ? "bg-red-100 text-red-800 border-red-200" : 
            percentUsed >= 75 ? "bg-yellow-100 text-yellow-800 border-yellow-200" : 
            "bg-green-100 text-green-800 border-green-200"
          } hover:bg-current font-semibold`}>
            {status.text}
          </Badge>
        </div>
      </CardHeader>

      {/* Budget Amount Section */}
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="p-4 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute font-medium text-gray-500 -translate-y-1/2 left-3 top-1/2">
                  $
                </span>
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="py-3 pl-8 pr-4 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                  placeholder="Enter budget amount"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdateBudget}
                disabled={isLoading}
                className="w-10 h-10 text-green-600 bg-green-100 rounded-xl hover:bg-green-200"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-10 h-10 text-red-600 bg-red-100 rounded-xl hover:bg-red-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Budget Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  ${initialBudget ? initialBudget.amount.toFixed(2) : "0.00"}
                </p>
                <p className="text-xs font-medium text-gray-600">Total Budget</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  ${currentExpenses.toFixed(2)}
                </p>
                <p className="text-xs font-medium text-gray-600">Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${remaining.toFixed(2)}
                </p>
                <p className="text-xs font-medium text-gray-600">Remaining</p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="font-medium text-gray-700 border border-gray-200 rounded-xl bg-white/80 hover:bg-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Budget
              </Button>
            </div>
          </>
        )}

        {/* Progress Bar */}
        {initialBudget && (
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Budget Usage</span>
                <span className="text-sm font-bold text-gray-900">{percentUsed.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
                <div
                  className={`h-full ${getProgressColor()} transition-all duration-300 ease-out rounded-full`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>$0</span>
                <span>${initialBudget.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* No Budget Message */}
        {!initialBudget && (
          <div className="py-6 text-center">
            <div className="p-4 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-gray-600">No budget set</p>
              <p className="mt-1 text-sm text-gray-500">Click edit to set your monthly budget</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}