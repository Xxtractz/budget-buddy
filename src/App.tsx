import { useState } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Target, Sparkles } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Toaster } from '@/components/ui/sonner';
import { formatCurrency, formatDate, isCurrentMonth } from '@/lib/helpers';
import { Transaction, BudgetCategory, SavingsGoal } from '@/lib/types';
import { sampleTransactions, sampleBudgets, sampleGoals } from '@/lib/sample-data';
import { TransactionForm } from '@/components/transaction-form';
import { BudgetForm } from '@/components/budget-form';
import { GoalForm } from '@/components/goal-form';
import { TransactionList } from '@/components/transaction-list';
import { BudgetManagement } from '@/components/budget-management';
import { GoalManagement } from '@/components/goal-management';
import { toast } from 'sonner';

function Dashboard() {
  const [transactions] = useKV<Transaction[]>('transactions', []);
  const [budgets] = useKV<BudgetCategory[]>('budgets', []);
  const [goals] = useKV<SavingsGoal[]>('goals', []);

  const currentMonthTransactions = transactions.filter(t => isCurrentMonth(t.date));
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  
  // Calculate actual spending from transactions instead of using stored budget.spent
  const totalActualSpent = budgets.reduce((sum, budget) => {
    const categorySpent = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category === budget.name)
      .reduce((categorySum, t) => categorySum + t.amount, 0);
    return sum + categorySpent;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthTransactions.filter(t => t.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthTransactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudget > 0 ? Math.round((totalActualSpent / totalBudget) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalActualSpent)} of {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No budgets set up yet</p>
            ) : (
              budgets.map((budget) => {
                const categorySpent = currentMonthTransactions
                  .filter(t => t.type === 'expense' && t.category === budget.name)
                  .reduce((sum, t) => sum + t.amount, 0);
                const percentage = budget.limit > 0 ? (categorySpent / budget.limit) * 100 : 0;
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{budget.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(categorySpent)} / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    {percentage >= 100 && (
                      <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                    )}
                    {percentage >= 80 && percentage < 100 && (
                      <Badge variant="outline" className="text-xs border-accent text-accent">Near Limit</Badge>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No savings goals yet</p>
            ) : (
              goals.map((goal) => {
                const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Target: {formatDate(goal.deadline)}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function App() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', []);
  const [budgets, setBudgets] = useKV<BudgetCategory[]>('budgets', []);
  const [goals, setGoals] = useKV<SavingsGoal[]>('goals', []);

  const loadSampleData = () => {
    setTransactions(sampleTransactions);
    setBudgets(sampleBudgets);
    setGoals(sampleGoals);
    toast.success('Sample data loaded! Explore the app features.');
  };

  const hasAnyData = transactions.length > 0 || budgets.length > 0 || goals.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 lg:py-6 max-w-7xl">
        <div className="flex flex-col gap-4 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Budget Tracker</h1>
              <p className="text-muted-foreground text-sm lg:text-base">Manage your finances with confidence</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {!hasAnyData && (
              <Button 
                variant="outline" 
                onClick={loadSampleData} 
                className="gap-2 h-12 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Try Sample Data
              </Button>
            )}
            <Button 
              onClick={() => setShowTransactionForm(true)} 
              className="gap-2 h-12 text-sm font-medium bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="dashboard" className="h-12 text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions" className="h-12 text-sm">Transactions</TabsTrigger>
            <TabsTrigger value="budgets" className="h-12 text-sm">Budgets</TabsTrigger>
            <TabsTrigger value="goals" className="h-12 text-sm">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl lg:text-2xl font-bold">Transactions</h2>
                <Button 
                  onClick={() => setShowTransactionForm(true)} 
                  className="gap-2 h-12 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </div>
              <TransactionList />
            </div>
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetManagement />
          </TabsContent>

          <TabsContent value="goals">
            <GoalManagement />
          </TabsContent>
        </Tabs>

        <TransactionForm 
          open={showTransactionForm} 
          onOpenChange={setShowTransactionForm}
        />
        
        <Toaster />
      </div>
    </div>
  );
}

export default App;