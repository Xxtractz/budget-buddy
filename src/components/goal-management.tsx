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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to {goal.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current progress: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </p>
            <Input
              type="number"
              step="0.01"
              placeholder="Amount to add"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
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
          <h2 className="text-2xl font-bold">Savings Goals</h2>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No savings goals yet</h3>
              <p className="mb-4">Set financial goals to stay motivated and track your progress.</p>
              <Button onClick={() => setShowForm(true)}>Create Your First Goal</Button>
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
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const daysRemaining = getDaysRemaining(goal.deadline);
          const isCompleted = percentage >= 100;
          const isOverdue = daysRemaining < 0 && !isCompleted;
          
          return (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setContributeGoal(goal)}
                      className="h-8 w-8 p-0"
                      disabled={isCompleted}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
                
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(goal.deadline)}</span>
                  </div>
                  {isCompleted && (
                    <Badge className="bg-primary text-primary-foreground">Completed!</Badge>
                  )}
                  {isOverdue && (
                    <Badge variant="destructive">Overdue</Badge>
                  )}
                  {!isCompleted && !isOverdue && daysRemaining <= 30 && (
                    <Badge variant="outline" className="border-accent text-accent">
                      {daysRemaining} days left
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {isCompleted ? (
                    <p>🎉 Congratulations! You've reached your goal!</p>
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