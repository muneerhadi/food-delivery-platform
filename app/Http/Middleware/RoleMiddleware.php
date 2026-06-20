<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    protected array $roles = [];

    public function __construct(string $roles = '')
    {
        if ($roles !== '') {
            $this->roles = array_map('trim', explode(',', $roles));
        }
    }

    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $allowedRoles = ! empty($roles) ? $roles : $this->roles;

        if (! $request->user() || ! in_array($request->user()->role, $allowedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Insufficient permissions.',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}
