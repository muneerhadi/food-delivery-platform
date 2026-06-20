import 'package:flutter/foundation.dart';
import 'package:get/get.dart';

import '../../../app/routes/app_routes.dart';
import '../../../core/network/api_exception.dart';
import '../../../data/models/order_model.dart';
import '../../../data/repositories/order_repository.dart';

class OrderListController extends GetxController {
  final OrderRepository _repository = Get.find();

  final orders = <OrderModel>[].obs;
  final isLoading = true.obs;
  final errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchOrders();
  }

  Future<void> fetchOrders() async {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      final result = await _repository.getOrders();
      orders.assignAll(result.items);
    } on ApiException catch (e) {
      errorMessage.value = e.message;
    } catch (e) {
      errorMessage.value = 'Failed to load orders';
      if (kDebugMode) {
        print('Order list parse error: $e');
      }
    } finally {
      isLoading.value = false;
    }
  }

  void openOrder(OrderModel order) {
    Get.toNamed(AppRoutes.orderDetail, arguments: order.orderNumber);
  }

  void trackOrder(OrderModel order) {
    Get.toNamed(AppRoutes.orderTracking, arguments: order.orderNumber);
  }
}
