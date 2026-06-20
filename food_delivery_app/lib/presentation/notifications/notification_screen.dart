import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../../core/utils/helpers.dart';
import '../widgets/common/empty_state_widget.dart';
import '../widgets/common/error_widget.dart';
import '../widgets/common/loading_widget.dart';
import 'notification_controller.dart';

class NotificationScreen extends GetView<NotificationController> {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: controller.markAllRead,
            child: const Text('Mark All Read'),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) return const LoadingWidget();
        if (controller.errorMessage.isNotEmpty) {
          return ErrorWidgetView(message: controller.errorMessage.value, onRetry: controller.fetchNotifications);
        }
        if (controller.notifications.isEmpty) {
          return const EmptyStateWidget(
            title: 'No notifications',
            subtitle: 'Updates about your orders will appear here',
            icon: Icons.notifications_none,
          );
        }
        return RefreshIndicator(
          onRefresh: controller.fetchNotifications,
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: controller.notifications.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, index) {
              final notification = controller.notifications[index];
              return InkWell(
                onTap: () => controller.markAsRead(notification),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border(
                      left: BorderSide(
                        color: notification.isRead ? Colors.transparent : AppColors.primary,
                        width: 4,
                      ),
                    ),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4),
                    ],
                  ),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _iconColor(notification.type).withValues(alpha: 0.15),
                      child: Icon(_iconForType(notification.type), color: _iconColor(notification.type), size: 20),
                    ),
                    title: Text(notification.title, style: AppTheme.heading4),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(notification.body, style: AppTheme.body),
                        const SizedBox(height: 4),
                        Text(Helpers.timeAgo(notification.createdAt), style: AppTheme.caption),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        );
      }),
    );
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'order':
        return Icons.receipt_long;
      case 'promo':
        return Icons.local_offer;
      default:
        return Icons.notifications;
    }
  }

  Color _iconColor(String type) {
    switch (type) {
      case 'order':
        return AppColors.primary;
      case 'promo':
        return AppColors.warning;
      default:
        return AppColors.textSecondary;
    }
  }
}
