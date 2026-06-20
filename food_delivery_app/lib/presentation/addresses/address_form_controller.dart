import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../core/network/api_exception.dart';
import '../../../data/models/address_model.dart';
import '../../../data/repositories/address_repository.dart';

class AddressFormController extends GetxController {
  final AddressRepository _repository = Get.find();

  final labelController = TextEditingController();
  final addressController = TextEditingController();
  final cityController = TextEditingController();
  final selectedLabel = 'Home'.obs;
  final lat = Rxn<double>();
  final lng = Rxn<double>();
  final isSaving = false.obs;

  AddressModel? editing;

  static const labels = ['Home', 'Work', 'Other'];

  @override
  void onInit() {
    super.onInit();
    editing = Get.arguments as AddressModel?;
    if (editing != null) {
      labelController.text = editing!.label;
      addressController.text = editing!.address;
      cityController.text = editing!.city ?? '';
      selectedLabel.value = editing!.label;
      lat.value = editing!.lat;
      lng.value = editing!.lng;
    }
  }

  LatLng get mapCenter {
    if (lat.value != null && lng.value != null) {
      return LatLng(lat.value!, lng.value!);
    }
    return const LatLng(37.7749, -122.4194);
  }

  Future<void> useMyLocation() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      await Geolocator.requestPermission();
    }
    try {
      final position = await Geolocator.getCurrentPosition();
      lat.value = position.latitude;
      lng.value = position.longitude;
      Fluttertoast.showToast(msg: 'Location updated');
    } catch (_) {
      Fluttertoast.showToast(msg: 'Could not get location');
    }
  }

  void onMapTap(LatLng position) {
    lat.value = position.latitude;
    lng.value = position.longitude;
  }

  Future<void> save() async {
    if (addressController.text.trim().isEmpty) {
      Fluttertoast.showToast(msg: 'Address is required');
      return;
    }
    isSaving.value = true;
    final payload = {
      'label': selectedLabel.value,
      'address': addressController.text.trim(),
      'city': cityController.text.trim().isEmpty ? null : cityController.text.trim(),
      'lat': lat.value,
      'lng': lng.value,
      'is_default': editing?.isDefault ?? false,
    };
    try {
      if (editing != null) {
        await _repository.updateAddress(editing!.id, payload);
      } else {
        await _repository.createAddress(payload);
      }
      Fluttertoast.showToast(msg: 'Address saved');
      Get.back();
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    } finally {
      isSaving.value = false;
    }
  }

  @override
  void onClose() {
    labelController.dispose();
    addressController.dispose();
    cityController.dispose();
    super.onClose();
  }
}
