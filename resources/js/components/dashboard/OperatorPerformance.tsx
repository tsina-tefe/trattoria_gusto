import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface OperatorPerformanceProps {
    data: Array<{
        name: string;
        branch: string;
    leads: number;
    orders: number;
    items: number;
    revenue: number;
    conversion_rate: number;
}>;
}

export default function OperatorPerformance({ data }: OperatorPerformanceProps) {
const [selectedBranch, setSelectedBranch] = React.useState<string>("all");

if (!data || data.length === 0) {
    return null;
}

// Get unique branches for the filter
const uniqueBranches = Array.from(new Set(data.map(op => op.branch))).sort();

const filteredData = selectedBranch === "all" 
    ? data 
    : data.filter(op => op.branch === selectedBranch);

return (
    <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div className="space-y-1">
                <CardTitle>Operator Performance</CardTitle>
                <CardDescription>Metrics for order creators and their conversion activity</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by Branch:</span>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {uniqueBranches.map(branch => (
                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-bold">Operator Name</TableHead>
                            <TableHead className="font-bold">Branch</TableHead>
                            <TableHead className="text-center font-bold">Leads / Orders</TableHead>
                            <TableHead className="text-center font-bold">Items Sold</TableHead>
                            <TableHead className="text-center font-bold">Revenue</TableHead>
                            <TableHead className="text-center font-bold">Conversion Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((operator, index) => (
                            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium">
                                    {operator.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{operator.branch}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-blue-700">{operator.leads.toLocaleString()}</span>
                                        <span className="text-[10px] text-muted-foreground">({operator.orders.toLocaleString()} orders)</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-bold text-indigo-700">
                                    {operator.items.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center text-emerald-600 font-medium">
                                    {operator.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={operator.conversion_rate > 50 ? "default" : "secondary"} className="font-bold">
                                        {operator.conversion_rate}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No operators found for this branch.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

