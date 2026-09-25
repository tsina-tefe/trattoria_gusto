import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StackedBarChartProps {
    data: Array<{
        name: string;
        quantity: number;
        totalAmount: number;
    }>;
    title: string;
    subtitle?: string;
}

export default function StackedBarChart({ data, title, subtitle }: StackedBarChartProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ET', {
            style: 'currency',
            currency: 'ETB',
        }).format(amount);
    };

    // Transform data for proper stacked bar chart
    // We'll show quantity as a bar and total amount as a separate bar (side by side)
    const transformedData = data.map(item => ({
        name: item.name,
        quantity: item.quantity,
        amount: item.totalAmount,
    }));

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transformedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border rounded shadow-lg">
                                        <p className="font-semibold">{data.name}</p>
                                        <p className="text-blue-600">
                                            Quantity: {data.quantity.toLocaleString()}
                                        </p>
                                        <p className="text-green-600">
                                            Amount: {formatCurrency(data.amount)}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="quantity" fill="#3b82f6" name="Quantity" />
                    <Bar yAxisId="right" dataKey="amount" fill="#10b981" name="Total Amount" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
