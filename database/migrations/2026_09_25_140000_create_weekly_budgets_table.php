<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_budgets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('fiscal_year_id');
            $table->unsignedBigInteger('fiscal_month_id');
            // Counted from the start of the fiscal month, not an ISO week.
            $table->unsignedTinyInteger('week_number');
            $table->date('week_start_date');
            $table->date('week_end_date');
            $table->enum('request_type', ['urgent', 'normal'])->default('normal');

            // A request is approved independently by the department, finance
            // and the CEO, so each keeps its own status.
            $table->enum('status_finance', ['pending', 'approved', 'rejected', 'paid', 'on-hold', 'transferred'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->unsignedTinyInteger('transferred_to')->nullable();
            $table->enum('status_department', ['pending', 'approved', 'rejected', 'on-hold', 'transferred'])->default('pending');
            $table->enum('status_ceo', ['pending', 'approved', 'rejected', 'on-hold'])->default('pending');
            $table->timestamp('ceo_approved_at')->nullable();

            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->text('note')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            // Same type as expenses.expense_parent_acc_code so an InnoDB
            // foreign key is legal. The column is nullable because a request
            // can be saved before finance picks a payment type.
            $table->integer('payment_type_id')->nullable();
            $table->unsignedBigInteger('payment_category_id')->nullable();

            $table->foreign('payment_type_id')
                ->references('expense_parent_acc_code')
                ->on('expenses')
                ->nullOnDelete();

            $table->index(['request_type', 'status_finance', 'status_ceo']);
            $table->index(['department_id', 'branch_id']);
            $table->index(['fiscal_year_id', 'fiscal_month_id']);
            $table->index('payment_category_id');
            $table->index('branch_id');
            $table->index('fiscal_month_id');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_budgets');
    }
};
