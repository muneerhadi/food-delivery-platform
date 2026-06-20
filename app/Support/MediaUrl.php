<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

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

        return static::baseUrl($request).'/storage/'.$normalized;
    }

    public static function baseUrl(?Request $request = null): string
    {
        $request = $request ?? request();

        if ($request && $request->getHttpHost()) {
            return rtrim($request->getSchemeAndHttpHost(), '/');
        }

        $configured = rtrim((string) config('app.url'), '/');
        $port = (int) config('app.port', 8000);

        if ($port > 0 && ! static::urlHasPort($configured)) {
            return "{$configured}:{$port}";
        }

        return $configured;
    }

    public static function resolveResourceItems(mixed $resource, ?Request $request = null): mixed
    {
        $request = $request ?? request();

        if ($resource instanceof AnonymousResourceCollection) {
            return $resource->resolve($request);
        }

        if ($resource instanceof JsonResource) {
            return $resource->resolve($request);
        }

        return $resource;
    }

    private static function urlHasPort(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST);
        $port = parse_url($url, PHP_URL_PORT);

        return $host !== null && $port !== null;
    }
}
