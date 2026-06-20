<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = $user->fcmTokens()->pluck('token')->all();

        if ($tokens === []) {
            return;
        }

        $this->sendToMultiple($tokens, $title, $body, $data);
    }

    public function sendToMultiple(array $tokens, string $title, string $body, array $data = []): void
    {
        foreach (array_unique($tokens) as $token) {
            $this->sendToToken($token, $title, $body, $data);
        }
    }

    public function sendToToken(string $token, string $title, string $body, array $data = []): bool
    {
        if (! config('services.fcm.enabled')) {
            return false;
        }

        $projectId = config('services.fcm.project_id');
        $accessToken = $this->getAccessToken();

        if (! $projectId || ! $accessToken) {
            return false;
        }

        $payload = [
            'message' => [
                'token' => $token,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                ],
                'data' => collect($data)->map(fn ($value) => (string) $value)->all(),
            ],
        ];

        try {
            $response = Http::withToken($accessToken)
                ->acceptJson()
                ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", $payload);

            if ($response->failed()) {
                Log::warning('FCM send failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('FCM send exception', ['message' => $e->getMessage()]);

            return false;
        }
    }

    protected function getAccessToken(): ?string
    {
        return Cache::remember('fcm_access_token', 3300, function () {
            $credentialsPath = config('services.fcm.credentials');

            if (! $credentialsPath || ! is_readable($credentialsPath)) {
                Log::warning('FCM credentials file missing or unreadable.');

                return null;
            }

            $credentials = json_decode(file_get_contents($credentialsPath), true);

            if (! is_array($credentials) || empty($credentials['client_email']) || empty($credentials['private_key'])) {
                return null;
            }

            $now = time();
            $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claim = $this->base64UrlEncode(json_encode([
                'iss' => $credentials['client_email'],
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ]));

            $unsigned = "{$header}.{$claim}";
            openssl_sign($unsigned, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256);
            $jwt = $unsigned.'.'.$this->base64UrlEncode($signature);

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if ($response->failed()) {
                Log::warning('FCM OAuth token request failed', ['body' => $response->json()]);

                return null;
            }

            return $response->json('access_token');
        });
    }

    protected function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
