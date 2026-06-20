import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../app/routes/app_routes.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../widgets/common/error_widget.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/order/order_item_tile.dart';
import '../../widgets/order/order_status_timeline.dart';
import 'order_detail_controller.dart';

class OrderDetailScreen extends GetView<OrderDetailController> {
  const OrderDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: Obx(() {
        if (controller.isLoading.value) return const LoadingWidget();
        if (controller.errorMessage.isNotEmpty) {
          return ErrorWidgetView(message: controller.errorMessage.value, onRetry: controller.loadOrder);
        }
        final order = controller.order.value!;
        final canTrack = !['delivered', 'cancelled'].contains(order.status);

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('#${order.orderNumber}', style: AppTheme.heading2),
              Text(Helpers.formatDate(order.createdAt), style: AppTheme.caption),
              const SizedBox(height: 16),
              OrderStatusTimeline(currentStatus: order.status),
              const SizedBox(height: 16),
              if (canTrack)
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => Get.toNamed(AppRoutes.orderTracking, arguments: order.orderNumber),
                    icon: const Icon(Icons.map_outlined),
                    label: const Text('Track Order'),
                  ),
                ),
              const SizedBox(height: 24),
              Text('Items', style: AppTheme.heading3),
              ...order.items.map((item) => OrderItemTile(item: item)),
              const Divider(),
              _row('Subtotal', order.subtotal),
              _row('Delivery', order.deliveryFee),
              if (order.discountAmount > 0) _row('Discount', -order.discountAmount),
              _row('Total', order.total, bold: true),
            ],
          ),
        );
      }),
    );
  }

  Widget _row(String label, double amount, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: bold ? AppTheme.heading4 : AppTheme.body),
          Text(Helpers.formatCurrency(amount), style: bold ? AppTheme.heading3 : AppTheme.body),
        ],
      ),
    );
  }
}
