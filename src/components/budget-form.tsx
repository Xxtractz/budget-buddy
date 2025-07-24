import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BudgetCategory, EXPENSE_CATEGORIES } from '@/lib/types';
import { generateId } from '@/lib/helpers';
import { toast } from 'sonner';

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BudgetForm({ open, onOpenChange }: BudgetFormProps) {
  const [budgets, setBudgets] = useKV<BudgetCategory[]>('budgets', []);
  
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');

  const resetForm = () => {
    setName('');
    setLimit('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !limit) {
      toast.error('Please fill in all required fields');
      return;
    }

    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      toast.error('Please enter a valid limit amount');
      return;
    }

    // Check if budget already exists
    if (budgets.some(b => b.name === name)) {
      toast.error('Budget category already exists');
      return;
    }

    const categoryColor = EXPENSE_CATEGORIES.find(c => c.name === name)?.color || '#6b7280';

    const newBudget: BudgetCategory = {
      id: generateId(),
      name,
      limit: numLimit,
      color: categoryColor,
      spent: 0, // This field is no longer used but kept for type compatibility
    };

    setBudgets((current) => [...current, newBudget]);
    toast.success('Budget category created successfully');
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Budget Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Food & Dining"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Monthly Limit *</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Budget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}