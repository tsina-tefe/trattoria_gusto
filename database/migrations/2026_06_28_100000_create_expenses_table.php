<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            // Chart-of-accounts code, supplied by finance rather than generated.
            $table->integer('expense_parent_acc_code')->primary();
            $table->integer('code')->nullable();
            $table->string('expense_type', 100)->nullable();
            $table->boolean('frequent_expense')->default(false);
            $table->boolean('is_expense')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};