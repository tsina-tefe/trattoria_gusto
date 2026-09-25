import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function TestPage({ completionData, inventoryPeriods, fiscalYears }: any) {
  console.log('Test Page Props:', { completionData, inventoryPeriods, fiscalYears });

  return (
    <AppLayout breadcrumbs={[{ title: 'Test', href: '/inventory-completion-tracking' }]}>
      <Head title="Test" />
      <div className="p-4">
        <h1 className="text-2xl font-bold">Test Page</h1>
        <div className="mt-4">
          <h2 className="text-xl">Data Received:</h2>
          <pre className="mt-2 bg-gray-100 p-4 rounded">
            {JSON.stringify({ completionData, inventoryPeriods, fiscalYears }, null, 2)}
          </pre>
        </div>
      </div>
    </AppLayout>
  );
}
