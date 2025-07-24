import { useState } from 'react';
import { Trash2, Plus, Target, Calendar } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SavingsGoal } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { GoalForm } from '@/components/goal-form';
import { toast } from 'sonner';

interface ContributeDialogProps {
  goal: SavingsGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContribute: (goalId: string, amount: number) => void;
}

function ContributeDialog({ goal, open, onOpenChange, onContribute }: ContributeDialogProps) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    onContribute(goal.id, numAmount);
    setAmount('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add to {goal.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </p>
            <Input
              type="number"
              step="0.01"
              placeholder="Amount to add"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-sm rounded-xl"
              inputMode="decimal"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-11 text-sm font-medium flex-1 rounded-xl mobile-tap"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="h-11 text-sm font-medium flex-1 rounded-xl mobile-tap"
            >
              Add Funds
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GoalManagement() {
  const [goals, setGoals] = useKV<SavingsGoal[]>('goals', []);
  const [showForm, setShowForm] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);

  const handleDelete = (goalId: string) => {
    setGoals((current) => current.filter(g => g.id !== goalId));
    toast.success('Savings goal deleted');
  };

  const handleContribute = (goalId: string, amount: number) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? { ...goal, currentAmount: goal.currentAmount + amount }
          : goal
      )
    );
    toast.success('Contribution added successfully');
  };

  const getDaysRemaining = (deadline: string): number => {
    const today = new Date();
    const target = new Date(deadline);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (goals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Savings Goals</h2>
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
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-base font-medium mb-1">No savings goals yet</h3>
              <p className="mb-4 text-sm">Set goals to stay motivated and track progress.</p>
              <Button onClick={() => setShowForm(true)} className="h-10 text-sm mobile-tap">
                Create Your First Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        <GoalForm open={showForm} onOpenChange={setShowForm} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Savings Goals</h2>
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
        {goals.map((goal) => {
          const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const daysRemaining = getDaysRemaining(goal.deadline);
          const isCompleted = percentage >= 100;
          const isOverdue = daysRemaining < 0 && !isCompleted;
          
          return (
            <Card key={goal.id} className="hover:shadow-md transition-all shadow-sm mobile-tap rounded-xl">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Target className="h-4 w-4 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm truncate">{goal.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setContributeGoal(goal)}
                      className="h-8 w-8 p-0 mobile-tap touch-target"
                      disabled={isCompleted}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive mobile-tap touch-target"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span className="font-medium">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
                
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                
                <div className="flex justify-between items-center text-xs gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground flex-1 min-w-0">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formatDate(goal.deadline)}</span>
                  </div>
                  <div className="flex-shrink-0">
                    {isCompleted && (
                      <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 h-auto">Done!</Badge>
                    )}
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-auto">Overdue</Badge>
                    )}
                    {!isCompleted && !isOverdue && daysRemaining <= 30 && (
                      <Badge variant="outline" className="border-accent text-accent text-xs px-1.5 py-0.5 h-auto">
                        {daysRemaining}d
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {isCompleted ? (
                    <p>🎉 Goal achieved!</p>
                  ) : (
                    <p>
                      {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining 
                      ({Math.round(percentage)}% complete)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <GoalForm open={showForm} onOpenChange={setShowForm} />
      
      {contributeGoal && (
        <ContributeDialog
          goal={contributeGoal}
          open={!!contributeGoal}
          onOpenChange={(open) => !open && setContributeGoal(null)}
          onContribute={handleContribute}
        />
      )}
    </div>
  );
}