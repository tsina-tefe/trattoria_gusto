<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Pivot table for employees
        Schema::create('evaluates_group_employee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluates_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Pivot table for departments
        Schema::create('evaluates_group_department', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluates_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Pivot table for branches
        Schema::create('evaluates_group_branch', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluates_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Pivot table for other evaluables
        Schema::create('evaluates_group_other_evaluable', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluates_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('other_evaluable_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluates_group_other_evaluable');
        Schema::dropIfExists('evaluates_group_branch');
        Schema::dropIfExists('evaluates_group_department');
        Schema::dropIfExists('evaluates_group_employee');
    }
};
