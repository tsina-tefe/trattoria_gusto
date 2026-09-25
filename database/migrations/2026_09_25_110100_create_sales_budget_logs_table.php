<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_budget_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sales_budget_id')->nullable();
            $table->string('branch_name')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('action', ['created', 'updated', 'deleted'])->nullable();
            $table->decimal('old_sales_amount', 15, 2)->nullable();
            $table->decimal('new_sales_amount', 15, 2)->nullable();
            $table->decimal('old_prev_expense', 15, 2)->nullable();
            $table->decimal('new_prev_expense', 15, 2)->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_budget_logs');
    }
};
