import { useState } from 'react';
import { Trash2, Edit3, TrendingUp, TrendingDown } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="card-elevated">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-50" />
              </motion.div>
              <h3 className="text-base font-medium mb-1">No transactions yet</h3>
              <p className="text-sm">Add your first transaction to get started.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex gap-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 text-sm rounded-xl flex-1 glass border-border/50"
        />
        <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <SelectTrigger className="h-11 text-sm rounded-xl w-32 glass border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl glass border border-border/50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <AnimatePresence mode="popLayout">
        <motion.div className="space-y-2">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ 
                duration: 0.2, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              layout
              whileTap={{ scale: 0.98 }}
            >
              <Card className="hover:card-elevated-hover transition-all duration-200 card-elevated flutter-tap rounded-xl border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-accent flex-shrink-0" />
                          )}
                        </motion.div>
                        <motion.div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getCategoryColor(transaction) }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.15, type: "spring" }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm line-clamp-1">{transaction.category}</span>
                          <Badge 
                            variant={transaction.type === 'income' ? 'default' : 'secondary'} 
                            className="text-xs px-1.5 py-0.5 h-auto"
                          >
                            {transaction.type === 'income' ? 'IN' : 'OUT'}
                          </Badge>
                        </div>
                        {transaction.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <motion.span 
                          className={`font-semibold text-sm ${
                            transaction.type === 'income' ? 'text-primary' : 'text-accent'
                          }`}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </motion.span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flutter-tap touch-target"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredTransactions.length === 0 && (search || filter !== 'all') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="card-elevated">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No transactions match your filters.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}