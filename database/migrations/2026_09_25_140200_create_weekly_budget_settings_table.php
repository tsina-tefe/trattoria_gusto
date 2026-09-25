<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_budget_settings', function (Blueprint $table) {
            $table->id();
            $table->string('submission_deadline_day')->default('Friday');
            $table->boolean('is_urgent_enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_budget_settings');
    }
};
