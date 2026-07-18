<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\MarketplaceApp;

class AppStatusNotification extends Notification
{
    use Queueable;
    
    public $app;
    public $status;
    public $reason;

    public function __construct(MarketplaceApp $app, string $status, ?string $reason = null)
    {
        $this->app = $app;
        $this->status = $status;
        $this->reason = $reason;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'app_id' => $this->app->id,
            'title' => 'App Submission ' . ucfirst($this->status),
            'message' => "Your app {$this->app->name} was {$this->status}." . ($this->reason ? " Reason: {$this->reason}" : ''),
            'action_url' => url('/developer')
        ];
    }
}
