import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../notifications/notification_screen.dart';
import '../orders/order_list/order_list_screen.dart';
import '../restaurants/restaurant_list/restaurant_list_screen.dart';
import '../widgets/home/home_bottom_nav.dart';
import 'home_controller.dart';

class HomeScreen extends GetView<HomeController> {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final index = controller.bottomIndex.value;
      return Scaffold(
        body: SafeArea(
          bottom: false,
          child: IndexedStack(
            index: index,
            children: const [
              RestaurantListScreen(),
              NotificationScreen(),
              _FavoritesPlaceholder(),
              OrderListScreen(),
            ],
          ),
        ),
        bottomNavigationBar: HomeBottomNav(
          currentIndex: index,
          onTabSelected: controller.changeBottomTab,
          onCartTap: controller.goToCart,
        ),
      );
    });
  }
}

class _FavoritesPlaceholder extends StatelessWidget {
  const _FavoritesPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.favorite_border_rounded,
                size: 44, color: Color(0xFF67736F)),
            SizedBox(height: 12),
            Text(
              'Favorites will appear here',
              style: TextStyle(
                color: Color(0xFF113B31),
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: 6),
            Text(
              'Save restaurants and dishes you love.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFF67736F),
                fontSize: 13.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
