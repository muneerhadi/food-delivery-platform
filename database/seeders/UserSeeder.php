<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@foodapp.com',
                'password' => 'Admin@123456',
                'role' => 'super_admin',
            ],
            [
                'name' => 'Restaurant Owner',
                'email' => 'owner@foodapp.com',
                'password' => 'Owner@123456',
                'role' => 'restaurant_owner',
            ],
            [
                'name' => 'Driver',
                'email' => 'driver@foodapp.com',
                'password' => 'Driver@123456',
                'role' => 'driver',
            ],
            [
                'name' => 'Customer',
                'email' => 'customer@foodapp.com',
                'password' => 'Customer@123456',
                'role' => 'customer',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
