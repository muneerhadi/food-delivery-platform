import 'package:get/get.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/utils/helpers.dart';
import '../../../data/models/restaurant_model.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../data/repositories/restaurant_repository.dart';

class RestaurantListController extends GetxController {
  final RestaurantRepository _restaurantRepository = Get.find();
  final AuthRepository _authRepository = Get.find();

  final restaurants = <RestaurantModel>[].obs;
  final isLoading = true.obs;
  final isRefreshing = false.obs;
  final errorMessage = ''.obs;
  final searchQuery = ''.obs;
  final selectedCategory = 'All'.obs;
  final user = Rxn<UserModel>();

  static const categories = ['All', 'Fast Food', 'Pizza', 'Burgers', 'Asian', 'Healthy'];

  @override
  void onInit() {
    super.onInit();
    _loadUser();
    fetchRestaurants();
  }

  Future<void> _loadUser() async {
    user.value = await _authRepository.getCachedUser();
  }

  String get greeting => '${Helpers.greeting()}, ${user.value?.name.split(' ').first ?? 'Guest'} 👋';

  List<RestaurantModel> get filteredRestaurants {
    var list = restaurants.toList();
    if (searchQuery.value.isNotEmpty) {
      final q = searchQuery.value.toLowerCase();
      list = list.where((r) => r.name.toLowerCase().contains(q) || r.city.toLowerCase().contains(q)).toList();
    }
    if (selectedCategory.value != 'All') {
      list = list.where((r) => r.name.toLowerCase().contains(selectedCategory.value.toLowerCase())).toList();
    }
    return list;
  }

  Future<void> fetchRestaurants({bool refresh = false}) async {
    if (refresh) {
      isRefreshing.value = true;
    } else {
      isLoading.value = true;
    }
    errorMessage.value = '';
    try {
      final result = await _restaurantRepository.getRestaurants(
        search: searchQuery.value.isEmpty ? null : searchQuery.value,
      );
      restaurants.assignAll(result.items);
    } on ApiException catch (e) {
      errorMessage.value = e.message;
    } catch (_) {
      errorMessage.value = 'Failed to load restaurants';
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  void onSearchChanged(String value) {
    searchQuery.value = value;
    fetchRestaurants();
  }

  void selectCategory(String category) {
    selectedCategory.value = category;
  }
}
