import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../widgets/common/empty_state_widget.dart';
import '../../widgets/common/error_widget.dart';
import '../../widgets/common/loading_widget.dart';
import 'order_list_controller.dart';

class OrderListScreen extends GetView<OrderListController> {
  const OrderListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: Obx(() {
        if (controller.isLoading.value) return const LoadingWidget();
        if (controller.errorMessage.isNotEmpty) {
          return ErrorWidgetView(message: controller.errorMessage.value, onRetry: controller.fetchOrders);
        }
        if (controller.orders.isEmpty) {
          return const EmptyStateWidget(
            title: 'No orders yet',
            subtitle: 'Your order history will appear here',
            icon: Icons.receipt_long_outlined,
          );
        }
        return RefreshIndicator(
          onRefresh: controller.fetchOrders,
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: controller.orders.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (_, index) {
              final order = controller.orders[index];
              return Card(
                child: ListTile(
                  onTap: () => controller.openOrder(order),
                  title: Text('#${order.orderNumber}', style: AppTheme.heading4),
                  subtitle: Text(
                    '${order.restaurant?.name ?? 'Restaurant'} • ${Helpers.formatDate(order.createdAt)}',
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(Helpers.formatCurrency(order.total), style: AppTheme.heading4),
                      _StatusChip(status: order.status),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      }),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color = AppColors.primary;
    if (status == 'delivered') color = AppColors.success;
    if (status == 'cancelled') color = AppColors.error;
    return Text(
      status.replaceAll('_', ' ').toUpperCase(),
      style: AppTheme.caption.copyWith(color: color, fontWeight: FontWeight.w600),
    );
  }
}
