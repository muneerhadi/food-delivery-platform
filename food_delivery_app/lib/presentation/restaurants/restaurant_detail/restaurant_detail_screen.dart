import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../app/routes/app_routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../cart/cart_controller.dart';
import '../../widgets/common/error_widget.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/network_image_widget.dart';
import '../../widgets/restaurant/menu_item_card.dart';
import 'restaurant_detail_controller.dart';

class RestaurantDetailScreen extends GetView<RestaurantDetailController> {
  const RestaurantDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = Get.find<CartController>();

    return Obx(() {
      if (controller.isLoading.value) {
        return const Scaffold(body: LoadingWidget(message: 'Loading menu...'));
      }
      if (controller.errorMessage.isNotEmpty) {
        return Scaffold(
          appBar: AppBar(),
          body: ErrorWidgetView(message: controller.errorMessage.value, onRetry: controller.loadData),
        );
      }

      final restaurant = controller.restaurant.value!;
      final categories = controller.categories;

      return DefaultTabController(
        length: categories.isEmpty ? 1 : categories.length,
        child: Scaffold(
          body: NestedScrollView(
            headerSliverBuilder: (context, innerBoxIsScrolled) => [
              SliverAppBar(
                expandedHeight: 200,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: NetworkImageWidget(
                    url: restaurant.coverImage,
                    width: double.infinity,
                    height: 200,
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      NetworkImageWidget(
                        url: restaurant.logo,
                        width: 64,
                        height: 64,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(restaurant.name, style: AppTheme.heading2),
                            Row(
                              children: [
                                const Icon(Icons.star, size: 16, color: AppColors.warning),
                                Text(' ${restaurant.rating} (${restaurant.totalReviews})'),
                              ],
                            ),
                            if (restaurant.description != null)
                              Text(restaurant.description!, style: AppTheme.caption, maxLines: 2),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (categories.isNotEmpty)
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _TabBarDelegate(
                    TabBar(
                      isScrollable: true,
                      tabs: categories.map((c) => Tab(text: c.name)).toList(),
                      onTap: (i) => controller.selectedTabIndex.value = i,
                    ),
                  ),
                ),
            ],
            body: categories.isEmpty
                ? const Center(child: Text('No menu items available'))
                : TabBarView(
                    children: categories.map((category) {
                      return ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: category.menuItems.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, index) => MenuItemCard(
                          item: category.menuItems[index],
                          restaurantId: restaurant.id,
                          restaurantName: restaurant.name,
                          deliveryFee: restaurant.deliveryFee,
                        ),
                      );
                    }).toList(),
                  ),
          ),
          floatingActionButton: Obx(() {
            if (cart.cartItemCount == 0) return const SizedBox.shrink();
            return FloatingActionButton.extended(
              onPressed: () => Get.toNamed(AppRoutes.cart),
              backgroundColor: AppColors.primary,
              icon: const Icon(Icons.shopping_cart, color: Colors.white),
              label: Text(
                '${cart.cartItemCount} • ${Helpers.formatCurrency(cart.cartTotal)}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
              ),
            );
          }),
        ),
      );
    });
  }
}

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  _TabBarDelegate(this.tabBar);

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Material(color: Theme.of(context).scaffoldBackgroundColor, child: tabBar);
  }

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => false;
}
