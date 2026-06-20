<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            return;
        }

        $orderItemsSql = DB::selectOne(
            "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'order_items'"
        );

        if (! $orderItemsSql || ! str_contains($orderItemsSql->sql, 'orders_legacy')) {
            return;
        }

        DB::statement('PRAGMA foreign_keys=OFF');

        Schema::rename('order_items', 'order_items_legacy');

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained();
            $table->string('name');
            $table->decimal('price', 8, 2);
            $table->integer('quantity');
            $table->decimal('total', 8, 2);
            $table->timestamps();
        });

        DB::statement('
            INSERT INTO order_items (
                id, order_id, menu_item_id, name, price, quantity, total, created_at, updated_at
            )
            SELECT
                id, order_id, menu_item_id, name, price, quantity, total, created_at, updated_at
            FROM order_items_legacy
            WHERE order_id IN (SELECT id FROM orders)
        ');

        Schema::drop('order_items_legacy');

        DB::statement('PRAGMA foreign_keys=ON');
    }

    public function down(): void
    {
        // Irreversible repair migration.
    }
};
