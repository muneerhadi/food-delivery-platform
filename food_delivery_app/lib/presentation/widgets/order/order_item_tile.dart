import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../data/models/order_item_model.dart';

class OrderItemTile extends StatelessWidget {
  final OrderItemModel item;

  const OrderItemTile({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text('${item.quantity}x', style: AppTheme.caption.copyWith(fontWeight: FontWeight.w600)),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(item.name, style: AppTheme.body)),
          Text(Helpers.formatCurrency(item.total), style: AppTheme.heading4),
        ],
      ),
    );
  }
}
