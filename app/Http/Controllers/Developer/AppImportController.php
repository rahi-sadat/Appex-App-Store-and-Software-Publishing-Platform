<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Exception;

class AppImportController extends Controller
{
    public function importAppleStore(Request $request)
    {
        $term = $request->query('term');
        $platform = $this->applePlatform($request);
        $entity = $this->appleEntity($platform);

        if (!$term) {
            return response()->json(['error' => 'Please enter an app name or ID.'], 422);
        }

        try {
            $client = new Client([
                'headers' => [
                    'Accept' => 'application/json',
                    'User-Agent' => 'Appex-Marketplace/1.0',
                ],
                'timeout' => 20,
            ]);
            
            // Calling the Apple Store API with an explicit platform entity.
            $url = 'https://itunes.apple.com/search?' . http_build_query([
                'term' => $term,
                'entity' => $entity,
                'limit' => 1,
            ]);
            
            // If they provided a raw ID (digits only), use lookup
            if (is_numeric($term)) {
                $url = 'https://itunes.apple.com/lookup?' . http_build_query([
                    'id' => $term,
                    'entity' => $entity,
                ]);
            }

            $response = $client->get($url);
            $storeData = json_decode($response->getBody(), true);
            $appInfo = collect($storeData['results'] ?? [])
                ->first(fn (array $result) => $this->isAppleResultForPlatform($result, $platform));

            if (! $appInfo) {
                return response()->json(['error' => 'App not found in the selected Apple Store platform.'], 404);
            }

            $images = $this->collectAppleImageUrls($appInfo);

            if (empty($images) && ! empty($appInfo['trackViewUrl'])) {
                $images = $this->collectAppleWebImageUrls($appInfo['trackViewUrl'], $client);
            }

            return response()->json([
                'name' => $appInfo['trackName'],
                'description' => $appInfo['description'] ?? '',
                'screenshots' => $images,
                'store_url' => $appInfo['trackViewUrl'] ?? '',
                'version' => $appInfo['version'] ?? '1.0.0',
                'language' => (isset($appInfo['languageCodesISO2A']) && count($appInfo['languageCodesISO2A']) > 0) ? $appInfo['languageCodesISO2A'][0] : '',
                'category' => $appInfo['primaryGenreName'] ?? '',
                'icon' => $appInfo['artworkUrl512'] ?? ($appInfo['artworkUrl100'] ?? ''),
                'platform' => $platform,
                'platform_label' => $platform === 'mac' ? 'Mac' : 'iOS',
                'kind' => $appInfo['kind'] ?? '',
                'topics' => $this->appleTags($appInfo, $platform),
            ]);

        } catch (Exception $e) {
            return response()->json(['error' => 'Could not fetch app data from Apple Store. ' . $e->getMessage()], 500);
        }
    }

    private function collectAppleImageUrls(array $appInfo): array
    {
        $imageKeys = ['screenshotUrls', 'ipadScreenshotUrls', 'appletvScreenshotUrls'];
        $urls = [];

        foreach ($imageKeys as $key) {
            foreach (($appInfo[$key] ?? []) as $url) {
                if (is_string($url) && $url !== '') {
                    $urls[] = $url;
                }
            }
        }

        return array_slice(array_values(array_unique($urls)), 0, 10);
    }

    private function collectAppleWebImageUrls(string $storeUrl, Client $client): array
    {
        try {
            $response = $client->get($storeUrl);
        } catch (Exception $exception) {
            return [];
        }

        $html = (string) $response->getBody();
        preg_match_all('~https://[^"\'\s),\\\\]+mzstatic\.com/image/thumb/[^"\'\s),\\\\]+~i', $html, $matches);

        $candidates = [];
        $order = 0;

        foreach ($matches[0] ?? [] as $rawUrl) {
            $url = html_entity_decode(str_replace('\\/', '/', $rawUrl), ENT_QUOTES);

            if (str_contains($url, 'AppIcon') || str_contains($url, 'Placeholder')) {
                continue;
            }

            if (! preg_match('~/(\d+)x(\d+)(?:bb|ss)(?:-\d+)?\.(?:jpe?g|png|webp)$~i', $url, $dimensions)) {
                continue;
            }

            $width = (int) $dimensions[1];
            $height = (int) $dimensions[2];

            if (max($width, $height) < 500) {
                continue;
            }

            $baseUrl = preg_replace('~/\d+x\d+(?:bb|ss)(?:-\d+)?\.(?:jpe?g|png|webp)$~i', '', $url);
            $area = $width * $height;

            if (! isset($candidates[$baseUrl])) {
                $candidates[$baseUrl] = ['url' => $url, 'area' => $area, 'order' => $order++];
                continue;
            }

            if ($area > $candidates[$baseUrl]['area']) {
                $candidates[$baseUrl]['url'] = $url;
                $candidates[$baseUrl]['area'] = $area;
            }
        }

        usort($candidates, fn ($a, $b) => $a['order'] <=> $b['order']);

        return array_slice(array_column($candidates, 'url'), 0, 10);
    }

    public function searchAppleStore(Request $request)
    {
        $term = $request->query('term');
        if (strlen($term) < 2) return response()->json([]);

        $platform = $this->applePlatform($request);
        $entity = $this->appleEntity($platform);

        try {
            $client = new Client([
                'headers' => [
                    'Accept' => 'application/json',
                    'User-Agent' => 'Appex-Marketplace/1.0',
                ],
                'timeout' => 15,
            ]);
            $url = 'https://itunes.apple.com/search?' . http_build_query([
                'term' => $term,
                'entity' => $entity,
                'limit' => 5,
            ]);
            $response = $client->get($url);
            $storeData = json_decode($response->getBody(), true);

            $results = [];
            foreach (($storeData['results'] ?? []) as $app) {
                if (! $this->isAppleResultForPlatform($app, $platform)) {
                    continue;
                }

                $results[] = [
                    'id' => $app['trackId'],
                    'name' => $app['trackName'],
                    'icon' => $app['artworkUrl100'] ?? '',
                    'platform' => $platform,
                    'platform_label' => $platform === 'mac' ? 'Mac' : 'iOS',
                ];
            }
            return response()->json($results);
        } catch (Exception $e) {
            return response()->json([]);
        }
    }

    private function applePlatform(Request $request): string
    {
        return $request->query('platform') === 'mac' ? 'mac' : 'ios';
    }

    private function appleEntity(string $platform): string
    {
        return $platform === 'mac' ? 'macSoftware' : 'software';
    }

    private function isAppleResultForPlatform(array $result, string $platform): bool
    {
        $kind = strtolower((string) ($result['kind'] ?? ''));

        if ($platform === 'mac') {
            return str_contains($kind, 'mac');
        }

        return $kind === '' || ! str_contains($kind, 'mac');
    }

    private function appleTags(array $appInfo, string $platform): string
    {
        $platformLabel = $platform === 'mac' ? 'Mac' : 'iOS';
        $tags = array_merge(
            [$appInfo['primaryGenreName'] ?? null, $platformLabel],
            $appInfo['genres'] ?? []
        );

        $tags = collect($tags)
            ->map(fn ($tag) => trim((string) $tag))
            ->filter()
            ->unique(fn ($tag) => strtolower($tag))
            ->take(8)
            ->values();

        return $tags->implode(', ');
    }

    public function proxyImage(Request $request)
    {
        $url = $request->query('url');
        if (!$url) return response()->json(['error' => 'URL required'], 400);

        try {
            $client = new Client();
            $res = $client->get($url);
            return response($res->getBody(), 200)
                ->header('Content-Type', $res->getHeaderLine('Content-Type') ?: 'image/jpeg');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not fetch image'], 500);
        }
    }

    public function searchGitHub(Request $request)
    {
        $term = trim((string) $request->query('term', ''));
        $repoName = $this->normalizeGitHubRepo($term);

        if (strlen($term) < 2) {
            return response()->json([]);
        }

        try {
            $client = new Client([
                'headers' => [
                    'Accept' => 'application/vnd.github+json',
                    'User-Agent' => 'Appex-Marketplace',
                ],
                'timeout' => 15,
            ]);

            if ($repoName) {
                try {
                    $response = $client->get('https://api.github.com/repos/' . $repoName);
                    $repo = json_decode($response->getBody(), true);

                    return response()->json([[
                        'id' => $repo['full_name'],
                        'name' => $repo['full_name'],
                        'icon' => $repo['owner']['avatar_url'] ?? '',
                    ]]);
                } catch (Exception $exception) {
                    // Fall back to GitHub search below.
                }
            }

            $response = $client->get('https://api.github.com/search/repositories', [
                'query' => [
                    'q' => $repoName ?: $term,
                    'per_page' => 5,
                ],
            ]);
            $payload = json_decode($response->getBody(), true);

            $results = [];
            foreach (($payload['items'] ?? []) as $repo) {
                $results[] = [
                    'id' => $repo['full_name'],
                    'name' => $repo['full_name'],
                    'icon' => $repo['owner']['avatar_url'] ?? '',
                ];
            }

            return response()->json($results);
        } catch (Exception $exception) {
            return response()->json([]);
        }
    }

    public function importGitHub(Request $request)
    {
        $repo = $request->query('repo'); // e.g., "laravel/laravel" or full URL

        if (!$repo) {
            return response()->json(['error' => 'Please enter a GitHub repository URL or username/repo.'], 422);
        }

        $repo = $this->normalizeGitHubRepo($repo);

        if (! $repo) {
            return response()->json(['error' => 'Please enter a valid GitHub repository URL or username/repo.'], 422);
        }

        try {
            $client = new Client([
                'headers' => ['User-Agent' => 'Appex-Marketplace']
            ]);
            
            // 1. Fetch Repository Details
            $repoUrl = "https://api.github.com/repos/" . $repo;
            $repoResponse = $client->get($repoUrl);
            $repoData = json_decode($repoResponse->getBody(), true);
            $defaultBranch = $repoData['default_branch'] ?? 'main';

            // 2. Fetch Latest Release
            $releaseUrl = "https://api.github.com/repos/" . $repo . "/releases/latest";
            $releaseData = [];
            try {
                $releaseResponse = $client->get($releaseUrl);
                $releaseData = json_decode($releaseResponse->getBody(), true);
            } catch (Exception $e) {
                // Ignore if no releases exist
            }
            $selectedRelease = $releaseData;
            $downloadAsset = $this->preferredGitHubReleaseAsset($selectedRelease);

            if (! $downloadAsset) {
                [$selectedRelease, $downloadAsset] = $this->firstGitHubReleaseWithAsset($client, $repo);
            }

            // 3. Fetch real app images from appex.json or screenshot-like README images.
            $screenshots = $this->collectGitHubImages($client, $repo, $defaultBranch);

            return response()->json([
                'name' => $repoData['name'],
                'description' => $repoData['description'] ?? '',
                'latest_version' => $selectedRelease['tag_name'] ?? '1.0.0',
                'screenshots' => $screenshots,
                'github_url' => $repoData['html_url'],
                'demo_url' => $repoData['homepage'] ?? '',
                'language' => $repoData['language'] ?? '',
                'license' => $repoData['license']['spdx_id'] ?? '',
                'topics' => isset($repoData['topics']) ? implode(', ', $repoData['topics']) : '',
                'download_url' => $downloadAsset['browser_download_url'] ?? '',
                'size_bytes' => $downloadAsset['size'] ?? null,
                'size_label' => $this->formatBytes($downloadAsset['size'] ?? null),
                'icon' => $repoData['owner']['avatar_url'] ?? '',
            ]);

        } catch (Exception $e) {
            return response()->json(['error' => 'Could not fetch data from GitHub. Make sure the repository is public and spelled correctly.'], 500);
        }
    }

    private function normalizeGitHubRepo(string $repo): ?string
    {
        $repo = trim($repo);
        $repo = preg_replace('~^git@github\.com:~i', '', $repo);
        $repo = preg_replace('~^https?://github\.com/~i', '', $repo);
        $repo = preg_replace('~^www\.github\.com/~i', '', $repo);
        $repo = trim((string) $repo, " \t\n\r\0\x0B/");
        $repo = preg_replace('~\.git$~i', '', $repo);

        $parts = array_values(array_filter(explode('/', $repo), fn ($part) => $part !== ''));

        if (count($parts) < 2) {
            return null;
        }

        return $parts[0] . '/' . $parts[1];
    }

    private function preferredGitHubReleaseAsset(array $releaseData): ?array
    {
        $assets = $releaseData['assets'] ?? [];

        if (! is_array($assets) || empty($assets)) {
            return null;
        }

        $candidates = collect($assets)
            ->filter(function ($asset) {
                $name = strtolower((string) ($asset['name'] ?? ''));

                if (empty($asset['browser_download_url']) || $name === '') {
                    return false;
                }

                return ! preg_match('~(\.blockmap|\.ya?ml|\.json|\.sha\d*|\.sig|\.asc|\.txt)$~i', $name);
            })
            ->values();

        if ($candidates->isEmpty()) {
            return null;
        }

        $preferredExtensions = ['dmg', 'exe', 'msi', 'pkg', 'deb', 'rpm', 'appimage', 'zip', 'tar.gz', 'tgz'];

        return $candidates
            ->sortBy(function ($asset) use ($preferredExtensions) {
                $name = strtolower((string) ($asset['name'] ?? ''));

                foreach ($preferredExtensions as $index => $extension) {
                    if (str_ends_with($name, '.' . $extension)) {
                        return $index;
                    }
                }

                return count($preferredExtensions);
            })
            ->first();
    }

    private function firstGitHubReleaseWithAsset(Client $client, string $repo): array
    {
        try {
            $response = $client->get("https://api.github.com/repos/{$repo}/releases", [
                'query' => [
                    'per_page' => 10,
                ],
            ]);
            $releases = json_decode($response->getBody(), true);
        } catch (Exception $exception) {
            return [[], null];
        }

        foreach (($releases ?? []) as $release) {
            if (! is_array($release)) {
                continue;
            }

            $asset = $this->preferredGitHubReleaseAsset($release);

            if ($asset) {
                return [$release, $asset];
            }
        }

        return [[], null];
    }

    private function collectGitHubImages(Client $client, string $repo, string $defaultBranch): array
    {
        $images = $this->collectGitHubManifestImages($client, $repo, $defaultBranch);

        if (empty($images)) {
            $images = $this->collectGitHubReadmeImages($client, $repo, $defaultBranch);
        }

        return array_slice(array_values(array_unique($images)), 0, 10);
    }

    private function collectGitHubManifestImages(Client $client, string $repo, string $defaultBranch): array
    {
        foreach (array_unique([$defaultBranch, 'main', 'master']) as $branch) {
            try {
                $response = $client->get("https://raw.githubusercontent.com/{$repo}/{$branch}/appex.json");
                $manifestData = json_decode($response->getBody(), true);
            } catch (Exception $exception) {
                continue;
            }

            if (! is_array($manifestData['screenshots'] ?? null)) {
                continue;
            }

            return collect($manifestData['screenshots'])
                ->map(fn ($path) => $this->resolveGitHubImageUrl((string) $path, $repo, $branch))
                ->filter()
                ->values()
                ->all();
        }

        return [];
    }

    private function collectGitHubReadmeImages(Client $client, string $repo, string $defaultBranch): array
    {
        try {
            $response = $client->get("https://api.github.com/repos/{$repo}/readme");
            $readme = json_decode($response->getBody(), true);
            $content = base64_decode((string) ($readme['content'] ?? ''), true);
        } catch (Exception $exception) {
            return [];
        }

        if (! $content) {
            return [];
        }

        preg_match_all('~!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<img[^>]+src=["\']([^"\']+)["\']~i', $content, $matches);
        $readmeDir = trim(dirname((string) ($readme['path'] ?? 'README.md')), '.\\/');

        return collect($matches[1] ?? [])
            ->merge($matches[2] ?? [])
            ->map(fn ($url) => $this->resolveGitHubImageUrl((string) $url, $repo, $defaultBranch, $readmeDir))
            ->filter(fn ($url) => $url && $this->isImportableImageUrl($url) && $this->looksLikeAppScreenshotUrl($url))
            ->unique()
            ->take(10)
            ->values()
            ->all();
    }

    private function resolveGitHubImageUrl(string $url, string $repo, string $branch, string $basePath = ''): ?string
    {
        $url = trim($url);

        if ($url === '') {
            return null;
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        $path = ltrim($basePath ? "{$basePath}/{$url}" : $url, '/');
        $path = preg_replace('~(^|/)\./~', '$1', $path);

        return "https://raw.githubusercontent.com/{$repo}/{$branch}/{$path}";
    }

    private function isImportableImageUrl(string $url): bool
    {
        return (bool) preg_match('~\.(?:jpe?g|png|webp)(?:\?.*)?$~i', $url);
    }

    private function looksLikeAppScreenshotUrl(string $url): bool
    {
        return (bool) preg_match('~(?:screenshot|screenshots|screen-shot|preview|gallery|demo)~i', $url);
    }

    private function formatBytes(?int $bytes): string
    {
        if (! $bytes) {
            return '';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $index = min((int) floor(log($bytes, 1024)), count($units) - 1);
        $value = $bytes / (1024 ** $index);

        return round($value, $index > 1 ? 1 : 0) . ' ' . $units[$index];
    }
}
