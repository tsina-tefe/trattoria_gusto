import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Users, Target, AlertCircle } from 'lucide-react';

interface BreakEvenSummaryProps {
  summary: {
    fixedCosts: number;
    variableCosts: number;
    revenue: number;
    profit: number;
    breakEvenOrders: number | null;
    currentOrders: number;
    ordersToBreakEven: number | null;
    isProfitable: boolean;
    isUnreachable?: boolean;
    avgRevenuePerOrder: number;
    avgProductCostPerOrder: number;
    costBreakdown: Record<string, number>;
    progressToGoal?: number;
    isProfitZone?: boolean;
  };
  currency?: string;
}

const COLORS = [
    'bg-blue-500', 
    'bg-emerald-500', 
    'bg-indigo-500', 
    'bg-purple-500', 
    'bg-sky-500', 
    'bg-teal-500', 
];

export default function BreakEvenSummary({ summary, currency = 'ETB' }: BreakEvenSummaryProps) {
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${currency}`;
  };

  const isUnreachable = summary.isUnreachable || (summary.avgRevenuePerOrder <= summary.avgProductCostPerOrder && summary.avgRevenuePerOrder > 0);
  const isProfitZone = summary.isProfitZone || (summary.currentOrders >= (summary.breakEvenOrders ?? Infinity));
  
  const progressPercentage = !isUnreachable && summary.breakEvenOrders && summary.breakEvenOrders > 0 
    ? Math.min((summary.currentOrders / summary.breakEvenOrders) * 100, 100)
    : 0;

  // Dynamically generate cost categories for display
  const fixedCategories = Object.entries(summary.costBreakdown || {})
    .filter(([_, amount]) => amount > 0)
    .map(([name, amount], index) => ({
        name,
        amount,
        icon: DollarSign,
        color: COLORS[index % COLORS.length]
    }));

  const costCategories = [
    ...fixedCategories,
    { name: 'Variable Product Costs', amount: summary.variableCosts, icon: Target, color: 'bg-orange-500' },
  ].filter(cat => cat.amount > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
      
      {/* Logic Center (Expanded to 5 columns) */}
      <Card className="lg:col-span-5 border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Target className="w-3 h-3 text-blue-500" />
            Financial Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Contribution/Order</p>
                <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-black ${summary.avgRevenuePerOrder > summary.avgProductCostPerOrder ? 'text-slate-900' : 'text-destructive'}`}>
                          {formatCurrency(summary.avgRevenuePerOrder - summary.avgProductCostPerOrder)}
                      </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Health Status</p>
                <Badge variant={isProfitZone ? "secondary" : "outline"} className={`text-[10px] uppercase font-black ${isProfitZone ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'text-slate-400'}`}>
                    {isProfitZone ? 'Profit Zone' : `${summary.ordersToBreakEven ?? 0} To Go`}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Avg Revenue per Order</span>
                    <span className="font-black text-slate-700">{formatCurrency(summary.avgRevenuePerOrder)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-red-600">
                    <span className="font-medium">Avg Production Cost</span>
                    <span className="font-black">-{formatCurrency(summary.avgProductCostPerOrder)}</span>
                </div>
                <div className="pt-2">
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="font-bold text-muted-foreground uppercase opacity-70 tracking-tight">Net Margin Efficiency</span>
                        <span className="font-black text-blue-600">{(summary.avgRevenuePerOrder > 0 ? ( ( (summary.avgRevenuePerOrder - summary.avgProductCostPerOrder) / summary.avgRevenuePerOrder ) * 100).toFixed(1) : 0)}%</span>
                    </div>
                    <Progress value={(summary.avgRevenuePerOrder > 0 ? ( (summary.avgRevenuePerOrder - summary.avgProductCostPerOrder) / summary.avgRevenuePerOrder ) * 100 : 0)} className="h-1 bg-slate-50" />
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Dynamic Distribution (Expanded to 7 columns) */}
      <Card className="lg:col-span-7 border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Expense Breakdown & Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {costCategories.map((category) => (
              <div key={category.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${category.color}`}></div>
                    <span className="text-[11px] font-bold text-slate-600 truncate">{category.name}</span>
                  </div>
                  <span className="text-[11px] font-black">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
                <div className="h-0.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${category.color} transition-all duration-1000`} 
                        style={{ width: `${((summary.fixedCosts + summary.variableCosts) > 0 ? (category.amount / (summary.fixedCosts + summary.variableCosts)) * 100 : 0)}%` }}
                    />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-4 border-t flex items-center justify-between gap-8">
            <div className="flex-1">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-70">General Expenditures</div>
              <div className="text-lg font-black text-slate-800">{formatCurrency(summary.fixedCosts)}</div>
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <div className="flex-1 text-center">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-70">Unit Production</div>
              <div className="text-lg font-black text-orange-600">{formatCurrency(summary.variableCosts)}</div>
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <div className="flex-1 text-right">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-70">Total Campaign Cost</div>
              <div className="text-lg font-black text-red-600">{formatCurrency(summary.fixedCosts + summary.variableCosts)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
