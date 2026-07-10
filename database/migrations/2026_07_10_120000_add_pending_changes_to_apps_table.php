<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('apps', function (Blueprint $table) {
            $table->json('pending_changes')->nullable()->after('status');
            $table->timestamp('pending_changes_submitted_at')->nullable()->after('pending_changes');
        });
    }

    public function down(): void
    {
        Schema::table('apps', function (Blueprint $table) {
            $table->dropColumn(['pending_changes', 'pending_changes_submitted_at']);
        });
    }
};
