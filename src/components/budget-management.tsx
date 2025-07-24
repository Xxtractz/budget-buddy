import { useState } from 'react';
import { Trash2, Plus } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BudgetCategory, Transaction } from '@/lib/types';
import { formatCurrency, isCurrentMonth } from '@/lib/helpers';
import { BudgetForm } from '@/components/budget-form';
import { toast } from 'sonner';

export function BudgetManagement() {
  const [budgets, setBudgets] = useKV<BudgetCategory[]>('budgets', []);
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', []);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = (budgetId: string) => {
    setBudgets((current) => current.filter(b => b.id !== budgetId));
    toast.success('Budget category deleted');
  };

  // Calculate actual spending from transactions
  const getActualSpending = (categoryName: string) => {
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === categoryName && 
        isCurrentMonth(t.date)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (budgets.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Budget Categories</h2>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Budget
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No budgets set up yet</h3>
              <p className="mb-4">Create budget categories to track your spending limits.</p>
              <Button onClick={() => setShowForm(true)}>Create Your First Budget</Button>
            </div>
          </CardContent>
        </Card>

        <BudgetForm open={showForm} onOpenChange={setShowForm} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Categories</h2>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => {
          const actualSpent = getActualSpending(budget.name);
          const percentage = budget.limit > 0 ? (actualSpent / budget.limit) * 100 : 0;
          
          return (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Spent this month</span>
                  <span className="font-medium">
                    {formatCurrency(actualSpent)} / {formatCurrency(budget.limit)}
                  </span>
                </div>
                
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(budget.limit - actualSpent)} remaining
                  </span>
                  {percentage >= 100 && (
                    <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                  )}
                  {percentage >= 80 && percentage < 100 && (
                    <Badge variant="outline" className="text-xs border-accent text-accent">
                      Near Limit
                    </Badge>
                  )}
                  {percentage < 50 && (
                    <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
                      On Track
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BudgetForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}