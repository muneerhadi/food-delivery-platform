class PromoCodeModel {
  final String code;
  final double discountAmount;
  final double finalTotal;

  PromoCodeModel({
    required this.code,
    required this.discountAmount,
    required this.finalTotal,
  });

  factory PromoCodeModel.fromJson(Map<String, dynamic> json) {
    return PromoCodeModel(
      code: json['code'] as String? ?? '',
      discountAmount: _toDouble(json['discount_amount']) ?? 0,
      finalTotal: _toDouble(json['final_total']) ?? 0,
    );
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  Map<String, dynamic> toJson() => {
        'code': code,
        'discount_amount': discountAmount,
        'final_total': finalTotal,
      };

  PromoCodeModel copyWith({
    String? code,
    double? discountAmount,
    double? finalTotal,
  }) {
    return PromoCodeModel(
      code: code ?? this.code,
      discountAmount: discountAmount ?? this.discountAmount,
      finalTotal: finalTotal ?? this.finalTotal,
    );
  }
}
