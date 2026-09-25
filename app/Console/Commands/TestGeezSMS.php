<?php

namespace App\Console\Commands;

use App\Services\GeezSMSService;
use Illuminate\Console\Command;

class TestGeezSMS extends Command
{
    protected $signature = 'geezsms:test {phone}';
    protected $description = 'Test GeezSMS API by sending test SMS';

    public function handle(GeezSMSService $geezSmsService): int
    {
        $phone = $this->argument('phone');
        
        $this->info('Testing GeezSMS API...');
        
        // Check if service is configured
        if (!$geezSmsService->isConfigured()) {
            $this->error('GeezSMS is not configured. Please check your .env file.');
            return 1;
        }
        
        $this->info('✅ GeezSMS service is configured');
        
        // Check balance
        $this->info('Checking account balance...');
        $balance = $geezSmsService->getBalance();
        if ($balance) {
            $this->info('✅ Balance check successful: ' . json_encode($balance));
        } else {
            $this->error('❌ Balance check failed');
        }
        
        // Send test SMS
        $this->info("Sending test SMS to {$phone}...");
        $message = "This is a test message from KALDIS pre-order system. SMS is working! 🎉";
        
        $result = $geezSmsService->sendMessage($phone, $message);
        
        if ($result) {
            $this->info('✅ SMS sent successfully!');
            $this->info('Check your phone for the message.');
            return 0;
        } else {
            $this->error('❌ SMS sending failed. Check logs for details.');
            $this->info('Run: php artisan log:show to see recent errors');
            return 1;
        }
    }
}
