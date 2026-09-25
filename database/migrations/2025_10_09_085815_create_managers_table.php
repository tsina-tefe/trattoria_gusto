<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('managers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');

            // A manager heads either a branch or a department, never both, so
            // the unused column stays null.
            $table->enum('manager_type', ['branch', 'department'])->default('branch');
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();

            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->timestamps();

            $table->unique(
                ['employee_id', 'manager_type', 'branch_id', 'department_id'],
                'managers_scope_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('managers');
    }
};
