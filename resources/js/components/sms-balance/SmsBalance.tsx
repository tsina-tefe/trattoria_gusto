import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';
import { router } from '@inertiajs/react';

interface BalanceData {
    error: false;
    data: {
        balance: {
            error: false;
            total_amount: number;
            total_sms: number;
        };
    };
}

interface SmsBalanceProps {
    balance: BalanceData | null;
    lastUpdated: string;
}

export default function SmsBalance({ balance: initialBalance, lastUpdated: initialLastUpdated }: SmsBalanceProps) {
    const [balance, setBalance] = useState<BalanceData | null>(initialBalance);
    const [lastUpdated, setLastUpdated] = useState(initialLastUpdated);
    const [isLoading, setIsLoading] = useState(false);

    const refreshBalance = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/sms-balance/api', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setBalance(data.balance);
                setLastUpdated(data.lastUpdated);
            } else {
                console.error('Failed to fetch balance');
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!balance) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        SMS Balance
                    </CardTitle>
                    <CardDescription>
                        Unable to fetch SMS balance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={refreshBalance} disabled={isLoading}>
                        {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Refresh
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const { total_amount, total_sms } = balance.data.balance;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        SMS Balance
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                    </CardDescription>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshBalance} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {/* SMS Count */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Available SMS</span>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3 py-1">
                                {total_sms.toLocaleString()}
                            </Badge>
                        </div>
                    </div>

                    {/* ETB Balance */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">ETB Balance</span>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3 py-1">
                                ETB {total_amount.toLocaleString()}
                            </Badge>
                        </div>
                    </div>

                    {/* Cost per SMS - Fixed at ETB 0.60 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Avg Cost per SMS</span>
                            </div>
                            <Badge variant="outline" className="px-3 py-1 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100">
                                ETB 0.60
                            </Badge>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="pt-2 border-t">
                        <Badge className="w-full justify-center" variant={total_sms > 100 ? 'default' : 'destructive'}>
                            {total_sms > 100 ? '✅ Healthy Balance' : '⚠️ Low Balance'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
