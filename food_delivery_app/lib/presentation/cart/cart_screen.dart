import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';

import '../../app/routes/app_routes.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../../core/constants/payment_methods.dart';
import '../../core/network/api_exception.dart';
import '../../core/utils/helpers.dart';
import '../../data/repositories/restaurant_repository.dart';
import '../widgets/common/custom_button.dart';
import '../widgets/common/empty_state_widget.dart';
import '../widgets/order/cart_item_tile.dart';
import 'cart_controller.dart';
import 'home_tab_controller.dart';
import 'widgets/payment_method_selector.dart';

/// Cart tab body — no nested [Scaffold] so it works inside [HomeScreen].
class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  final CartController cart = Get.find<CartController>();
  final promoController = TextEditingController();
  bool isApplyingPromo = false;

  @override
  void dispose() {
    promoController.dispose();
    super.dispose();
  }

  Future<void> _applyPromo() async {
    final code = promoController.text.trim();
    if (code.isEmpty) return;

    setState(() => isApplyingPromo = true);
    try {
      final repo = Get.find<RestaurantRepository>();
      final promo = await repo.validatePromo(code, cart.cartSubtotal);
      cart.applyPromo(promo.code, promo.discountAmount);
      Fluttertoast.showToast(msg: 'Promo applied!');
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    } finally {
      if (mounted) setState(() => isApplyingPromo = false);
    }
  }

  void _goToCheckout() {
    if (cart.cartItems.isEmpty) {
      Fluttertoast.showToast(msg: 'Add items to your cart first');
      return;
    }
    Get.toNamed(AppRoutes.checkout);
  }

  void _goToHome() {
    if (Get.isRegistered<HomeTabController>()) {
      Get.find<HomeTabController>().goToHome();
    } else {
      Get.offAllNamed(AppRoutes.home);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final hasItems = cart.cartItems.isNotEmpty;

      return ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          if (!hasItems)
            const SizedBox(
              height: 220,
              child: EmptyStateWidget(
                title: 'Your cart is empty',
                subtitle: 'Add items from a restaurant to get started',
                icon: Icons.shopping_cart_outlined,
              ),
            )
          else
            ...cart.cartItems.map((item) => CartItemTile(
                  cartItem: item,
                  onIncrement: () => cart.addItem(
                    item.item,
                    restaurantId: cart.currentRestaurantId!,
                    restaurantName: cart.currentRestaurantName!,
                    deliveryFee: cart.deliveryFee,
                  ),
                  onDecrement: () => cart.removeItem(item.item.id),
                  onDelete: () => cart.updateQty(item.item.id, 0),
                )),
          if (!hasItems) ...[
            CustomButton(label: 'Browse Restaurants', onPressed: _goToHome),
            const SizedBox(height: 24),
          ],
          if (hasItems) ...[
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: TextField(
                    controller: promoController,
                    decoration: const InputDecoration(hintText: 'Promo code'),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: isApplyingPromo ? null : _applyPromo,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(0, 52),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  child: isApplyingPromo
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Apply'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _summaryRow('Subtotal', cart.cartSubtotal),
            _summaryRow('Delivery', cart.deliveryFee),
            if (cart.discountAmount > 0)
              _summaryRow('Discount', -cart.discountAmount, color: Colors.green),
            const Divider(),
            _summaryRow('Total', cart.cartTotal, bold: true),
            const SizedBox(height: 24),
          ],
          PaymentMethodSelector(
            selectedMethod: cart.selectedPaymentMethod,
            onSelected: (method) => cart.selectedPaymentMethod.value = method,
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              'Selected: ${PaymentMethods.labelFor(cart.selectedPaymentMethod.value)}',
              style: AppTheme.body,
            ),
          ),
          const SizedBox(height: 20),
          CustomButton(
            label: hasItems ? 'Proceed to Checkout' : 'Add Items to Continue',
            onPressed: hasItems ? _goToCheckout : _goToHome,
          ),
        ],
      );
    });
  }

  Widget _summaryRow(String label, double amount, {bool bold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: bold ? AppTheme.heading4 : AppTheme.body),
          Text(
            Helpers.formatCurrency(amount),
            style: (bold ? AppTheme.heading3 : AppTheme.body).copyWith(color: color),
          ),
        ],
      ),
    );
  }
}

/// Full-screen cart (route from restaurant detail).
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Your Cart'),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: const SafeArea(child: CartPage()),
    );
  }
}

/// Cart tab inside home — single scaffold from [HomeScreen].
class CartTab extends StatelessWidget {
  const CartTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Your Cart'),
        backgroundColor: AppColors.background,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: const SafeArea(child: CartPage()),
    );
  }
}
