<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluator_id')->constrained('users')->onDelete('cascade');

            // The subject of an evaluation is polymorphic: it may be a user or
            // one of the other evaluable records, so evaluate_id carries no
            // foreign key and evaluable_type names the model.
            $table->unsignedBigInteger('evaluate_id');
            $table->string('evaluable_type');

            $table->foreignId('evaluation_id')->constrained('evaluations')->onDelete('cascade');
            $table->foreignId('evaluation_period_id')->nullable()->constrained('evaluation_periods')->nullOnDelete();

            $table->text('comment')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('evaluate_id', 'evaluation_responses_evaluate_id_foreign');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_responses');
    }
};
