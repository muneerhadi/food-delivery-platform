import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';

import '../../app/routes/app_routes.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../widgets/common/loading_widget.dart';
import '../widgets/common/network_image_widget.dart';
import '../cart/home_tab_controller.dart';
import 'profile_controller.dart';

class ProfileScreen extends GetView<ProfileController> {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Obx(() {
        if (controller.isLoading.value) return const LoadingWidget();
        final user = controller.user.value;
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              CircleAvatar(
                radius: 48,
                backgroundColor: AppColors.surface,
                child: user?.avatar != null
                    ? ClipOval(child: NetworkImageWidget(url: user!.avatar, width: 96, height: 96))
                    : const Icon(Icons.person, size: 48, color: AppColors.primary),
              ),
              const SizedBox(height: 12),
              Text(user?.name ?? '', style: AppTheme.heading2),
              Text(user?.email ?? '', style: AppTheme.caption),
              const SizedBox(height: 24),
              Row(
                children: [
                  _statCard('Total', controller.totalOrders.value),
                  _statCard('Delivered', controller.deliveredOrders.value),
                  _statCard('Cancelled', controller.cancelledOrders.value),
                ],
              ),
              const SizedBox(height: 24),
              _menuTile(Icons.location_on_outlined, 'My Addresses', () => Get.toNamed(AppRoutes.addressList)),
              _menuTile(Icons.lock_outline, 'Change Password', () => _showChangePassword(context)),
              _menuTile(Icons.notifications_outlined, 'Notifications', () {
                Get.find<HomeTabController>().changeTab(3);
              }),
              _menuTile(Icons.info_outline, 'About', () {
                Get.dialog(AlertDialog(
                  title: const Text('Food Delivery'),
                  content: const Text('Customer app v1.0.0\nOrder food from your favorite restaurants.'),
                  actions: [TextButton(onPressed: Get.back, child: const Text('OK'))],
                ));
              }),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.error),
                title: const Text('Logout', style: TextStyle(color: AppColors.error)),
                onTap: controller.logout,
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _statCard(String label, int value) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Text('$value', style: AppTheme.heading2.copyWith(color: AppColors.primary)),
              Text(label, style: AppTheme.caption),
            ],
          ),
        ),
      ),
    );
  }

  Widget _menuTile(IconData icon, String title, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(leading: Icon(icon, color: AppColors.primary), title: Text(title), trailing: const Icon(Icons.chevron_right), onTap: onTap),
    );
  }

  void _showChangePassword(BuildContext context) {
    final current = TextEditingController();
    final password = TextEditingController();
    final confirm = TextEditingController();
    Get.dialog(
      AlertDialog(
        title: const Text('Change Password'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: current, obscureText: true, decoration: const InputDecoration(labelText: 'Current Password')),
            TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'New Password')),
            TextField(controller: confirm, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm Password')),
          ],
        ),
        actions: [
          TextButton(onPressed: Get.back, child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              if (password.text.length < 8) {
                Fluttertoast.showToast(msg: 'Password must be at least 8 characters');
                return;
              }
              if (password.text != confirm.text) {
                Fluttertoast.showToast(msg: 'Passwords do not match');
                return;
              }
              try {
                await controller.changePassword(
                  currentPassword: current.text,
                  password: password.text,
                );
                Get.back();
              } catch (e) {
                Fluttertoast.showToast(msg: 'Failed to change password');
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
