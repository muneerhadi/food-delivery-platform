class OrderItemModel {
  final int id;
  final int menuItemId;
  final String name;
  final double price;
  final int quantity;
  final double total;

  OrderItemModel({
    required this.id,
    required this.menuItemId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.total,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] as int? ?? 0,
      menuItemId: json['menu_item_id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      price: _toDouble(json['price']) ?? 0,
      quantity: json['quantity'] as int? ?? 1,
      total: _toDouble(json['total']) ?? 0,
    );
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'menu_item_id': menuItemId,
        'name': name,
        'price': price,
        'quantity': quantity,
        'total': total,
      };

  OrderItemModel copyWith({
    int? id,
    int? menuItemId,
    String? name,
    double? price,
    int? quantity,
    double? total,
  }) {
    return OrderItemModel(
      id: id ?? this.id,
      menuItemId: menuItemId ?? this.menuItemId,
      name: name ?? this.name,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
      total: total ?? this.total,
    );
  }
}
