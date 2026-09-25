
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Area,
    AreaChart
} from 'recharts';

interface DashboardChartsProps {
    data: {
        orderType: Array<{ name: string; value: number }>;
        product: Array<{ product_name: string; total_quantity: number; total_revenue: number }>;
        collectionDay: Array<{ collection_day: { name: string }; metrics: { total_orders: number } }>;
    };
    funnelData: Array<{ name: string; value: number; fill: string }>;
    orderingTimeData: Array<{ hour: string; count: number }>;
    productTrend: {
        products: string[];
        data: any[];
    };
}



// Very Light Pastel Color Palette - Matching Summary Cards bg-*-50 aesthetic
const COLORS = [
    '#93C5FD', // Very Light Blue (blue-300)
    '#6EE7B7', // Very Light Emerald (emerald-300)
    '#C4B5FD', // Very Light Purple (violet-300)
    '#F9A8D4', // Very Light Pink (pink-300)
    '#FCD34D', // Very Light Amber (amber-300)
    '#7DD3FC', // Very Light Sky Blue (sky-300)
    '#86EFAC', // Very Light Green (green-300)
    '#FDBA74', // Very Light Orange (orange-300)
    '#A5B4FC', // Very Light Indigo (indigo-300)
    '#5EEAD4', // Very Light Teal (teal-300)
];

const BRAND_COLOR = '#93C5FD'; // Very Light Blue for Products chart
const SECONDARY_COLOR = '#6EE7B7'; // Very Light Emerald for Collection Day chart

// Sub-components for Tabbed Layout



export function FunnelChartCard({ funnelData }: { funnelData: DashboardChartsProps['funnelData'] }) {
    // Calculate max value across all stages to ensure scaling is always safe (even if unsorted)
    const maxValue = Math.max(...funnelData.map(d => d.value), 1);

    const stageHeight = 62;
    const gap = 8;
    const baseWidth = 240; // Narrower funnel profile
    const svgWidth = 340;  // Extra padding for glow and labels
    const xOffset = (svgWidth - baseWidth) / 2;
    const stages = funnelData.map((stage, i) => {
        const topRatio = stage.value / maxValue;
        const nextVal = funnelData[i + 1]?.value ?? stage.value;
        const botRatio = i === funnelData.length - 1
            ? topRatio * 0.82
            : nextVal / maxValue;

        const w1 = Math.max(80, topRatio * baseWidth);
        const w2 = Math.max(60, botRatio * baseWidth);

        const x1 = (baseWidth - w1) / 2;
        const x2 = x1 + w1;
        const x3 = (baseWidth - w2) / 2 + w2;
        const x4 = (baseWidth - w2) / 2;

        const y1 = 0;
        const y2 = stageHeight;

        const d = `
            M ${x1} ${y1}
            L ${x2} ${y1}
            L ${x3} ${y2}
            L ${x4} ${y2}
            Z
        `;

        const dropRate = i === 0 ? null : (stage.value / (funnelData[i - 1].value || 1)) * 100;
        return { ...stage, d, dropRate };
    });

    const gradients = [
        ['#60A5FA', '#3B82F6'],
        ['#34D399', '#10B981'],
        ['#A78BFA', '#8B5CF6'],
        ['#FBBF24', '#F59E0B'],
    ];

    return (
        <Card className="flex flex-col h-full overflow-hidden shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl">Conversion Funnel</CardTitle>
                <CardDescription>Step-by-step conversion journey</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-6 pt-0 pb-4">
                {/* SVG Funnel - Centered with Padding */}
                <div className="flex flex-col items-center justify-center">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${funnelData.length * (stageHeight + gap)}`}
                        className="w-full max-w-[340px] overflow-visible"
                    >
                        <defs>
                            {gradients.map(([from, to], i) => (
                                <linearGradient key={`g-${i}`} id={`funnel-grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={from} />
                                    <stop offset="100%" stopColor={to} />
                                </linearGradient>
                            ))}
                            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        <g transform={`translate(${xOffset}, 0)`}>
                            {stages.map((stage, i) => {
                                const [from] = gradients[i % gradients.length];
                                const yOffset = i * (stageHeight + gap);
                                return (
                                    <g key={stage.name} transform={`translate(0, ${yOffset})`} className="group">
                                        {/* Hover Glow Background */}
                                        <path
                                            d={stage.d}
                                            fill={from}
                                            className="opacity-0 group-hover:opacity-30 transition-all duration-300 pointer-events-none"
                                            filter="url(#glow)"
                                        />

                                        {/* Main Shape */}
                                        <path
                                            d={stage.d}
                                            fill={`url(#funnel-grad-${i % gradients.length})`}
                                            className="cursor-default transition-all duration-300 group-hover:brightness-110 drop-shadow-md"
                                        />

                                        {/* Value Label */}
                                        <text
                                            x={baseWidth / 2}
                                            y={stageHeight / 2 + 5}
                                            textAnchor="middle"
                                            fill="white"
                                            className="text-sm font-bold pointer-events-none select-none drop-shadow-sm"
                                        >
                                            {stage.value.toLocaleString()}
                                        </text>

                                        {/* Retention Label between stages */}
                                        {i > 0 && stage.dropRate !== null && (
                                            <g transform={`translate(${baseWidth / 2}, ${-gap / 2})`}>
                                                <rect x="-35" y="-8" width="70" height="16" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
                                                <text
                                                    y="3.5"
                                                    textAnchor="middle"
                                                    fill="#6B7280"
                                                    className="text-[9px] font-bold uppercase tracking-tight"
                                                >
                                                    {stage.dropRate.toFixed(0)}% retained
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                {/* legend Pills */}
                <div className="grid grid-cols-2 gap-2 px-1">
                    {stages.map((stage, i) => {
                        const [from] = gradients[i % gradients.length];
                        const overallPct = ((stage.value / maxValue) * 100).toFixed(0);
                        return (
                            <div
                                key={stage.name}
                                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 border transition-colors hover:bg-white"
                                style={{
                                    background: `${from}08`,
                                    borderColor: `${from}22`,
                                }}
                            >
                                <div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{
                                        backgroundColor: from,
                                        boxShadow: `0 0 8px ${from}aa`,
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-bold text-gray-700 truncate leading-tight">
                                        {stage.name}
                                    </p>
                                    <div className="flex items-center justify-between gap-1 mt-0.5">
                                        <p className="text-[11px] text-gray-500 font-medium">
                                            {stage.value.toLocaleString()}
                                        </p>
                                        <span
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: `${from}20`, color: from }}
                                        >
                                            {overallPct}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}


export function OrderingTimeCard({ orderingTimeData }: { orderingTimeData: DashboardChartsProps['orderingTimeData'] }) {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-xl">Ordering Volume Trend</CardTitle>
                <CardDescription>Busiest hours for customer outreach</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orderingTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <YAxis hide />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="count" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCount)" name="Leads" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default function DashboardCharts({ data, funnelData, orderingTimeData, productTrend }: DashboardChartsProps) {
    const collectionDayData = data.collectionDay.map(day => ({
        name: day.collection_day.name,
        orders: day.metrics.total_orders,
    }));
    const platformTotal = data.orderType.reduce((sum, item) => sum + item.value, 0);
    const collectionTotal = collectionDayData.reduce((sum, item) => sum + item.orders, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


            {/* Platform Distribution */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                    <CardDescription>Breakdown by platform (SMS, Telegram, etc.)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data.orderType}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category"
                                tick={{ fontSize: 12, fill: '#6B7280' }} 
                                axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                                tickLine={false}
                                width={80}
                            />

                            <Tooltip 
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="value"
                                name="Orders"
                                radius={[0, 4, 4, 0]}
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {data.orderType.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList 
                                    dataKey="value" 
                                    position="right" 
                                    fill="#666" 
                                    fontSize={11} 
                                    fontWeight="bold" 
                                    formatter={(val: any) => {
                                        if (platformTotal === 0) return val;
                                        const percent = ((val / platformTotal) * 100).toFixed(0);
                                        return `${val} (${percent}%)`;
                                    }}
                                />

                            </Bar>
                        </BarChart>


                    </ResponsiveContainer>
                </CardContent>
            </Card>


            {/* Top Products */}
            <Card className="flex flex-col md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>By total quantity sold</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data.product.slice(0, 10)} // Top 10
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="product_name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                                tickLine={false}
                            />

                            <Tooltip
                                formatter={(value: any, name: any) => [value, name === 'total_quantity' ? 'Quantity' : name]}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Bar
                                dataKey="total_quantity"
                                fill={BRAND_COLOR}
                                name="Quantity"
                                radius={[0, 4, 4, 0]}
                                style={{ cursor: 'pointer' }}
                                animationBegin={0}
                                animationDuration={800}
                            >
                                <LabelList dataKey="total_quantity" position="right" fill="#1E40AF" fontSize={12} fontWeight="bold" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Collection Day Volume */}
            <Card className="flex flex-col md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Collection Day</CardTitle>
                    <CardDescription>Orders by collection day</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={collectionDayData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12, fill: '#6B7280' }} 
                                axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                                tickLine={false}
                            />
                            <YAxis hide />

                            <Tooltip />
                            <Bar
                                dataKey="orders"
                                fill={SECONDARY_COLOR}
                                name="Orders"
                                radius={[4, 4, 0, 0]}
                                style={{ cursor: 'pointer' }}
                                animationBegin={0}
                                animationDuration={800}
                            >
                                <LabelList 
                                    dataKey="orders" 
                                    position="top" 
                                    fill="#065F46" 
                                    fontSize={11} 
                                    fontWeight="bold" 
                                    formatter={(val: any) => {
                                        if (collectionTotal === 0) return val;
                                        const percent = ((val / collectionTotal) * 100).toFixed(0);
                                        return `${val} (${percent}%)`;
                                    }}
                                />

                            </Bar>
                        </BarChart>

                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        {/* Product Trend Grouped Column Chart */}
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Product Performance vs Ordered Date</CardTitle>
                <CardDescription>Order quantity by product over the last 14 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={productTrend.data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickLine={false}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        {productTrend.products.map((product, index) => (
                            <Bar 
                                key={product} 
                                dataKey={product} 
                                fill={COLORS[index % COLORS.length]} 
                                radius={[4, 4, 0, 0]} 
                                name={product}
                                animationDuration={1000}
                                animationBegin={index * 100}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>

    );
}
