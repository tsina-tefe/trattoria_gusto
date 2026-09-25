import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, TrendingUp, Users } from 'lucide-react';

interface BreakEvenQuickStatsProps {
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
    costBreakdown: {
      sms: number;
      operator: number;
      influencer: number;
      other: number;
    };
  };
  currency?: string;
}

export default function BreakEvenQuickStats({ summary, currency = 'ETB' }: BreakEvenQuickStatsProps) {
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${currency}`;
  };

  const contributionMargin = summary.avgRevenuePerOrder - summary.avgProductCostPerOrder;
  const marginPercentage = summary.avgRevenuePerOrder > 0 ? (contributionMargin / summary.avgRevenuePerOrder) * 100 : 0;
  const isUnreachable = summary.isUnreachable || contributionMargin <= 0;

  return (
    <div className="space-y-4">
      {isUnreachable && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <Target className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Critical: Unreachable Break-Even</p>
              <p className="text-xs">Your average product cost ({formatCurrency(summary.avgProductCostPerOrder)}) is higher than your average revenue per order ({formatCurrency(summary.avgRevenuePerOrder)}). You are losing money on every sale.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Current Status</div>
                <div className={`text-lg font-bold ${summary.isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.isProfitable ? 'Profitable' : 'Not Profitable'}
                </div>
              </div>
              <Badge variant={summary.isProfitable ? 'default' : 'destructive'}>
                {summary.isProfitable ? '✓' : '✗'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress to Break-Even */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Progress to Break-Even</div>
              <div className="text-2xl font-bold text-primary">
                {isUnreachable ? (
                  <span className="text-destructive">Unreachable</span>
                ) : (
                  `${summary.currentOrders} / ${summary.breakEvenOrders}`
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {isUnreachable ? 'Price is below cost' : `${summary.ordersToBreakEven} orders to go`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribution Margin */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Contribution Margin</div>
              <div className={`text-2xl font-bold ${contributionMargin > 0 ? 'text-blue-600' : 'text-destructive'}`}>
                {marginPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(contributionMargin)} per order
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Needed */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Orders Needed</div>
              <div className="text-2xl font-bold text-purple-600">
                {isUnreachable ? 'N/A' : summary.breakEvenOrders}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isUnreachable ? 'Requires price adjustment' : 'to reach break-even'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
