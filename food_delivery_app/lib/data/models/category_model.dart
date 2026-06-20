import 'menu_item_model.dart';

class CategoryModel {
  final int id;
  final String name;
  final String? image;
  final int sortOrder;
  final bool isActive;
  final List<MenuItemModel> menuItems;

  CategoryModel({
    required this.id,
    required this.name,
    this.image,
    required this.sortOrder,
    required this.isActive,
    this.menuItems = const [],
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      image: json['image'] as String?,
      sortOrder: json['sort_order'] as int? ?? 0,
      isActive: json['is_active'] as bool? ?? true,
      menuItems: (json['menu_items'] as List<dynamic>? ?? [])
          .map((e) => MenuItemModel.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'image': image,
        'sort_order': sortOrder,
        'is_active': isActive,
        'menu_items': menuItems.map((e) => e.toJson()).toList(),
      };

  CategoryModel copyWith({
    int? id,
    String? name,
    String? image,
    int? sortOrder,
    bool? isActive,
    List<MenuItemModel>? menuItems,
  }) {
    return CategoryModel(
      id: id ?? this.id,
      name: name ?? this.name,
      image: image ?? this.image,
      sortOrder: sortOrder ?? this.sortOrder,
      isActive: isActive ?? this.isActive,
      menuItems: menuItems ?? this.menuItems,
    );
  }
}
