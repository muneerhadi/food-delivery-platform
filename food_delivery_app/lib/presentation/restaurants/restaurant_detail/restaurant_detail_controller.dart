import 'package:get/get.dart';

import '../../../core/network/api_exception.dart';
import '../../../data/models/category_model.dart';
import '../../../data/models/restaurant_model.dart';
import '../../../data/repositories/restaurant_repository.dart';

class RestaurantDetailController extends GetxController {
  final RestaurantRepository _repository = Get.find();

  final restaurant = Rxn<RestaurantModel>();
  final categories = <CategoryModel>[].obs;
  final isLoading = true.obs;
  final errorMessage = ''.obs;
  final selectedTabIndex = 0.obs;

  late final String slug;

  @override
  void onInit() {
    super.onInit();
    slug = Get.arguments as String;
    loadData();
  }

  Future<void> loadData() async {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      final results = await Future.wait([
        _repository.getRestaurantDetail(slug),
        _repository.getRestaurantMenu(slug),
      ]);
      restaurant.value = results[0] as RestaurantModel;
      categories.assignAll(results[1] as List<CategoryModel>);
    } on ApiException catch (e) {
      errorMessage.value = e.message;
    } catch (_) {
      errorMessage.value = 'Failed to load restaurant';
    } finally {
      isLoading.value = false;
    }
  }
}
