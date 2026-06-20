import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../app/routes/app_routes.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../../core/constants/payment_methods.dart';
import '../../core/utils/helpers.dart';
import '../widgets/common/custom_button.dart';
import '../widgets/common/loading_widget.dart';
import '../cart/cart_controller.dart';
import 'checkout_controller.dart';
import 'widgets/payment_details_form.dart';

class CheckoutScreen extends GetView<CheckoutController> {
  const CheckoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = Get.find<CartController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: Obx(() {
        if (controller.isLoadingAddresses.value) {
          return const LoadingWidget(message: 'Loading addresses...');
        }

        final paymentMethod = cart.selectedPaymentMethod.value;
        final paymentLabel = PaymentMethods.labelFor(paymentMethod);

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Delivery Address', style: AppTheme.heading3),
              const SizedBox(height: 8),
              ...controller.addresses.map((address) => RadioListTile<int>(
                    value: address.id,
                    groupValue: controller.selectedAddress.value?.id,
                    onChanged: (_) => controller.selectedAddress.value = address,
                    title: Text('${address.label} • ${address.address}'),
                    subtitle: address.city != null ? Text(address.city!) : null,
                  )),
              TextButton.icon(
                onPressed: () async {
                  await Get.toNamed(AppRoutes.addressForm);
                  controller.loadAddresses();
                },
                icon: const Icon(Icons.add),
                label: const Text('Add New Address'),
              ),
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Icon(
                      PaymentMethods.find(paymentMethod)?.icon ?? Icons.payment,
                      color: PaymentMethods.find(paymentMethod)?.color ?? AppColors.primary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Payment Method', style: AppTheme.caption),
                          Text(paymentLabel, style: AppTheme.heading4),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: Get.back,
                      child: const Text('Change'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              PaymentDetailsForm(
                paymentMethod: paymentMethod,
                cardNumberController: controller.cardNumberController,
                expiryController: controller.expiryController,
                cvvController: controller.cvvController,
                hesabpayController: controller.hesabpayController,
              ),
              const SizedBox(height: 24),
              Text('Order Summary', style: AppTheme.heading3),
              const SizedBox(height: 8),
              ...cart.cartItems.map((c) => ListTile(
                    dense: true,
                    title: Text('${c.quantity}x ${c.item.name}'),
                    trailing: Text(Helpers.formatCurrency(c.lineTotal)),
                  )),
              const Divider(),
              _row('Subtotal', cart.cartSubtotal),
              _row('Delivery', cart.deliveryFee),
              if (cart.discountAmount > 0) _row('Discount', -cart.discountAmount),
              _row('Total', cart.cartTotal, bold: true),
              const SizedBox(height: 16),
              TextField(
                controller: controller.notesController,
                decoration: const InputDecoration(labelText: 'Notes (optional)'),
                maxLines: 2,
              ),
              const SizedBox(height: 24),
              Obx(() => CustomButton(
                    label: 'Place Order',
                    isLoading: controller.isLoading.value,
                    onPressed: controller.placeOrder,
                  )),
            ],
          ),
        );
      }),
    );
  }

  Widget _row(String label, double amount, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: bold ? AppTheme.heading4 : AppTheme.body),
          Text(Helpers.formatCurrency(amount), style: bold ? AppTheme.heading3 : AppTheme.body),
        ],
      ),
    );
  }
}
