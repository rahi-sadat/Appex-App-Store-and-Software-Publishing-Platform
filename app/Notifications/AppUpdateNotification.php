<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\MarketplaceApp;

class AppUpdateNotification extends Notification
{
    use Queueable;

    public $app;
    public $version;

    /**
     * Create a new notification instance.
     */
    public function __construct(MarketplaceApp $app, string $version)
    {
        $this->app = $app;
        $this->version = $version;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'app_id' => $this->app->id,
            'title' => 'App Update Available',
            'message' => "{$this->app->name} has a new version available: v{$this->version}",
            'action_url' => url('/?app=' . $this->app->slug)
        ];
    }
}
