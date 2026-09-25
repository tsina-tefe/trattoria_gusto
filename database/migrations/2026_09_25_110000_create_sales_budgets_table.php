<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_budgets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('fiscal_year_id')->nullable();
            $table->unsignedBigInteger('fiscal_month_id')->nullable();
            $table->decimal('sales_amount', 15, 2)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->index(['fiscal_month_id', 'branch_id'], 'sales_budgets_fiscal_month_branch_index');
            $table->index(['fiscal_year_id', 'fiscal_month_id', 'branch_id'], 'sales_budgets_fiscal_period_branch_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_budgets');
    }
};
