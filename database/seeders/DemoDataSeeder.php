<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\PromoCode;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::where('email', 'owner@foodapp.com')->first();

        $restaurant = Restaurant::updateOrCreate(
            ['slug' => 'pizza-palace'],
            [
                'user_id' => $owner->id,
                'name' => 'Pizza Palace',
                'description' => 'Best pizza in town',
                'address' => '123 Main St',
                'city' => 'New York',
                'lat' => 40.7128000,
                'lng' => -74.0060000,
                'phone' => '+1234567890',
                'minimum_order' => 10.00,
                'delivery_fee' => 3.50,
                'delivery_time' => 30,
                'is_open' => true,
                'is_approved' => true,
                'is_active' => true,
                'rating' => 4.50,
                'total_reviews' => 12,
            ]
        );

        $category = Category::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Pizzas'],
            ['sort_order' => 1, 'is_active' => true]
        );

        MenuItem::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Margherita'],
            [
                'category_id' => $category->id,
                'description' => 'Classic tomato and mozzarella',
                'price' => 12.99,
                'is_available' => true,
                'sort_order' => 1,
            ]
        );

        MenuItem::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Pepperoni'],
            [
                'category_id' => $category->id,
                'description' => 'Spicy pepperoni pizza',
                'price' => 14.99,
                'sale_price' => 12.99,
                'is_available' => true,
                'sort_order' => 2,
            ]
        );

        PromoCode::updateOrCreate(
            ['code' => 'SAVE10'],
            [
                'description' => '10% off your order',
                'type' => 'percentage',
                'value' => 10.00,
                'min_order_amount' => 15.00,
                'max_discount_amount' => 5.00,
                'is_active' => true,
            ]
        );
    }
}
