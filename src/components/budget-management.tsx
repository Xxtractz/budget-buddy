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
          <h2 className="text-lg font-bold">Budget Categories</h2>
          <Button 
            onClick={() => setShowForm(true)} 
            size="sm"
            className="gap-2 h-9 mobile-tap touch-target"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-base font-medium mb-1">No budgets set up yet</h3>
              <p className="mb-4 text-sm">Create budget categories to track spending.</p>
              <Button onClick={() => setShowForm(true)} className="h-10 text-sm mobile-tap">
                Create Your First Budget
              </Button>
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
        <h2 className="text-lg font-bold">Budget Categories</h2>
        <Button 
          onClick={() => setShowForm(true)} 
          size="sm"
          className="gap-2 h-9 mobile-tap touch-target"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        {budgets.map((budget) => {
          const actualSpent = getActualSpending(budget.name);
          const percentage = budget.limit > 0 ? (actualSpent / budget.limit) * 100 : 0;
          
          return (
            <Card key={budget.id} className="hover:shadow-md transition-all shadow-sm mobile-tap rounded-xl">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: budget.color }}
                    />
                    <CardTitle className="text-sm truncate">{budget.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(budget.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0 mobile-tap touch-target"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                <div className="flex justify-between text-xs">
                  <span>Spent this month</span>
                  <span className="font-medium">
                    {formatCurrency(actualSpent)} / {formatCurrency(budget.limit)}
                  </span>
                </div>
                
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs text-muted-foreground flex-1 truncate">
                    {formatCurrency(budget.limit - actualSpent)} remaining
                  </span>
                  <div className="flex-shrink-0">
                    {percentage >= 100 && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-auto">Over Budget</Badge>
                    )}
                    {percentage >= 80 && percentage < 100 && (
                      <Badge variant="outline" className="text-xs border-accent text-accent px-1.5 py-0.5 h-auto">
                        Near Limit
                      </Badge>
                    )}
                    {percentage < 50 && (
                      <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20 px-1.5 py-0.5 h-auto">
                        On Track
                      </Badge>
                    )}
                  </div>
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