import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';

import '../../../core/network/api_exception.dart';
import '../../../data/models/notification_model.dart';
import '../../../data/repositories/profile_repository.dart';

class NotificationController extends GetxController {
  final ProfileRepository _repository = Get.find();

  final notifications = <NotificationModel>[].obs;
  final isLoading = true.obs;
  final errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      final result = await _repository.getNotifications();
      notifications.assignAll(result.items);
    } on ApiException catch (e) {
      errorMessage.value = e.message;
    } catch (_) {
      errorMessage.value = 'Failed to load notifications';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> markAsRead(NotificationModel notification) async {
    if (notification.isRead) return;
    try {
      await _repository.markNotificationRead(notification.id);
      final index = notifications.indexWhere((n) => n.id == notification.id);
      if (index >= 0) {
        notifications[index] = notification.copyWith(isRead: true);
      }
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    }
  }

  Future<void> markAllRead() async {
    try {
      await _repository.markAllNotificationsRead();
      notifications.assignAll(
        notifications.map((n) => n.copyWith(isRead: true)).toList(),
      );
      Fluttertoast.showToast(msg: 'All notifications marked as read');
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    }
  }
}
