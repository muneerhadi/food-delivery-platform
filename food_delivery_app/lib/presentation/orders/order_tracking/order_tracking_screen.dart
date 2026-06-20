import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../widgets/common/error_widget.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/network_image_widget.dart';
import '../../widgets/order/order_status_timeline.dart';
import 'order_tracking_controller.dart';

class OrderTrackingScreen extends GetView<OrderTrackingController> {
  const OrderTrackingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Track Order')),
      body: Obx(() {
        if (controller.isLoading.value) return const LoadingWidget();
        if (controller.errorMessage.isNotEmpty) {
          return ErrorWidgetView(message: controller.errorMessage.value, onRetry: controller.fetchTracking);
        }

        return Column(
          children: [
            Expanded(
              flex: 6,
              child: GoogleMap(
                initialCameraPosition: CameraPosition(
                  target: controller.cameraTarget,
                  zoom: 14,
                ),
                markers: controller.markers,
                onMapCreated: controller.onMapCreated,
                myLocationButtonEnabled: true,
                myLocationEnabled: true,
              ),
            ),
            Expanded(
              flex: 4,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, -2))],
                ),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      OrderStatusTimeline(currentStatus: controller.status.value),
                      const SizedBox(height: 16),
                      if (controller.driverName.value.isNotEmpty) ...[
                        Text('Your Driver', style: AppTheme.heading3),
                        const SizedBox(height: 8),
                        Card(
                          child: ListTile(
                            leading: CircleAvatar(
                              child: controller.driverAvatar.value != null
                                  ? ClipOval(
                                      child: NetworkImageWidget(
                                        url: controller.driverAvatar.value,
                                        width: 40,
                                        height: 40,
                                      ),
                                    )
                                  : const Icon(Icons.person),
                            ),
                            title: Text(controller.driverName.value),
                            subtitle: Text(controller.driverPhone.value),
                            trailing: IconButton(
                              icon: const Icon(Icons.phone, color: AppColors.primary),
                              onPressed: () => _callDriver(controller.driverPhone.value),
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 8),
                      Text(
                        'ETA: ~${controller.status.value == 'on_the_way' ? '15' : '30'} min',
                        style: AppTheme.body.copyWith(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  Future<void> _callDriver(String phone) async {
    if (phone.isEmpty) return;
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
