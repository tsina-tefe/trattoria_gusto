<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_input_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type_identifier')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();
        $types = [
            ['name' => 'Text', 'type_identifier' => 'text'],
            ['name' => 'Boolean (Yes/No)', 'type_identifier' => 'boolean'],
            ['name' => 'Single Choice', 'type_identifier' => 'select_one'],
            ['name' => 'Multiple Choice', 'type_identifier' => 'select_multiple'],
            ['name' => 'Number', 'type_identifier' => 'number'],
            ['name' => 'Date', 'type_identifier' => 'date'],
            ['name' => 'Time', 'type_identifier' => 'time'],
            ['name' => 'Signature', 'type_identifier' => 'signature'],
            ['name' => 'Branch Lookup', 'type_identifier' => 'branch_lookup'],
            ['name' => 'Department Lookup', 'type_identifier' => 'department_lookup'],
            ['name' => 'Employee Lookup', 'type_identifier' => 'employee_lookup'],
            ['name' => '5-Star Rating', 'type_identifier' => 'rating_stars'],
            ['name' => 'Number Slider (1-10)', 'type_identifier' => 'rating_slider'],
            ['name' => 'Geo-Location', 'type_identifier' => 'geolocation'],
            ['name' => 'Employee Attendance Roster', 'type_identifier' => 'employee_attendance_roster'],
            ['name' => 'Employee Evaluation Grid', 'type_identifier' => 'employee_evaluation_grid'],
            ['name' => 'Title / Label', 'type_identifier' => 'title'],
        ];

        foreach ($types as $type) {
            DB::table('form_input_types')->insert([
                'name' => $type['name'],
                'type_identifier' => $type['type_identifier'],
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('form_input_types');
    }
};
