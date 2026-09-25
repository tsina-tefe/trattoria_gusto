<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            // Drop foreign key on evaluate_id if exists (was referencing users)
            try {
                $table->dropForeign(['evaluate_id']);
            } catch (\Throwable $e) {
                // ignore if not present
            }

            // Add evaluable_type and optional evaluation_period_id
            if (!Schema::hasColumn('evaluation_responses', 'evaluable_type')) {
                $table->string('evaluable_type')->after('evaluate_id');
            }
            if (!Schema::hasColumn('evaluation_responses', 'evaluation_period_id')) {
                $table->foreignId('evaluation_period_id')->nullable()->after('evaluation_id')
                    ->constrained('evaluation_periods')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            if (Schema::hasColumn('evaluation_responses', 'evaluable_type')) {
                $table->dropColumn('evaluable_type');
            }
            if (Schema::hasColumn('evaluation_responses', 'evaluation_period_id')) {
                $table->dropForeign(['evaluation_period_id']);
                $table->dropColumn('evaluation_period_id');
            }
        });
    }
};


