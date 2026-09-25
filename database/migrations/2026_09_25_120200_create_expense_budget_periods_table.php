<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_budget_periods', function (Blueprint $table) {
            $table->id();
            $table->string('period_name');
            $table->foreignId('fiscal_year_id')->constrained();
            $table->foreignId('fiscal_month_id')->constrained();
            $table->enum('status', ['active', 'inactive'])->default('inactive');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_budget_periods');
    }
};
