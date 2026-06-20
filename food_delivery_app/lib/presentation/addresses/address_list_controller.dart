import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';

import '../../../app/routes/app_routes.dart';
import '../../../core/network/api_exception.dart';
import '../../../data/models/address_model.dart';
import '../../../data/repositories/address_repository.dart';

class AddressListController extends GetxController {
  final AddressRepository _repository = Get.find();

  final addresses = <AddressModel>[].obs;
  final isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    loadAddresses();
  }

  Future<void> loadAddresses() async {
    isLoading.value = true;
    try {
      addresses.assignAll(await _repository.getAddresses());
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> deleteAddress(int id) async {
    try {
      await _repository.deleteAddress(id);
      addresses.removeWhere((a) => a.id == id);
      Fluttertoast.showToast(msg: 'Address deleted');
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    }
  }

  Future<void> setDefault(AddressModel address) async {
    try {
      await _repository.updateAddress(address.id, {...address.toRequestJson(), 'is_default': true});
      await loadAddresses();
      Fluttertoast.showToast(msg: 'Default address updated');
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    }
  }

  void openForm([AddressModel? address]) {
    Get.toNamed(AppRoutes.addressForm, arguments: address)?.then((_) => loadAddresses());
  }
}
