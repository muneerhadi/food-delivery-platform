import '../../core/utils/media_url.dart';

class MenuItemModel {
  final int id;
  final String name;
  final String? description;
  final double price;
  final double? salePrice;
  final double effectivePrice;
  final String? image;
  final bool isFeatured;
  final int? categoryId;
  final int? restaurantId;

  MenuItemModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.salePrice,
    required this.effectivePrice,
    this.image,
    this.isFeatured = false,
    this.categoryId,
    this.restaurantId,
  });

  factory MenuItemModel.fromJson(Map<String, dynamic> json) {
    final price = _toDouble(json['price']) ?? 0;
    final salePrice = _toDouble(json['sale_price']);
    final effective = _toDouble(json['effective_price']) ?? salePrice ?? price;
    return MenuItemModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      price: price,
      salePrice: salePrice,
      effectivePrice: effective,
      image: MediaUrl.resolve(json['image'] as String?),
      isFeatured: json['is_featured'] as bool? ?? false,
      categoryId: json['category_id'] as int?,
      restaurantId: json['restaurant_id'] as int?,
    );
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'sale_price': salePrice,
        'effective_price': effectivePrice,
        'image': image,
        'is_featured': isFeatured,
        'category_id': categoryId,
        'restaurant_id': restaurantId,
      };

  MenuItemModel copyWith({
    int? id,
    String? name,
    String? description,
    double? price,
    double? salePrice,
    double? effectivePrice,
    String? image,
    bool? isFeatured,
    int? categoryId,
    int? restaurantId,
  }) {
    return MenuItemModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      salePrice: salePrice ?? this.salePrice,
      effectivePrice: effectivePrice ?? this.effectivePrice,
      image: image ?? this.image,
      isFeatured: isFeatured ?? this.isFeatured,
      categoryId: categoryId ?? this.categoryId,
      restaurantId: restaurantId ?? this.restaurantId,
    );
  }
}
