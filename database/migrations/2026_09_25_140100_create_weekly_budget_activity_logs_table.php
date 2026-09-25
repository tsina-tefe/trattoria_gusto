<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_budget_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('weekly_budget_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 120);
            $table->string('summary', 500);
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['weekly_budget_id', 'created_at'], 'wb_activity_logs_budget_created_idx');
            $table->index(['user_id', 'created_at'], 'wb_activity_logs_user_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_budget_activity_logs');
    }
};
