import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../data/models/restaurant_model.dart';
import '../common/network_image_widget.dart';

class RestaurantCard extends StatelessWidget {
  final RestaurantModel restaurant;
  final VoidCallback onTap;

  const RestaurantCard({super.key, required this.restaurant, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                NetworkImageWidget(
                  url: restaurant.coverImage,
                  height: 140,
                  width: double.infinity,
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: _OpenBadge(isOpen: restaurant.isOpen),
                ),
                Positioned(
                  left: 12,
                  bottom: -20,
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white, width: 2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: NetworkImageWidget(
                      url: restaurant.logo,
                      width: 48,
                      height: 48,
                      borderRadius: BorderRadius.circular(6),
                      placeholder: Container(
                        width: 48,
                        height: 48,
                        color: AppColors.surface,
                        child: const Icon(Icons.restaurant, color: AppColors.primary),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(restaurant.name, style: AppTheme.heading4, maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 16, color: AppColors.warning),
                      const SizedBox(width: 4),
                      Text(
                        '${restaurant.rating.toStringAsFixed(1)} (${restaurant.totalReviews})',
                        style: AppTheme.caption,
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${Helpers.formatCurrency(restaurant.deliveryFee)} delivery • ${restaurant.deliveryTime ?? 30} min • Min ${Helpers.formatCurrency(restaurant.minimumOrder)}',
                    style: AppTheme.caption,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OpenBadge extends StatelessWidget {
  final bool isOpen;

  const _OpenBadge({required this.isOpen});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isOpen ? AppColors.success : AppColors.error,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        isOpen ? 'Open' : 'Closed',
        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
      ),
    );
  }
}
