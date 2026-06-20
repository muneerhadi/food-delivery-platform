import 'order_item_model.dart';
import 'restaurant_model.dart';
import 'user_model.dart';

class OrderModel {
  final int id;
  final String orderNumber;
  final String status;
  final double subtotal;
  final double deliveryFee;
  final double discountAmount;
  final double total;
  final String paymentMethod;
  final String paymentStatus;
  final Map<String, dynamic> deliveryAddress;
  final String? notes;
  final String? confirmedAt;
  final String? pickedUpAt;
  final String? deliveredAt;
  final String? cancelledAt;
  final String createdAt;
  final List<OrderItemModel> items;
  final RestaurantModel? restaurant;
  final UserModel? driver;
  final UserModel? customer;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.subtotal,
    required this.deliveryFee,
    required this.discountAmount,
    required this.total,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.deliveryAddress,
    this.notes,
    this.confirmedAt,
    this.pickedUpAt,
    this.deliveredAt,
    this.cancelledAt,
    required this.createdAt,
    this.items = const [],
    this.restaurant,
    this.driver,
    this.customer,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] as int,
      orderNumber: json['order_number'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      subtotal: _toDouble(json['subtotal']) ?? 0,
      deliveryFee: _toDouble(json['delivery_fee']) ?? 0,
      discountAmount: _toDouble(json['discount_amount']) ?? 0,
      total: _toDouble(json['total']) ?? 0,
      paymentMethod: json['payment_method'] as String? ?? 'cod',
      paymentStatus: json['payment_status'] as String? ?? 'pending',
      deliveryAddress: Map<String, dynamic>.from(
        json['delivery_address'] as Map? ?? {},
      ),
      notes: json['notes'] as String?,
      confirmedAt: json['confirmed_at'] as String?,
      pickedUpAt: json['picked_up_at'] as String?,
      deliveredAt: json['delivered_at'] as String?,
      cancelledAt: json['cancelled_at'] as String?,
      createdAt: json['created_at'] as String? ?? '',
      items: (json['items'] as List<dynamic>? ?? [])
          .map((e) => OrderItemModel.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      restaurant: json['restaurant'] != null
          ? RestaurantModel.fromOrderJson(Map<String, dynamic>.from(json['restaurant'] as Map))
          : null,
      driver: json['driver'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['driver'] as Map))
          : null,
      customer: json['customer'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['customer'] as Map))
          : null,
    );
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'order_number': orderNumber,
        'status': status,
        'subtotal': subtotal,
        'delivery_fee': deliveryFee,
        'discount_amount': discountAmount,
        'total': total,
        'payment_method': paymentMethod,
        'payment_status': paymentStatus,
        'delivery_address': deliveryAddress,
        'notes': notes,
        'created_at': createdAt,
        'items': items.map((e) => e.toJson()).toList(),
      };

  OrderModel copyWith({
    int? id,
    String? orderNumber,
    String? status,
    double? subtotal,
    double? deliveryFee,
    double? discountAmount,
    double? total,
    String? paymentMethod,
    String? paymentStatus,
    Map<String, dynamic>? deliveryAddress,
    String? notes,
    String? confirmedAt,
    String? pickedUpAt,
    String? deliveredAt,
    String? cancelledAt,
    String? createdAt,
    List<OrderItemModel>? items,
    RestaurantModel? restaurant,
    UserModel? driver,
    UserModel? customer,
  }) {
    return OrderModel(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      status: status ?? this.status,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      discountAmount: discountAmount ?? this.discountAmount,
      total: total ?? this.total,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      notes: notes ?? this.notes,
      confirmedAt: confirmedAt ?? this.confirmedAt,
      pickedUpAt: pickedUpAt ?? this.pickedUpAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      cancelledAt: cancelledAt ?? this.cancelledAt,
      createdAt: createdAt ?? this.createdAt,
      items: items ?? this.items,
      restaurant: restaurant ?? this.restaurant,
      driver: driver ?? this.driver,
      customer: customer ?? this.customer,
    );
  }
}
