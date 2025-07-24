import { useState } from 'react';
import { Trash2, Edit3, TrendingUp, TrendingDown } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { toast } from 'sonner';

export function TransactionList() {
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', []);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = search === '' || 
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (transactionId: string) => {
    setTransactions((current) => current.filter(t => t.id !== transactionId));
    toast.success('Transaction deleted');
  };

  const getCategoryColor = (transaction: Transaction) => {
    const categories = transaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return categories.find(c => c.name === transaction.category)?.color || '#6b7280';
  };

  if (transactions.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-8 lg:p-12 text-center">
          <div className="text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
            <p className="text-sm lg:text-base">Add your first transaction to get started tracking your finances.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 text-base"
        />
        <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mt-1">
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-accent flex-shrink-0" />
                    )}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(transaction) }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <span className="font-medium text-base">{transaction.category}</span>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="text-xs w-fit">
                        {transaction.type}
                      </Badge>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`font-semibold text-lg ${
                    transaction.type === 'income' ? 'text-primary' : 'text-accent'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(transaction.id)}
                    className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (search || filter !== 'all') && (
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No transactions match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}