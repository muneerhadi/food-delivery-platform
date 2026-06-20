<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Traits\ApiResponse;
use App\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse, PaginatesApiResponses;

    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->appNotifications()
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return $this->paginatedResponse(
            NotificationResource::collection($notifications),
            $notifications
        );
    }

    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = $request->user()
            ->appNotifications()
            ->where('id', $id)
            ->first();

        if (! $notification) {
            return $this->errorResponse('Notification not found.', 404);
        }

        $notification->markAsRead();

        return $this->successResponse(
            new NotificationResource($notification->fresh()),
            'Notification marked as read.'
        );
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()
            ->appNotifications()
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return $this->successResponse(null, 'All notifications marked as read.');
    }
}
