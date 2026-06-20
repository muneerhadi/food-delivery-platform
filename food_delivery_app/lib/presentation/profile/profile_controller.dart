import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';

import '../../../app/routes/app_routes.dart';
import '../../../core/network/api_exception.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../data/repositories/order_repository.dart';
import '../../../data/repositories/profile_repository.dart';

class ProfileController extends GetxController {
  final AuthRepository _authRepository = Get.find();
  final ProfileRepository _profileRepository = Get.find();
  final OrderRepository _orderRepository = Get.find();

  final user = Rxn<UserModel>();
  final totalOrders = 0.obs;
  final deliveredOrders = 0.obs;
  final cancelledOrders = 0.obs;
  final isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    loadProfile();
  }

  Future<void> loadProfile() async {
    isLoading.value = true;
    try {
      user.value = await _profileRepository.getProfile();
      final orders = await _orderRepository.getOrders();
      totalOrders.value = orders.total;
      deliveredOrders.value = orders.items.where((o) => o.status == 'delivered').length;
      cancelledOrders.value = orders.items.where((o) => o.status == 'cancelled').length;
    } on ApiException catch (e) {
      user.value = await _authRepository.getCachedUser();
      Fluttertoast.showToast(msg: e.message);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    try {
      await _authRepository.logout();
    } finally {
      Get.offAllNamed(AppRoutes.login);
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String password,
  }) async {
    await _profileRepository.changePassword(
      currentPassword: currentPassword,
      password: password,
    );
    Fluttertoast.showToast(msg: 'Password updated');
  }
}
