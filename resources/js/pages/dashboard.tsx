import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Dashboard',
		href: '/dashboard',
	},
];

export default function Dashboard() {
	const { auth } = usePage().props as any;
	const userName = auth?.user?.name || 'User';

	const currentHour = new Date().getHours();
	let greeting = 'Good Evening';
	if (currentHour < 12) greeting = 'Good Morning';
	else if (currentHour < 18) greeting = 'Good Afternoon';

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Dashboard" />
			<div className="space-y-8">
				{/* Welcome Section with Coffee Cup */}
				<div className="relative w-full overflow-hidden">
					<div className="relative z-10 p-12 md:p-16">
						<div className="flex flex-col items-center space-y-8 text-center">
							{/* Greeting */}
							<div className="space-y-4">
								<h1 className="text-4xl font-bold text-amber-900 md:text-5xl lg:text-6xl dark:text-amber-100">
									{greeting}, {userName}!
								</h1>
								<p className="text-xl text-amber-800 md:text-2xl dark:text-amber-200">Welcome to Trattoria Gusto</p>
								<p className="text-lg text-amber-700 dark:text-amber-300">Savor the Taste, Enjoy the Moment.</p>
							</div>

							{/* Kaldi's Coffee Cup Image with Realistic Steam Animation */}
							<div className="relative mt-8">
								{/* Realistic Animated Steam Effects - Multiple Layers */}
								

								{/* Kaldi's Cup Image */}
								<div className="relative z-10">
									<img
										src="/logo.png"
										alt="Trattoria Gusto Logo"
										className="h-48 w-48 object-contain drop-shadow-xl md:h-64 md:w-64 mx-auto"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Decorative coffee beans pattern */}
					<div className="absolute top-8 left-8 opacity-10 dark:opacity-5">
						<div className="h-16 w-16 rotate-12 transform rounded-full bg-amber-800"></div>
					</div>
					<div className="absolute right-8 bottom-8 opacity-10 dark:opacity-5">
						<div className="h-20 w-20 -rotate-12 transform rounded-full bg-amber-800"></div>
					</div>
					<div className="absolute top-1/2 right-12 opacity-5 dark:opacity-3">
						<div className="h-24 w-24 rounded-full bg-amber-900"></div>
					</div>
				</div>
			</div>
		</AppLayout>
	);
}

