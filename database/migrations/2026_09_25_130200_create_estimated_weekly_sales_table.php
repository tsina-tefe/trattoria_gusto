<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estimated_weekly_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fiscal_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_month_id')->constrained()->cascadeOnDelete();
            $table->integer('week_number');
            $table->decimal('amount', 15, 2)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->unique(['fiscal_year_id', 'fiscal_month_id', 'week_number'], 'ews_unique_period');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estimated_weekly_sales');
    }
};
