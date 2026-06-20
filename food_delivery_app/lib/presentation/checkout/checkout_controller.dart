import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';

import '../../../app/routes/app_routes.dart';
import '../../../core/constants/payment_methods.dart';
import '../../../core/network/api_exception.dart';
import '../../../data/models/address_model.dart';
import '../../../data/repositories/address_repository.dart';
import '../../../data/repositories/order_repository.dart';
import '../cart/cart_controller.dart';

class CheckoutController extends GetxController {
  final AddressRepository _addressRepository = Get.find();
  final OrderRepository _orderRepository = Get.find();
  final CartController cart = Get.find<CartController>();

  final addresses = <AddressModel>[].obs;
  final selectedAddress = Rxn<AddressModel>();
  final notesController = TextEditingController();
  final cardNumberController = TextEditingController();
  final expiryController = TextEditingController();
  final cvvController = TextEditingController();
  final hesabpayController = TextEditingController();
  final isLoading = false.obs;
  final isLoadingAddresses = true.obs;

  String get paymentMethod => cart.selectedPaymentMethod.value;

  @override
  void onInit() {
    super.onInit();
    loadAddresses();
  }

  Future<void> loadAddresses() async {
    isLoadingAddresses.value = true;
    try {
      final list = await _addressRepository.getAddresses();
      addresses.assignAll(list);
      selectedAddress.value = list.firstWhereOrNull((a) => a.isDefault) ?? list.firstOrNull;
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    } finally {
      isLoadingAddresses.value = false;
    }
  }

  bool _validatePaymentDetails() {
    final method = paymentMethod;

    if (method == PaymentMethods.mastercard || method == PaymentMethods.visa) {
      final cardNumber = cardNumberController.text.replaceAll(RegExp(r'\s+'), '');
      final expiry = expiryController.text.trim();
      final cvv = cvvController.text.trim();

      if (cardNumber.length < 16) {
        Fluttertoast.showToast(msg: 'Enter a valid 16-digit card number');
        return false;
      }
      if (!RegExp(r'^\d{2}/\d{2}$').hasMatch(expiry)) {
        Fluttertoast.showToast(msg: 'Enter expiry as MM/YY');
        return false;
      }
      if (cvv.length < 3) {
        Fluttertoast.showToast(msg: 'Enter a valid CVV');
        return false;
      }
    }

    if (method == PaymentMethods.hesabpay) {
      final phone = hesabpayController.text.replaceAll(RegExp(r'\s+'), '');
      if (phone.length < 10) {
        Fluttertoast.showToast(msg: 'Enter your HesabPay phone number');
        return false;
      }
    }

    return true;
  }

  Future<void> placeOrder() async {
    final address = selectedAddress.value;
    if (address == null) {
      Fluttertoast.showToast(msg: 'Please select a delivery address');
      return;
    }
    if (cart.cartItems.isEmpty) {
      Fluttertoast.showToast(msg: 'Cart is empty');
      return;
    }
    if (!_validatePaymentDetails()) return;

    isLoading.value = true;
    try {
      if (paymentMethod == PaymentMethods.mastercard ||
          paymentMethod == PaymentMethods.visa ||
          paymentMethod == PaymentMethods.hesabpay) {
        await Future.delayed(const Duration(milliseconds: 800));
      }

      final order = await _orderRepository.placeOrder(
        restaurantId: cart.currentRestaurantId!,
        items: cart.cartItems
            .map((c) => {'menu_item_id': c.item.id, 'quantity': c.quantity})
            .toList(),
        deliveryAddress: {
          'label': address.label,
          'address': address.address,
          'city': address.city ?? '',
          'lat': address.lat,
          'lng': address.lng,
        },
        paymentMethod: paymentMethod,
        notes: notesController.text.trim().isEmpty ? null : notesController.text.trim(),
        promoCode: cart.appliedPromoCode,
      );
      final orderNumber = order.orderNumber;
      cart.clearCart();
      Fluttertoast.showToast(msg: 'Order placed successfully!');
      Get.offAllNamed(AppRoutes.home);
      Get.toNamed(AppRoutes.orderDetail, arguments: orderNumber);
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    notesController.dispose();
    cardNumberController.dispose();
    expiryController.dispose();
    cvvController.dispose();
    hesabpayController.dispose();
    super.onClose();
  }
}
