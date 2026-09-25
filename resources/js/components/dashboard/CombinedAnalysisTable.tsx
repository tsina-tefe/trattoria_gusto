import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface CombinedAnalysisTableProps {
    data: Array<{
        branch: string;
        product: string;
        collectionDay: string;
        quantity: number;
        totalAmount: number;
    }>;
}

export default function CombinedAnalysisTable({ data }: CombinedAnalysisTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ET', {
            style: 'currency',
            currency: 'ETB',
        }).format(amount);
    };

    // Filter out empty rows to show only meaningful data
    const filteredData = data.filter(row => 
        (row.branch && row.branch.trim() !== '') || 
        (row.product && row.product.trim() !== '') || 
        (row.collectionDay && row.collectionDay.trim() !== '')
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Combined Analysis Matrix</CardTitle>
                <CardDescription>Analysis across branches, products, and collection days showing quantities and totals</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Collection Day</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((row, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">
                                        {row.branch && row.branch.trim() !== '' ? (
                                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                {row.branch}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.product && row.product.trim() !== '' ? (
                                            <Badge variant="secondary">
                                                {row.product}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.collectionDay && row.collectionDay.trim() !== '' ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                                {row.collectionDay}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="font-mono">
                                            {row.quantity.toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatCurrency(row.totalAmount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            
                            {/* Total Row */}
                            <TableRow className="font-semibold bg-gray-100">
                                <TableCell colSpan={3}>Grand Total</TableCell>
                                <TableCell className="text-right">
                                    {filteredData.reduce((sum, row) => sum + row.quantity, 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(filteredData.reduce((sum, row) => sum + row.totalAmount, 0))}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
