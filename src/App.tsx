import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Target, Sparkles, Menu } from '@phosphor-icons/react';
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <div className={`space-y-4 px-1 transition-all duration-500 ${isVisible ? 'flutter-fade-in' : 'opacity-0'}`}>
      {/* Mobile-optimized dashboard cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="card-elevated hover:card-elevated-hover transition-all duration-200 flutter-tap">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Balance</CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className={`text-lg font-bold transition-colors duration-200 ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover:card-elevated-hover transition-all duration-200 flutter-tap">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Budget Used</CardTitle>
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{totalBudget > 0 ? Math.round((totalActualSpent / totalBudget) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {formatCurrency(totalActualSpent)} spent
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover:card-elevated-hover transition-all duration-200 flutter-tap">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Income</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-primary">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthTransactions.filter(t => t.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover:card-elevated-hover transition-all duration-200 flutter-tap">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Expenses</CardTitle>
            <TrendingDown className="h-3.5 w-3.5 text-accent" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-accent">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthTransactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-optimized sections */}
      <div className="space-y-4">
        <Card className="card-elevated transition-all duration-200">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-base">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {budgets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">No budgets set up yet</p>
            ) : (
              budgets.slice(0, 3).map((budget, index) => {
                const categorySpent = currentMonthTransactions
                  .filter(t => t.type === 'expense' && t.category === budget.name)
                  .reduce((sum, t) => sum + t.amount, 0);
                const percentage = budget.limit > 0 ? (categorySpent / budget.limit) * 100 : 0;
                return (
                  <div 
                    key={budget.id} 
                    className="space-y-2 flutter-fade-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{budget.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(categorySpent)} / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2 transition-all duration-300"
                    />
                    {percentage >= 100 && (
                      <Badge variant="destructive" className="text-xs flutter-bounce">Over Budget</Badge>
                    )}
                    {percentage >= 80 && percentage < 100 && (
                      <Badge variant="outline" className="text-xs border-accent text-accent flutter-bounce">Near Limit</Badge>
                    )}
                  </div>
                );
              })
            )}
            {budgets.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{budgets.length - 3} more budgets
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated transition-all duration-200">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-base">Savings Goals</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {goals.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">No savings goals yet</p>
            ) : (
              goals.slice(0, 2).map((goal, index) => {
                const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return (
                  <div 
                    key={goal.id} 
                    className="space-y-2 flutter-fade-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{goal.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2 transition-all duration-300"
                    />
                    <p className="text-xs text-muted-foreground">
                      Target: {formatDate(goal.deadline)}
                    </p>
                  </div>
                );
              })
            )}
            {goals.length > 2 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{goals.length - 2} more goals
              </p>
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  const loadSampleData = async () => {
    setIsLoading(true);
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    setTransactions(sampleTransactions);
    setBudgets(sampleBudgets);
    setGoals(sampleGoals);
    setIsLoading(false);
    toast.success('Sample data loaded! Explore the app features.');
  };

  const hasAnyData = transactions.length > 0 || budgets.length > 0 || goals.length > 0;

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      <div className="container mx-auto px-3 py-3 max-w-md">
        {/* Mobile header with Flutter-style design */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between items-center flutter-fade-in">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Budget Tracker
              </h1>
              <p className="text-muted-foreground text-sm">Manage your finances</p>
            </div>
          </div>
          
          {/* Mobile action buttons with enhanced styling */}
          <div className="flex gap-2 flutter-fade-in" style={{ animationDelay: '0.1s' }}>
            {!hasAnyData && (
              <Button 
                variant="outline" 
                onClick={loadSampleData} 
                disabled={isLoading}
                className="gap-2 h-11 text-sm font-medium flutter-tap touch-target flex-1 glass border-primary/20 hover:bg-primary/5"
              >
                <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Try Sample Data'}
              </Button>
            )}
            <Button 
              onClick={() => setShowTransactionForm(true)} 
              className="gap-2 h-11 text-sm font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 flutter-tap touch-target flex-1 ripple"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Mobile-optimized tabs with Flutter-style transitions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/30 glass border border-border/50">
            <TabsTrigger 
              value="dashboard" 
              className="h-10 text-xs font-medium flutter-tap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="h-10 text-xs font-medium flutter-tap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              History
            </TabsTrigger>
            <TabsTrigger 
              value="budgets" 
              className="h-10 text-xs font-medium flutter-tap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              Budgets
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className="h-10 text-xs font-medium flutter-tap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <Dashboard />
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <div className="space-y-4 flutter-slide-up">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Transactions</h2>
                <Button 
                  onClick={() => setShowTransactionForm(true)} 
                  size="sm"
                  className="gap-2 h-9 flutter-tap touch-target ripple"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              <TransactionList />
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="mt-4">
            <div className="flutter-slide-up">
              <BudgetManagement />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            <div className="flutter-slide-up">
              <GoalManagement />
            </div>
          </TabsContent>
        </Tabs>

        <TransactionForm 
          open={showTransactionForm} 
          onOpenChange={setShowTransactionForm}
        />
        
        {/* Enhanced Floating Action Button with Flutter-style shadow */}
        <Button
          onClick={() => setShowTransactionForm(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full z-50 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flutter-tap touch-target lg:hidden ripple"
          style={{
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
          }}
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
        
        <Toaster 
          position="top-center"
          toastOptions={{
            className: 'glass border border-border/50',
          }}
        />
      </div>
    </div>
  );
}

export default App;