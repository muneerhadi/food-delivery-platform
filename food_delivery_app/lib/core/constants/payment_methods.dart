import 'package:flutter/material.dart';

class PaymentMethodOption {
  const PaymentMethodOption({
    required this.id,
    required this.label,
    required this.icon,
    required this.color,
    this.subtitle,
  });

  final String id;
  final String label;
  final IconData icon;
  final Color color;
  final String? subtitle;
}

class PaymentMethods {
  static const String mastercard = 'mastercard';
  static const String visa = 'visa';
  static const String hesabpay = 'hesabpay';
  static const String cash = 'cash';

  static const List<PaymentMethodOption> options = [
    PaymentMethodOption(
      id: mastercard,
      label: 'Mastercard',
      icon: Icons.credit_card,
      color: Color(0xFFEB001B),
      subtitle: 'Debit / Credit',
    ),
    PaymentMethodOption(
      id: visa,
      label: 'Visa',
      icon: Icons.credit_card,
      color: Color(0xFF1A1F71),
      subtitle: 'Debit / Credit',
    ),
    PaymentMethodOption(
      id: hesabpay,
      label: 'HesabPay',
      icon: Icons.account_balance_wallet_outlined,
      color: Color(0xFF007457),
      subtitle: 'Mobile wallet',
    ),
    PaymentMethodOption(
      id: cash,
      label: 'Cash',
      icon: Icons.payments_outlined,
      color: Color(0xFF2E7D32),
      subtitle: 'Pay on delivery',
    ),
  ];

  static PaymentMethodOption? find(String id) {
    for (final option in options) {
      if (option.id == id) return option;
    }
    return null;
  }

  static String labelFor(String id) => find(id)?.label ?? id;
}
