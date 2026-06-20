<?php

namespace App\Support;

use Illuminate\Http\Request;

class MediaUrl
{
    public static function public(?string $path, ?Request $request = null): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $normalized = ltrim($path, '/');

        if (str_starts_with($normalized, 'storage/')) {
            $normalized = substr($normalized, strlen('storage/'));
        }

        $base = $request
            ? rtrim($request->getSchemeAndHttpHost(), '/')
            : rtrim(config('app.url'), '/');

        return "{$base}/storage/{$normalized}";
    }
}
