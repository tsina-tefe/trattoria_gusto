<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_questions', function (Blueprint $table) {
            $table->id();
            $table->string('local_id')->nullable();
            $table->foreignId('form_section_id')->constrained('form_sections')->cascadeOnDelete();
            $table->foreignId('form_input_type_id')->constrained('form_input_types')->restrictOnDelete();
            $table->string('label');
            $table->boolean('is_required')->default(false);
            $table->json('visibility_logic')->nullable();
            $table->json('department_targets')->nullable();
            $table->string('default_value')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_questions');
    }
};
