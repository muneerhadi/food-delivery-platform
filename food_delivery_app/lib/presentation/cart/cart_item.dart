import '../../data/models/menu_item_model.dart';

class CartItem {
  final MenuItemModel item;
  int quantity;

  CartItem({required this.item, this.quantity = 1});

  double get lineTotal => item.effectivePrice * quantity;
}
