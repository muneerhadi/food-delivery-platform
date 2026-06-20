import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../app/routes/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../core/utils/helpers.dart';
import '../../data/models/restaurant_model.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/restaurant_repository.dart';

class HomeController extends GetxController {
  HomeController();

  final RestaurantRepository _restaurantRepository = Get.find();
  final AuthRepository _authRepository = Get.find();

  final restaurants = <RestaurantModel>[].obs;
  final isLoading = true.obs;
  final isRefreshing = false.obs;
  final errorMessage = ''.obs;
  final selectedCategory = 'All'.obs;
  final promoIndex = 0.obs;
  final bottomIndex = 0.obs;
  final user = Rxn<UserModel>();

  final deliveryAddress = '24th Street, NY'.obs;

  static const promoItems = <HomePromoItem>[
    HomePromoItem(
      title: '50% Off First Order',
      subtitle: 'Healthy meals from top kitchens',
      imageAsset: 'assets/images/onboarding/fresh_generated.png',
      cta: 'Order Now',
    ),
    HomePromoItem(
      title: 'New: Sofra Specials',
      subtitle: 'Freshly picked dishes today',
      imageAsset: 'assets/images/onboarding/restaurants_generated.png',
      cta: 'Explore',
    ),
    HomePromoItem(
      title: 'Fast Delivery',
      subtitle: 'Track every order in real-time',
      imageAsset: 'assets/images/onboarding/tracking_generated.png',
      cta: 'Track Now',
    ),
  ];

  static const categories = <HomeCategoryItem>[
    HomeCategoryItem(
      label: 'All',
      icon: Icons.grid_view_rounded,
      emoji: '🍽️',
      keywords: [],
    ),
    HomeCategoryItem(
      label: 'Pizza',
      icon: Icons.local_pizza_outlined,
      emoji: '🍕',
      keywords: ['pizza'],
    ),
    HomeCategoryItem(
      label: 'Burgers',
      icon: Icons.lunch_dining_outlined,
      emoji: '🍔',
      keywords: ['burger', 'grill'],
    ),
    HomeCategoryItem(
      label: 'Sushi',
      icon: Icons.set_meal_outlined,
      emoji: '🍣',
      keywords: ['sushi', 'japan', 'asian'],
    ),
    HomeCategoryItem(
      label: 'Desserts',
      icon: Icons.icecream_outlined,
      emoji: '🍰',
      keywords: ['dessert', 'cake', 'sweet'],
    ),
    HomeCategoryItem(
      label: 'Coffee',
      icon: Icons.coffee_outlined,
      emoji: '☕',
      keywords: ['coffee', 'cafe'],
    ),
    HomeCategoryItem(
      label: 'Healthy',
      icon: Icons.eco_outlined,
      emoji: '🥗',
      keywords: ['healthy', 'salad', 'fresh'],
    ),
    HomeCategoryItem(
      label: 'Noodles',
      icon: Icons.ramen_dining_outlined,
      emoji: '🍜',
      keywords: ['noodle', 'ramen', 'asian'],
    ),
    HomeCategoryItem(
      label: 'Sandwiches',
      icon: Icons.breakfast_dining_outlined,
      emoji: '🥪',
      keywords: ['sandwich', 'sub'],
    ),
  ];

  @override
  void onInit() {
    super.onInit();
    _loadUser();
    fetchHomeData();
  }

  Future<void> _loadUser() async {
    user.value = await _authRepository.getCachedUser();
  }

  String get greeting =>
      '${Helpers.greeting()}, ${user.value?.name.split(' ').first ?? 'Guest'} 👋';

  List<RestaurantModel> get categoryFilteredRestaurants {
    final selected = selectedCategory.value;
    if (selected == 'All') return restaurants.toList();

    HomeCategoryItem? category;
    for (final item in categories) {
      if (item.label == selected) {
        category = item;
        break;
      }
    }
    if (category == null || category.keywords.isEmpty) {
      return restaurants.toList();
    }
    final selectedCategoryItem = category;

    final filtered = restaurants.where((restaurant) {
      final text = [
        restaurant.name,
        restaurant.description ?? '',
        restaurant.city,
      ].join(' ').toLowerCase();
      return selectedCategoryItem.keywords.any(text.contains);
    }).toList();

    // Keep the UI populated even when backend does not expose category tags.
    return filtered.isEmpty ? restaurants.toList() : filtered;
  }

  List<RestaurantModel> get topRestaurants {
    final list = categoryFilteredRestaurants.toList()
      ..sort((a, b) => b.rating.compareTo(a.rating));
    return list.take(8).toList();
  }

  List<RestaurantModel> get freeDeliveryRestaurants {
    final free = categoryFilteredRestaurants
        .where((r) => r.deliveryFee <= 0.01)
        .toList();
    if (free.isNotEmpty) return free.take(8).toList();
    return categoryFilteredRestaurants.take(8).toList();
  }

  List<RestaurantModel> get allRestaurants => categoryFilteredRestaurants;

  Future<void> fetchHomeData({bool refresh = false}) async {
    if (refresh) {
      isRefreshing.value = true;
    } else {
      isLoading.value = true;
    }
    errorMessage.value = '';

    try {
      final result = await _restaurantRepository.getRestaurants();
      restaurants.assignAll(result.items);
    } on ApiException catch (e) {
      errorMessage.value = e.message;
    } catch (_) {
      errorMessage.value = 'Failed to load home data';
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  Future<void> refreshHome() => fetchHomeData(refresh: true);

  void selectCategory(String category) => selectedCategory.value = category;

  void updatePromoIndex(int index) => promoIndex.value = index;

  void changeBottomTab(int index) => bottomIndex.value = index;

  void goToCart() => Get.toNamed(AppRoutes.cart);

  void openRestaurant(RestaurantModel restaurant) {
    if (restaurant.slug.isEmpty) return;
    Get.toNamed(AppRoutes.restaurantDetail, arguments: restaurant.slug);
  }

  void onSearchTap() {
    Get.snackbar(
      'Search',
      'Search screen will be connected next.',
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.all(12),
      duration: const Duration(seconds: 2),
    );
  }
}

class HomePromoItem {
  const HomePromoItem({
    required this.title,
    required this.subtitle,
    required this.imageAsset,
    required this.cta,
  });

  final String title;
  final String subtitle;
  final String imageAsset;
  final String cta;
}

class HomeCategoryItem {
  const HomeCategoryItem({
    required this.label,
    required this.icon,
    required this.emoji,
    required this.keywords,
  });

  final String label;
  final IconData icon;
  final String emoji;
  final List<String> keywords;
}
