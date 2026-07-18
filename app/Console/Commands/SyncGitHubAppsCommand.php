<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MarketplaceApp;
use GuzzleHttp\Client;
use Exception;

class SyncGitHubAppsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appex:sync-github';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically fetch and sync latest data for GitHub-sourced apps';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting GitHub App Sync...');
        
        $apps = MarketplaceApp::whereNotNull('repository_url')
                ->where('repository_url', 'like', '%github.com%')
                ->get();
                
        if ($apps->isEmpty()) {
            $this->info('No GitHub apps found to sync.');
            return;
        }

        $client = new Client([
            'headers' => ['User-Agent' => 'Appex-Marketplace']
        ]);

        $updatedCount = 0;

        foreach ($apps as $app) {
            $this->info("Syncing app: {$app->name}...");
            
            // Extract username/repo from URL
            $repo = str_replace(['https://github.com/', 'http://github.com/'], '', $app->repository_url);
            $repo = trim($repo, '/');
            
            try {
                // 1. Fetch Latest Release for version info
                $releaseUrl = "https://api.github.com/repos/" . $repo . "/releases/latest";
                $releaseResponse = $client->get($releaseUrl);
                $releaseData = json_decode($releaseResponse->getBody(), true);
                
                $latestVersion = $releaseData['tag_name'] ?? null;
                
                // If there's a new version, we could update the app or create a new release record
                if ($latestVersion) {
                    $this->info("Found latest version: {$latestVersion}");
                    // Here you would check if this version exists in AppRelease model.
                }

                // 2. Fetch basic repo data to update stars/forks or description
                $repoUrl = "https://api.github.com/repos/" . $repo;
                $repoResponse = $client->get($repoUrl);
                $repoData = json_decode($repoResponse->getBody(), true);
                
                // Update basic information to keep it synced
                if (isset($repoData['description']) && $repoData['description'] !== $app->description) {
                    // Update description only if it was originally pulled from GitHub
                    // $app->update(['description' => $repoData['description']]);
                }
                
                $updatedCount++;
                
            } catch (Exception $e) {
                $this->error("Failed to sync {$app->name}: " . $e->getMessage());
            }
        }
        
        $this->info("GitHub Sync complete. {$updatedCount} apps processed.");
    }
}
