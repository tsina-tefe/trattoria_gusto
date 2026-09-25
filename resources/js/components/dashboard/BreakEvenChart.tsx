import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp } from 'lucide-react';

interface BreakEvenChartProps {
  data: Array<{
    orders: number;
    revenue: number;
    fixedCosts: number;
    totalCosts: number;
    profit: number;
    isBreakEven?: boolean;
    isCurrent?: boolean;
  }>;
  breakEvenPoint?: number | null;
  currentOrders: number;
  isProfitable: boolean;
  currency?: string;
}

export default function BreakEvenChart({ data, breakEvenPoint, currentOrders, isProfitable, currency = 'ETB' }: BreakEvenChartProps) {
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${currency}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{`Orders: ${label}`}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-blue-600">Revenue:</span>
              <span className="font-mono">{formatCurrency(payload[0].value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-red-400">Fixed Costs:</span>
              <span className="font-mono">{formatCurrency(payload[1].value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-red-600 font-semibold">Total Costs:</span>
              <span className="font-mono font-semibold">{formatCurrency(payload[2].value)}</span>
            </div>
            <div className="border-t pt-1 mt-1 flex justify-between gap-4">
              <span className={payload[3].value >= 0 ? 'text-green-600' : 'text-red-600'}>Profit:</span>
              <span className={`font-mono font-bold ${payload[3].value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(payload[3].value)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    if (payload?.isBreakEven) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
          <text x={cx} y={cy - 12} fill="#ef4444" fontSize="11" textAnchor="middle" fontWeight="bold">
            BREAK-EVEN
          </text>
        </g>
      );
    }
    
    if (payload?.isCurrent) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
          <text x={cx} y={cy - 12} fill="#3b82f6" fontSize="11" textAnchor="middle" fontWeight="bold">
            CURRENT
          </text>
        </g>
      );
    }
    
    return null;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Break-Even Projection
          <Badge variant={isProfitable ? 'default' : 'destructive'} className="ml-auto">
            {isProfitable ? 'Profitable' : 'Losing Money'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-100%">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
               <XAxis 
                dataKey="orders" 
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Total Order Volume', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Financial Value (ETB)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8', fontWeight: 'bold', offset: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Revenue"
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="fixedCosts" 
                stroke="#ef4444" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                name="Fixed Costs (General)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="totalCosts" 
                stroke="#dc2626" 
                strokeWidth={3}
                name="Total Costs (Fixed + Prod)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Net Profit"
                dot={<CustomDot />}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
