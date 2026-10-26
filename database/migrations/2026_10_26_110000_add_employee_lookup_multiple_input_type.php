<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('form_input_types')
            ->where('type_identifier', 'employee_lookup_multiple')
            ->exists();

        if (!$exists) {
            DB::table('form_input_types')->insert([
                'name' => 'Employee Lookup (Multiple)',
                'type_identifier' => 'employee_lookup_multiple',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('form_input_types')
            ->where('type_identifier', 'employee_lookup_multiple')
            ->delete();
    }
};
