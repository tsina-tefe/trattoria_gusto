import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface BranchTableProps {
    data: Array<{
        branch: {
            id: number;
            name: string;
        };
        metrics: {
            total_orders: number;
            total_revenue: number;
            paid_orders: number;
            pending_orders: number;
            collected_orders: number;
        };
    }>;
}

export default function BranchTable({ data }: BranchTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders by Collection Branch</CardTitle>
                <CardDescription>Quantity of orders for each collection branch</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch Name</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={item?.branch?.id || index} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">
                                        {item?.branch?.name || 'Unknown Branch'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="default" className="bg-blue-100 text-blue-800 font-mono">
                                            {item?.metrics?.total_orders?.toLocaleString() || 0}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            
                            {/* Total Row */}
                            <TableRow className="font-semibold bg-gray-100">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="default" className="bg-gray-200 text-gray-800 font-mono">
                                        {data.reduce((sum, item) => sum + (item?.metrics?.total_orders || 0), 0).toLocaleString()}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
