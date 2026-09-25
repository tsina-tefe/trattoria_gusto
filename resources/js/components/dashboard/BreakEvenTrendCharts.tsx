import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Label as RechartsLabel
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart, Calendar, Target } from 'lucide-react';

interface TrendData {
  date: string;
  cumulative_orders: number;
  cumulative_quantity: number;
  cumulative_contribution: number;
  avg_contribution: number;
}

interface BreakEvenTrendChartsProps {
  data: TrendData[];
  fixedCosts: number;
  breakEvenOrders: number | null;
  currency?: string;
}

export default function BreakEvenTrendCharts({ data, fixedCosts, breakEvenOrders, currency = 'ETB' }: BreakEvenTrendChartsProps) {
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!data || data.length === 0) return null;

  // Find the date where we hit break-even
  const breakEvenPoint = data.find(d => d.cumulative_contribution >= fixedCosts);
  const breakEvenDate = breakEvenPoint?.date;
  const breakEvenQty = breakEvenPoint?.cumulative_quantity;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: Average Contribution Trend */}
      <Card className="border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            Profitability Trend
          </CardTitle>
          <Badge variant="outline" className="text-[8px] font-bold uppercase py-0 px-1 text-blue-600 border-blue-100 bg-blue-50">
            Avg Contribution / Order
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Order Timeline', position: 'insideBottom', offset: -10, fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }}
                />
                <YAxis 
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Avg Contribution (ETB)', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#94a3b8', fontWeight: 'bold', offset: 10 }}
                />
                <Tooltip 
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Avg Contribution']}
                  labelFormatter={formatDate}
                />
                <Line 
                  type="monotone" 
                  dataKey="avg_contribution" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#3b82f6' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#3b82f6' }}
                />
                {breakEvenDate && (
                  <ReferenceLine 
                    x={breakEvenDate} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3" 
                    label={{ value: 'BEP Reached', position: 'insideTopLeft', fill: '#ef4444', fontSize: 8, fontWeight: 'bold' }} 
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
            Tracking the efficiency of each order over the holiday period.
          </p>
        </CardContent>
      </Card>

      {/* Chart 2: Cumulative Contribution vs. Quantity */}
      <Card className="border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Target className="w-3 h-3 text-emerald-500" />
            Break-Even Velocity
          </CardTitle>
          <Badge variant="outline" className="text-[8px] font-bold uppercase py-0 px-1 text-emerald-600 border-emerald-100 bg-emerald-50">
            Contribution vs Volume
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorContribution" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="cumulative_quantity" 
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Total Units Sold', position: 'insideBottom', offset: -10, fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }}
                />
                <YAxis 
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Total Cash Contribution (ETB)', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#94a3b8', fontWeight: 'bold', offset: 10 }}
                />
                <Tooltip 
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Total Contribution']}
                  labelFormatter={(value) => `Units Sold: ${value}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative_contribution" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorContribution)" 
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#10b981' }}
                />
                {/* Horizontal Fixed Cost Line */}
                <ReferenceLine 
                    y={fixedCosts} 
                    stroke="#ef4444" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5" 
                >
                    <RechartsLabel value="FIXED COSTS" position="insideTopRight" fill="#ef4444" fontSize={8} fontWeight="bold" offset={10} />
                </ReferenceLine>

                {/* Vertical Break-Even Intersection */}
                {breakEvenQty && (
                   <ReferenceLine 
                        x={breakEvenQty} 
                        stroke="#ef4444" 
                        strokeDasharray="3 3" 
                        label={{ value: 'BEP Units', position: 'insideBottomRight', fill: '#ef4444', fontSize: 8, fontWeight: 'bold' }} 
                    />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
            Tracking how quickly product volume generates the cash to cover fixed costs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
