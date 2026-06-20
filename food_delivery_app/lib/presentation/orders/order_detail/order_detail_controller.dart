import 'package:get/get.dart';

import '../../../core/network/api_exception.dart';
import '../../../data/models/order_model.dart';
import '../../../data/repositories/order_repository.dart';

class OrderDetailController extends GetxController {
  final OrderRepository _repository = Get.find();

  final order = Rxn<OrderModel>();
  final isLoading = true.obs;
  final errorMessage = ''.obs;

  late final String orderNumber;

  @override
  void onInit() {
    super.onInit();
    orderNumber = Get.arguments as String;
    loadOrder();
  }

  Future<void> loadOrder() async {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      order.value = await _repository.getOrder(orderNumber);
    } on ApiException catch (e) {
      errorMessage.value = e.message;
    } catch (_) {
      errorMessage.value = 'Failed to load order';
    } finally {
      isLoading.value = false;
    }
  }
}
