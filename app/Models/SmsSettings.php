<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsSettings extends Model
{
    protected $fillable = [
        'is_active',
        'deactivation_reason',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who last updated the settings
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the singleton instance of SMS settings
     */
    public static function getInstance(): self
    {
        return self::firstOrCreate(
            ['id' => 1],
            [
                'is_active' => true,
                'deactivation_reason' => null,
            ]
        );
    }

    /**
     * Check if SMS is currently active
     */
    public static function isActive(): bool
    {
        return self::getInstance()->is_active;
    }

    /**
     * Activate SMS service
     */
    public static function activate(?int $userId = null): void
    {
        $settings = self::getInstance();
        $settings->update([
            'is_active' => true,
            'deactivation_reason' => null,
            'updated_by' => $userId ?? auth()->id(),
        ]);
    }

    /**
     * Deactivate SMS service
     */
    public static function deactivate(string $reason, ?int $userId = null): void
    {
        $settings = self::getInstance();
        $settings->update([
            'is_active' => false,
            'deactivation_reason' => $reason,
            'updated_by' => $userId ?? auth()->id(),
        ]);
    }
}
