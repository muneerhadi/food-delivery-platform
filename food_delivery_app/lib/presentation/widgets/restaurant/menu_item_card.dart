import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../data/models/menu_item_model.dart';
import '../../cart/cart_controller.dart';
import '../common/network_image_widget.dart';

class MenuItemCard extends StatelessWidget {
  final MenuItemModel item;
  final int restaurantId;
  final String restaurantName;
  final double deliveryFee;

  const MenuItemCard({
    super.key,
    required this.item,
    required this.restaurantId,
    required this.restaurantName,
    required this.deliveryFee,
  });

  @override
  Widget build(BuildContext context) {
    final cart = Get.find<CartController>();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            NetworkImageWidget(
              url: item.image,
              width: 72,
              height: 72,
              borderRadius: BorderRadius.circular(8),
              placeholder: Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.fastfood, color: AppColors.primary),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name, style: AppTheme.heading4, maxLines: 1, overflow: TextOverflow.ellipsis),
                  if (item.description != null)
                    Text(
                      item.description!,
                      style: AppTheme.caption,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (item.salePrice != null) ...[
                        Text(
                          Helpers.formatCurrency(item.price),
                          style: AppTheme.caption.copyWith(decoration: TextDecoration.lineThrough),
                        ),
                        const SizedBox(width: 6),
                      ],
                      Text(Helpers.formatCurrency(item.effectivePrice), style: AppTheme.heading4.copyWith(color: AppColors.primary)),
                    ],
                  ),
                ],
              ),
            ),
            Obx(() {
              final cartItem = cart.cartItems.firstWhereOrNull((c) => c.item.id == item.id);
              if (cartItem == null) {
                return IconButton.filled(
                  onPressed: () => cart.addItem(
                    item,
                    restaurantId: restaurantId,
                    restaurantName: restaurantName,
                    deliveryFee: deliveryFee,
                  ),
                  icon: const Icon(Icons.add, size: 20),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(36, 36),
                  ),
                );
              }
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    onPressed: () => cart.removeItem(item.id),
                    icon: const Icon(Icons.remove_circle_outline),
                    color: AppColors.primary,
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    padding: EdgeInsets.zero,
                  ),
                  Text('${cartItem.quantity}', style: AppTheme.heading4),
                  IconButton(
                    onPressed: () => cart.addItem(
                      item,
                      restaurantId: restaurantId,
                      restaurantName: restaurantName,
                      deliveryFee: deliveryFee,
                    ),
                    icon: const Icon(Icons.add_circle_outline),
                    color: AppColors.primary,
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    padding: EdgeInsets.zero,
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }
}
