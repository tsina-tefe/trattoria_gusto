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
        Schema::table('evaluation_responses', function (Blueprint $table) {
            // Drop the old foreign key columns
            $table->dropForeign(['evaluation_period_id']);
            $table->dropForeign(['evaluation_type_id']);
            $table->dropColumn(['evaluation_period_id', 'evaluation_type_id']);
            
            // Add the new evaluation_id column
            $table->foreignId('evaluation_id')->constrained('evaluations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            // Reverse the changes
            $table->dropForeign(['evaluation_id']);
            $table->dropColumn('evaluation_id');
            
            // Add back the old columns
            $table->foreignId('evaluation_period_id')->constrained('evaluation_periods')->onDelete('cascade');
            $table->foreignId('evaluation_type_id')->constrained('evaluation_types')->onDelete('cascade');
        });
    }
};
