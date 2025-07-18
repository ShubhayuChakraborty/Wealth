import { Suspense } from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";

export default async function DashboardPage() {
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {/* Budget Progress Section */}
      <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Overview</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Stay on track with your spending goals</p>
        </div>
        <div className="p-6">
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />
        </div>
      </div>

      {/* Dashboard Overview Section */}
      <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Financial Overview
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Your complete financial snapshot
          </p>
        </div>
        <div className="p-6">
          <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
          />
        </div>
      </div>

      {/* Accounts Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Accounts
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Manage all your financial accounts in one place
          </p>
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Create Account Card */}
          <CreateAccountDrawer>
            <Card className="transition-all duration-200 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer group hover:shadow-md dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center h-32 p-6 text-center">
                <div className="flex items-center justify-center w-10 h-10 mb-3 transition-transform duration-200 bg-blue-500 rounded-lg group-hover:scale-105">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700 transition-colors dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Add New Account
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Connect your bank account
                </p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {/* Account Cards */}
          {accounts.length > 0 &&
            accounts?.map((account) => (
              <div key={account.id} className="transform hover:scale-[1.02] transition-transform duration-200">
                <AccountCard account={account} />
              </div>
            ))}
        </div>

        {/* Empty State */}
        {accounts.length === 0 && (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-xl">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              No accounts yet
            </h3>
            <p className="max-w-sm mx-auto text-gray-600 dark:text-gray-300">
              Get started by adding your first account to begin tracking your finances
            </p>
          </div>
        )}
      </div>
    </div>
  );
}