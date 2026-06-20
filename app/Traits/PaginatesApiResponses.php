<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

trait PaginatesApiResponses
{
    protected function paginatedResponse(mixed $resource, LengthAwarePaginator $paginator, string $message = 'Success'): JsonResponse
    {
        return $this->successResponse([
            'items' => $resource,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], $message);
    }
}
