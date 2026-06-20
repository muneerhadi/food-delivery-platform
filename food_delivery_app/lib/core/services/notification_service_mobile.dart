import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';

import '../../app/routes/app_routes.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
}

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  FirebaseMessaging? _messaging;
  bool _firebaseReady = false;

  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  Future<void> init() async {
    try {
      await Firebase.initializeApp();
      _messaging = FirebaseMessaging.instance;
      _firebaseReady = true;

      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const initSettings = InitializationSettings(android: androidSettings);
      await _localNotifications.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (details) => _handleNotificationTap(details.payload),
      );

      await _messaging!.requestPermission();
      await _registerTokenWithBackend();

      _messaging!.onTokenRefresh.listen((_) => _registerTokenWithBackend());
      FirebaseMessaging.onMessage.listen(_showForegroundNotification);
      FirebaseMessaging.onMessageOpenedApp.listen((message) => _handleRemoteMessageNavigation(message.data));
    } catch (e) {
      if (kDebugMode) {
        print('Firebase init skipped (add google-services.json to enable push): $e');
      }
    }
  }

  Future<void> _registerTokenWithBackend() async {
    if (!_firebaseReady || _messaging == null) return;

    try {
      final token = await _messaging!.getToken();
      if (token == null || token.isEmpty) return;

      await DioClient.instance.post(
        ApiConstants.registerFcmToken,
        data: {
          'token': token,
          'platform': defaultTargetPlatform == TargetPlatform.iOS ? 'ios' : 'android',
        },
      );

      if (kDebugMode) {
        print('FCM token registered');
      }
    } catch (e) {
      if (kDebugMode) {
        print('FCM token registration failed: $e');
      }
    }
  }

  void _showForegroundNotification(RemoteMessage message) {
    final notification = message.notification;
    final title = notification?.title ?? message.data['title']?.toString() ?? 'Notification';
    final body = notification?.body ?? message.data['body']?.toString() ?? '';

    _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'food_delivery',
          'Food Delivery',
          importance: Importance.high,
          priority: Priority.high,
        ),
      ),
      payload: message.data['order_number']?.toString(),
    );

    Fluttertoast.showToast(msg: '$title: $body');
  }

  void _handleNotificationTap(String? payload) {
    if (payload != null && payload.isNotEmpty) {
      Get.toNamed(AppRoutes.orderDetail, arguments: payload);
    }
  }

  void _handleRemoteMessageNavigation(Map<String, dynamic> data) {
    final orderNumber = data['order_number']?.toString();
    if (orderNumber != null && orderNumber.isNotEmpty) {
      Get.toNamed(AppRoutes.orderDetail, arguments: orderNumber);
    }
  }
}
