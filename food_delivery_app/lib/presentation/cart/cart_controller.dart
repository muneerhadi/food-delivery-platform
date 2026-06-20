import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../data/models/menu_item_model.dart';
import '../../core/constants/payment_methods.dart';
import 'cart_item.dart';

class CartController extends GetxService {
  final cartItems = <CartItem>[].obs;
  final selectedPaymentMethod = PaymentMethods.cash.obs;
  int? currentRestaurantId;
  String? currentRestaurantName;
  double deliveryFee = 0;
  double discountAmount = 0;
  String? appliedPromoCode;

  int get cartItemCount => cartItems.fold(0, (sum, item) => sum + item.quantity);

  double get cartSubtotal =>
      cartItems.fold(0.0, (sum, item) => sum + item.lineTotal);

  double get cartTotal => cartSubtotal + deliveryFee - discountAmount;

  void setRestaurant(int restaurantId, String name, double fee) {
    currentRestaurantId = restaurantId;
    currentRestaurantName = name;
    deliveryFee = fee;
  }

  void addItem(MenuItemModel item, {required int restaurantId, required String restaurantName, required double deliveryFee}) {
    if (currentRestaurantId != null && currentRestaurantId != restaurantId) {
      Get.dialog(
        AlertDialog(
          title: const Text('Different Restaurant'),
          content: const Text('Your cart contains items from another restaurant. Clear cart and add this item?'),
          actions: [
            TextButton(onPressed: Get.back, child: const Text('Cancel')),
            TextButton(
              onPressed: () {
                clearCart();
                setRestaurant(restaurantId, restaurantName, deliveryFee);
                _addItemInternal(item);
                Get.back();
              },
              child: const Text('Clear & Add'),
            ),
          ],
        ),
      );
      return;
    }
    setRestaurant(restaurantId, restaurantName, deliveryFee);
    _addItemInternal(item);
  }

  void _addItemInternal(MenuItemModel item) {
    final index = cartItems.indexWhere((c) => c.item.id == item.id);
    if (index >= 0) {
      cartItems[index].quantity++;
      cartItems.refresh();
    } else {
      cartItems.add(CartItem(item: item));
    }
  }

  void removeItem(int itemId) {
    final index = cartItems.indexWhere((c) => c.item.id == itemId);
    if (index < 0) return;
    if (cartItems[index].quantity > 1) {
      cartItems[index].quantity--;
      cartItems.refresh();
    } else {
      cartItems.removeAt(index);
    }
    if (cartItems.isEmpty) {
      currentRestaurantId = null;
      appliedPromoCode = null;
      discountAmount = 0;
    }
  }

  void updateQty(int itemId, int qty) {
    final index = cartItems.indexWhere((c) => c.item.id == itemId);
    if (index < 0) return;
    if (qty <= 0) {
      cartItems.removeAt(index);
    } else {
      cartItems[index].quantity = qty;
      cartItems.refresh();
    }
  }

  void applyPromo(String code, double discount) {
    appliedPromoCode = code;
    discountAmount = discount;
  }

  void clearPromo() {
    appliedPromoCode = null;
    discountAmount = 0;
  }

  void clearCart() {
    cartItems.clear();
    currentRestaurantId = null;
    currentRestaurantName = null;
    deliveryFee = 0;
    discountAmount = 0;
    appliedPromoCode = null;
  }
}
