<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_budget_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('weekly_budget_id')->nullable();
            $table->string('type', 100);
            $table->string('title', 200);
            $table->text('body')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('weekly_budget_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_budget_notifications');
    }
};
