<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('branches', 'is_sales_generating')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->boolean('is_sales_generating')->default(false)->after('description');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('branches', 'is_sales_generating')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->dropColumn('is_sales_generating');
            });
        }
    }
};
