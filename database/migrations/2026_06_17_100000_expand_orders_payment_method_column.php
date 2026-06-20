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
            DB::statement(
                "ALTER TABLE orders MODIFY payment_method VARCHAR(20) NOT NULL DEFAULT 'cash'"
            );

            return;
        }

        DB::statement('PRAGMA foreign_keys=OFF');

        if (Schema::hasTable('orders') && Schema::hasTable('orders_legacy')) {
            Schema::drop('orders');
        }

        DB::statement('DROP INDEX IF EXISTS orders_order_number_unique');

        if (! Schema::hasTable('orders_legacy') && Schema::hasTable('orders')) {
            Schema::rename('orders', 'orders_legacy');
        }

        if (! Schema::hasTable('orders_legacy')) {
            DB::statement('PRAGMA foreign_keys=ON');

            return;
        }

        $this->createOrdersTable();
        $this->copyOrdersData();
        Schema::drop('orders_legacy');

        DB::statement('PRAGMA foreign_keys=ON');
    }

    public function down(): void
    {
        // No rollback — payment methods stay expanded.
    }

    private function createOrdersTable(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained();
            $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('promo_code_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'ready',
                'picked_up',
                'on_the_way',
                'delivered',
                'cancelled',
            ])->default('pending');
            $table->decimal('subtotal', 8, 2);
            $table->decimal('delivery_fee', 8, 2)->default(0);
            $table->decimal('discount_amount', 8, 2)->default(0);
            $table->decimal('total', 8, 2);
            $table->string('payment_method', 20)->default('cash');
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->json('delivery_address');
            $table->text('notes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->timestamps();
        });
    }

    private function copyOrdersData(): void
    {
        DB::statement('
            INSERT INTO orders (
                id, order_number, customer_id, restaurant_id, driver_id, promo_code_id,
                status, subtotal, delivery_fee, discount_amount, total,
                payment_method, payment_status, delivery_address, notes,
                confirmed_at, picked_up_at, delivered_at, cancelled_at, cancellation_reason,
                created_at, updated_at
            )
            SELECT
                id, order_number, customer_id, restaurant_id, driver_id, promo_code_id,
                status, subtotal, delivery_fee, discount_amount, total,
                payment_method, payment_status, delivery_address, notes,
                confirmed_at, picked_up_at, delivered_at, cancelled_at, cancellation_reason,
                created_at, updated_at
            FROM orders_legacy
        ');
    }
};
