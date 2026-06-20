<?php

use App\Http\Controllers\Api\Admin\AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminPromoController;
use App\Http\Controllers\Api\Admin\AdminRestaurantController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FcmTokenController;
use App\Http\Controllers\Api\Customer\AddressController;
use App\Http\Controllers\Api\Customer\MenuController;
use App\Http\Controllers\Api\Customer\NotificationController;
use App\Http\Controllers\Api\Customer\OrderController;
use App\Http\Controllers\Api\Customer\ProfileController;
use App\Http\Controllers\Api\Customer\PromoController;
use App\Http\Controllers\Api\Customer\RestaurantController;
use App\Http\Controllers\Api\Driver\DriverEarningsController;
use App\Http\Controllers\Api\Driver\DriverLocationController;
use App\Http\Controllers\Api\Driver\DriverOrderController;
use App\Http\Controllers\Api\Driver\DriverProfileController;
use App\Http\Controllers\Api\Restaurant\RestaurantCategoryController;
use App\Http\Controllers\Api\Restaurant\RestaurantDashboardController;
use App\Http\Controllers\Api\Restaurant\RestaurantEarningsController;
use App\Http\Controllers\Api\Restaurant\RestaurantMenuItemController;
use App\Http\Controllers\Api\Restaurant\RestaurantOrderController;
use App\Http\Controllers\Api\Restaurant\RestaurantProfileController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/notifications/register-token', [FcmTokenController::class, 'register']);
});

Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// Customer routes
Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    Route::get('/restaurants', [RestaurantController::class, 'index']);
    Route::get('/restaurants/{slug}', [RestaurantController::class, 'show']);
    Route::get('/restaurants/{slug}/menu', [MenuController::class, 'index']);
    Route::get('/restaurants/{slug}/reviews', [RestaurantController::class, 'reviews']);

    Route::apiResource('/addresses', AddressController::class)->except(['show']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);
    Route::get('/orders/{orderNumber}/track', [OrderController::class, 'track']);

    Route::post('/promos/validate', [PromoController::class, 'validatePromo']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});

// Super Admin
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    Route::post('/restaurants/{id}/approve', [AdminRestaurantController::class, 'approve']);
    Route::post('/restaurants/{id}/reject', [AdminRestaurantController::class, 'reject']);
    Route::apiResource('/restaurants', AdminRestaurantController::class)->except(['store']);

    Route::post('/users/{id}/toggle-active', [AdminUserController::class, 'toggleActive']);
    Route::apiResource('/users', AdminUserController::class);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [AdminOrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/assign-driver', [AdminOrderController::class, 'assignDriver']);
    Route::post('/orders/{orderNumber}/update-status', [AdminOrderController::class, 'updateStatus']);

    Route::apiResource('/promos', AdminPromoController::class);

    Route::prefix('analytics')->group(function () {
        Route::get('/revenue', [AdminAnalyticsController::class, 'revenue']);
        Route::get('/orders', [AdminAnalyticsController::class, 'orders']);
        Route::get('/top-restaurants', [AdminAnalyticsController::class, 'topRestaurants']);
        Route::get('/top-drivers', [AdminAnalyticsController::class, 'topDrivers']);
    });
});

// Restaurant Owner
Route::middleware(['auth:sanctum', 'role:restaurant_owner'])->prefix('restaurant')->group(function () {
    Route::get('/dashboard', [RestaurantDashboardController::class, 'index']);
    Route::get('/profile', [RestaurantProfileController::class, 'show']);
    Route::put('/profile', [RestaurantProfileController::class, 'update']);
    Route::post('/profile/logo', [RestaurantProfileController::class, 'uploadLogo']);
    Route::post('/profile/cover', [RestaurantProfileController::class, 'uploadCover']);
    Route::post('/toggle-status', [RestaurantProfileController::class, 'toggleStatus']);

    Route::post('/categories/reorder', [RestaurantCategoryController::class, 'reorder']);
    Route::apiResource('/categories', RestaurantCategoryController::class)->except(['show']);

    Route::post('/menu-items/{id}/toggle-availability', [RestaurantMenuItemController::class, 'toggleAvailability']);
    Route::apiResource('/menu-items', RestaurantMenuItemController::class);

    Route::get('/orders', [RestaurantOrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [RestaurantOrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/update-status', [RestaurantOrderController::class, 'updateStatus']);

    Route::get('/earnings', [RestaurantEarningsController::class, 'summary']);
    Route::get('/earnings/history', [RestaurantEarningsController::class, 'history']);
});

// Driver
Route::middleware(['auth:sanctum', 'role:driver'])->prefix('driver')->group(function () {
    Route::get('/orders/available', [DriverOrderController::class, 'available']);
    Route::post('/orders/{orderNumber}/accept', [DriverOrderController::class, 'accept']);
    Route::get('/orders', [DriverOrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [DriverOrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/update-status', [DriverOrderController::class, 'updateStatus']);
    Route::post('/location', [DriverLocationController::class, 'update']);
    Route::get('/location', [DriverLocationController::class, 'show']);
    Route::get('/earnings', [DriverEarningsController::class, 'summary']);
    Route::get('/earnings/history', [DriverEarningsController::class, 'history']);
    Route::get('/profile', [DriverProfileController::class, 'show']);
    Route::put('/profile', [DriverProfileController::class, 'update']);
    Route::put('/profile/password', [DriverProfileController::class, 'changePassword']);
});
