import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'app/app.dart';
import 'core/constants/dev_host.dart';
import 'core/services/notification_service.dart';
import 'core/services/storage_service.dart';
import 'presentation/cart/cart_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await StorageService.instance.init();
  await DevHost.load();
  Get.put(CartController(), permanent: true);
  runApp(const FoodDeliveryApp());
  // Don't block startup — FCM is optional until google-services.json is added
  NotificationService.instance.init();
}
