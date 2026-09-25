<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderType;

class WalkinCustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        OrderType::firstOrCreate([
            'name' => 'Walkin Customer',
        ], [
            'status' => 'Active',
        ]);

        $this->command->info('Walkin Customer order type added successfully.');
    }
}
