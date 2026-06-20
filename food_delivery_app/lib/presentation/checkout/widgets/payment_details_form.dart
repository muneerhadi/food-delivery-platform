import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/constants/payment_methods.dart';

class PaymentDetailsForm extends StatelessWidget {
  const PaymentDetailsForm({
    super.key,
    required this.paymentMethod,
    required this.cardNumberController,
    required this.expiryController,
    required this.cvvController,
    required this.hesabpayController,
  });

  final String paymentMethod;
  final TextEditingController cardNumberController;
  final TextEditingController expiryController;
  final TextEditingController cvvController;
  final TextEditingController hesabpayController;

  @override
  Widget build(BuildContext context) {
    if (paymentMethod == PaymentMethods.mastercard || paymentMethod == PaymentMethods.visa) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Card Details', style: AppTheme.heading3),
          const SizedBox(height: 12),
          TextField(
            controller: cardNumberController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Card Number',
              hintText: '1234 5678 9012 3456',
              prefixIcon: const Icon(Icons.credit_card),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: expiryController,
                  keyboardType: TextInputType.datetime,
                  decoration: const InputDecoration(
                    labelText: 'Expiry (MM/YY)',
                    hintText: '12/28',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: cvvController,
                  keyboardType: TextInputType.number,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'CVV',
                    hintText: '123',
                  ),
                ),
              ),
            ],
          ),
        ],
      );
    }

    if (paymentMethod == PaymentMethods.hesabpay) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('HesabPay', style: AppTheme.heading3),
          const SizedBox(height: 12),
          TextField(
            controller: hesabpayController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'HesabPay Phone Number',
              hintText: '07xxxxxxxx',
              prefixIcon: Icon(Icons.phone_android),
            ),
          ),
        ],
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF7F1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.payments_outlined, color: Color(0xFF2E7D32)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'You will pay with cash when your order is delivered.',
              style: AppTheme.body,
            ),
          ),
        ],
      ),
    );
  }
}
