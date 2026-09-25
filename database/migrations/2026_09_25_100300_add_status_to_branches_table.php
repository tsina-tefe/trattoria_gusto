<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('branches', 'status')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->enum('status', ['active', 'inactive'])->default('active')->after('is_sales_generating');
                $table->index(['status', 'name'], 'branches_status_name_index');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('branches', 'status')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->dropIndex('branches_status_name_index');
                $table->dropColumn('status');
            });
        }
    }
};
