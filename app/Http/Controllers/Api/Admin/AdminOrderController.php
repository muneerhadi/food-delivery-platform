<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminOrderListResource;
use App\Http\Resources\Admin\AdminOrderResource;
use App\Models\Order;
use App\Traits\ApiResponse;
use App\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    use ApiResponse, PaginatesApiResponses;

    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with(['customer:id,name', 'restaurant:id,name', 'driver:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('restaurant_id')) {
            $query->where('restaurant_id', $request->integer('restaurant_id'));
        }

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->integer('driver_id'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->string('payment_method'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->string('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->string('date_to'));
        }

        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%'.$request->string('search').'%');
        }

        $orders = $query->latest()->paginate(15);

        return $this->paginatedResponse(AdminOrderListResource::collection($orders), $orders);
    }

    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['customer', 'restaurant', 'driver', 'items'])
            ->first();

        if (! $order) {
            return $this->errorResponse('Order not found.', 404);
        }

        return $this->successResponse(new AdminOrderResource($order));
    }
}
