import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shimmer/shimmer.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/constants/dev_host.dart';
import '../../../data/models/restaurant_model.dart';
import '../../widgets/common/empty_state_widget.dart';
import '../../widgets/common/error_widget.dart';
import '../../widgets/home/category_chip_list.dart';
import '../../widgets/home/home_header.dart';
import '../../widgets/home/home_search_bar.dart';
import '../../widgets/home/promo_carousel.dart';
import '../../widgets/home/restaurant_card_compact.dart';
import '../../widgets/home/restaurant_card_large.dart';
import '../../home/home_controller.dart';
import '../../profile/profile_screen.dart';

class RestaurantListScreen extends GetView<HomeController> {
  const RestaurantListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value && controller.restaurants.isEmpty) {
        return _buildShimmer();
      }
      if (controller.errorMessage.isNotEmpty &&
          controller.restaurants.isEmpty) {
        return ErrorWidgetView(
          message: controller.errorMessage.value,
          onRetry: controller.fetchHomeData,
        );
      }

      return RefreshIndicator(
        onRefresh: controller.refreshHome,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 116),
          children: [
            HomeHeader(
              address: controller.deliveryAddress.value,
              avatarUrl: controller.user.value?.avatar,
              onMenuTap: () => _showServerSettings(context),
              onProfileTap: () => Get.to(() => const ProfileScreen()),
            ),
            const SizedBox(height: 14),
            PromoCarousel(
              promos: HomeController.promoItems,
              currentIndex: controller.promoIndex.value,
              onPageChanged: controller.updatePromoIndex,
              onActionTap: controller.onSearchTap,
            ),
            const SizedBox(height: 14),
            HomeSearchBar(onTap: controller.onSearchTap),
            const SizedBox(height: 20),
            _SectionHeader(
              title: 'CATEGORIES',
              onSeeAllTap: () => controller.onSearchTap(),
            ),
            const SizedBox(height: 12),
            CategoryChipList(
              categories: HomeController.categories,
              selectedCategory: controller.selectedCategory.value,
              onSelected: controller.selectCategory,
            ),
            const SizedBox(height: 20),
            _SectionHeader(
              title: 'TOP RESTAURANTS',
              onSeeAllTap: () => controller.onSearchTap(),
            ),
            const SizedBox(height: 12),
            _HorizontalRestaurantList(
              restaurants: controller.topRestaurants,
              onTap: controller.openRestaurant,
            ),
            const SizedBox(height: 20),
            _SectionHeader(
              title: 'FREE DELIVERY',
              onSeeAllTap: () => controller.onSearchTap(),
            ),
            const SizedBox(height: 12),
            _HorizontalRestaurantList(
              restaurants: controller.freeDeliveryRestaurants,
              onTap: controller.openRestaurant,
            ),
            const SizedBox(height: 20),
            const _SectionHeader(title: 'ALL RESTAURANTS'),
            const SizedBox(height: 12),
            if (controller.allRestaurants.isEmpty)
              const SizedBox(
                height: 220,
                child: EmptyStateWidget(
                  title: 'No restaurants found',
                  subtitle: 'Try another category and pull to refresh',
                  icon: Icons.restaurant_menu,
                ),
              )
            else
              ...controller.allRestaurants.map(
                (restaurant) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: RestaurantCardCompact(
                    restaurant: restaurant,
                    onTap: () => controller.openRestaurant(restaurant),
                  ),
                ),
              ),
          ],
        ),
      );
    });
  }

  Widget _buildShimmer() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 116),
      children: [
        _shimmerBox(height: 44, radius: 22),
        const SizedBox(height: 14),
        _shimmerBox(height: 190, radius: 20),
        const SizedBox(height: 14),
        _shimmerBox(height: 54, radius: 28),
        const SizedBox(height: 20),
        _shimmerBox(height: 24, radius: 8, width: 190),
        const SizedBox(height: 12),
        SizedBox(
          height: 46,
          child: Row(
            children: List.generate(
              4,
              (index) => Padding(
                padding: const EdgeInsets.only(right: 10),
                child: _shimmerBox(height: 46, radius: 23, width: 98),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        _shimmerBox(height: 24, radius: 8, width: 210),
        const SizedBox(height: 12),
        SizedBox(
          height: 252,
          child: Row(
            children: [
              _shimmerBox(height: 252, radius: 18, width: 242),
              const SizedBox(width: 12),
              _shimmerBox(height: 252, radius: 18, width: 242),
            ],
          ),
        ),
      ],
    );
  }

  Widget _shimmerBox({
    required double height,
    required double radius,
    double? width,
  }) {
    return Shimmer.fromColors(
      baseColor: AppColors.surface,
      highlightColor: Colors.white,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
    );
  }

  Future<void> _showServerSettings(BuildContext context) async {
    final hostController = TextEditingController(text: DevHost.host);
    await Get.dialog(
      AlertDialog(
        title: const Text('Server connection'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'USB cable: use 127.0.0.1 (run adb reverse tcp:8000 tcp:8000 on PC).\n'
                'Wi‑Fi: use your PC IPv4 from ipconfig — phone and PC must be on the same network.',
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    label: Text('USB (${DevHost.usbHost})'),
                    onPressed: () => hostController.text = DevHost.usbHost,
                  ),
                  ActionChip(
                    label: Text('Wi‑Fi (${DevHost.phoneHost})'),
                    onPressed: () => hostController.text = DevHost.phoneHost,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: hostController,
                decoration: const InputDecoration(
                  labelText: 'Server IP address',
                  hintText: '127.0.0.1 or 172.16.x.x',
                ),
                keyboardType: TextInputType.number,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final ok = await _testConnection(hostController.text.trim());
              Fluttertoast.showToast(
                msg: ok ? 'Server reachable' : 'Cannot reach server',
              );
            },
            child: const Text('Test'),
          ),
          TextButton(
            onPressed: () async {
              await DevHost.resetHost();
              Get.back();
              await controller.fetchHomeData(refresh: true);
              Fluttertoast.showToast(msg: 'Server reset to default');
            },
            child: const Text('Reset'),
          ),
          TextButton(onPressed: Get.back, child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              final host = hostController.text.trim();
              await DevHost.setHost(host);
              Get.back();
              final ok = await _testConnection(host);
              await controller.fetchHomeData(refresh: true);
              Fluttertoast.showToast(
                msg: ok
                    ? 'Server updated and reachable'
                    : 'Saved, but server not reachable yet',
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    hostController.dispose();
  }

  Future<bool> _testConnection(String host) async {
    final normalizedHost = DevHost.normalizeHostInput(host);
    if (normalizedHost == null) return false;
    try {
      final dio = Dio(
        BaseOptions(
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 5),
          headers: {'Accept': 'application/json'},
        ),
      );
      final response = await dio.get(
        'http://$normalizedHost:${DevHost.apiPort}/api/auth/login',
        options: Options(validateStatus: (_) => true),
      );
      return response.statusCode != null;
    } catch (_) {
      return false;
    }
  }
}

class _HorizontalRestaurantList extends StatelessWidget {
  const _HorizontalRestaurantList({
    required this.restaurants,
    required this.onTap,
  });

  final List<RestaurantModel> restaurants;
  final ValueChanged<RestaurantModel> onTap;

  @override
  Widget build(BuildContext context) {
    if (restaurants.isEmpty) {
      return Container(
        height: 252,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: const Text(
          'No restaurants available',
          style: TextStyle(color: AppColors.textSecondary),
        ),
      );
    }

    return SizedBox(
      height: 252,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: restaurants.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final restaurant = restaurants[index];
          return RestaurantCardLarge(
            restaurant: restaurant,
            onTap: () => onTap(restaurant),
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    this.onSeeAllTap,
  });

  final String title;
  final VoidCallback? onSeeAllTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w800,
            fontSize: 16.5,
            letterSpacing: 0.3,
          ),
        ),
        const Spacer(),
        if (onSeeAllTap != null)
          InkWell(
            onTap: onSeeAllTap,
            child: const Text(
              'See All',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w700,
                fontSize: 13.5,
              ),
            ),
          ),
      ],
    );
  }
}
