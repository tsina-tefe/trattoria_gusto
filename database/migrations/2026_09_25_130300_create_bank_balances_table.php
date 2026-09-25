<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fiscal_year_id')->constrained();
            $table->foreignId('fiscal_month_id')->constrained();
            $table->integer('week_number');
            $table->foreignId('estimated_weekly_sale_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('bank_id')->constrained();
            $table->foreignId('bank_branch_id')->constrained();
            $table->decimal('amount', 15, 2);
            // Balances are entered in the bank's own currency; this converts to ETB.
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_balances');
    }
};
