<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_submission_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_submission_id')->constrained('form_submissions')->cascadeOnDelete();
            $table->foreignId('form_question_id')->constrained('form_questions')->cascadeOnDelete();
            $table->string('sub_question_identifier')->nullable();
            $table->text('value_text')->nullable();
            $table->boolean('value_boolean')->nullable();
            $table->json('targeted_employees')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_submission_answers');
    }
};
