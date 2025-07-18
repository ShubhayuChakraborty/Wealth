"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Clock, PieChartIcon, Filter } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

export function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  // Filter transactions for selected account
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  // Get recent transactions (last 5)
  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate expense breakdown for current month
  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Group expenses by category
  const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  // Format data for pie chart
  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Transactions Card */}
      <Card className="overflow-hidden transition-all duration-300 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  Recent Transactions
                </CardTitle>
                <p className="text-sm font-medium text-gray-600">
                  Latest activity overview
                </p>
              </div>
            </div>
            
            {/* Account Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger className="w-[140px] border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="border-2 rounded-xl">
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id} className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{account.name}</span>
                        {account.isDefault && (
                          <Badge className="text-xs bg-amber-100 text-amber-800">Default</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center">
                <div className="p-4 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium text-gray-600">No recent transactions</p>
                  <p className="mt-1 text-sm text-gray-500">Transactions will appear here</p>
                </div>
              </div>
            ) : (
              recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 transition-colors border border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === "EXPENSE" 
                        ? "bg-red-100" 
                        : "bg-green-100"
                    }`}>
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none text-gray-800">
                        {transaction.description || "Untitled Transaction"}
                      </p>
                      <p className="text-xs font-medium text-gray-500">
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-lg font-bold",
                      transaction.type === "EXPENSE"
                        ? "text-red-600"
                        : "text-green-600"
                    )}>
                      {transaction.type === "EXPENSE" ? "-" : "+"}${transaction.amount.toFixed(2)}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs font-medium">
                      {transaction.category}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Card */}
      <Card className="overflow-hidden transition-all duration-300 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">
                Monthly Expense Breakdown
              </CardTitle>
              <p className="text-sm font-medium text-gray-600">
                {format(currentDate, "MMMM yyyy")} spending analysis
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 pb-6">
          {pieChartData.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="p-4 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl">
                <PieChartIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium text-gray-600">No expenses this month</p>
                <p className="mt-1 text-sm text-gray-500">Start tracking your expenses</p>
              </div>
            </div>
          ) : (
            <div className="px-6">
              <div className="p-4 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                        labelLine={false}
                        fontSize={12}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `$${value.toFixed(2)}`}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          fontSize: "12px",
                          fontWeight: "500",
                          paddingTop: "10px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Category Summary */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {pieChartData.slice(0, 4).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                      <p className="text-sm font-bold text-gray-900">${item.value.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}