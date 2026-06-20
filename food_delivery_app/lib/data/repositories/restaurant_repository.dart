import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/api_response.dart';
import '../models/category_model.dart';
import '../models/promo_code_model.dart';
import '../models/restaurant_model.dart';

class RestaurantRepository {
  final _client = DioClient.instance;

  Future<PaginatedResponse<RestaurantModel>> getRestaurants({
    String? search,
    String? city,
    double? lat,
    double? lng,
    int page = 1,
  }) async {
    final response = await _client.get(
      ApiConstants.restaurants,
      queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
        if (city != null) 'city': city,
        if (lat != null) 'lat': lat,
        if (lng != null) 'lng': lng,
        'page': page,
      },
    );
    final data = response.data as Map<String, dynamic>;
    return PaginatedResponse.fromJson(
      data['data'] as Map<String, dynamic>,
      RestaurantModel.fromJson,
    );
  }

  Future<RestaurantModel> getRestaurantDetail(String slug) async {
    final response = await _client.get('${ApiConstants.restaurants}/$slug');
    final data = response.data as Map<String, dynamic>;
    return RestaurantModel.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<List<CategoryModel>> getRestaurantMenu(String slug) async {
    final response = await _client.get('${ApiConstants.restaurants}/$slug/menu');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List<dynamic>;
    return list
        .map((e) => CategoryModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<PromoCodeModel> validatePromo(String code, double orderTotal) async {
    final response = await _client.post(
      ApiConstants.validatePromo,
      data: {'code': code, 'order_total': orderTotal},
    );
    final data = response.data as Map<String, dynamic>;
    return PromoCodeModel.fromJson(data['data'] as Map<String, dynamic>);
  }
}
