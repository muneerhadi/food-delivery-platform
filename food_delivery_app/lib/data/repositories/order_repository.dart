import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/api_response.dart';
import '../models/order_model.dart';

class OrderRepository {
  final _client = DioClient.instance;

  Future<PaginatedResponse<OrderModel>> getOrders({int page = 1}) async {
    final response = await _client.get(
      ApiConstants.orders,
      queryParameters: {'page': page},
    );
    final data = response.data as Map<String, dynamic>;
    return PaginatedResponse.fromJson(
      data['data'] as Map<String, dynamic>,
      OrderModel.fromJson,
    );
  }

  Future<OrderModel> getOrder(String orderNumber) async {
    final response = await _client.get('${ApiConstants.orders}/$orderNumber');
    final data = response.data as Map<String, dynamic>;
    return OrderModel.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> trackOrder(String orderNumber) async {
    final response = await _client.get('${ApiConstants.orders}/$orderNumber/track');
    final data = response.data as Map<String, dynamic>;
    return Map<String, dynamic>.from(data['data'] as Map);
  }

  Future<OrderModel> placeOrder({
    required int restaurantId,
    required List<Map<String, dynamic>> items,
    required Map<String, dynamic> deliveryAddress,
    required String paymentMethod,
    String? notes,
    String? promoCode,
  }) async {
    final response = await _client.post(
      ApiConstants.orders,
      data: {
        'restaurant_id': restaurantId,
        'items': items,
        'delivery_address': deliveryAddress,
        'payment_method': paymentMethod,
        if (notes != null) 'notes': notes,
        if (promoCode != null) 'promo_code': promoCode,
      },
    );
    final data = response.data as Map<String, dynamic>;
    return OrderModel.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<OrderModel> cancelOrder(String orderNumber, String reason) async {
    final response = await _client.post(
      '${ApiConstants.orders}/$orderNumber/cancel',
      data: {'cancellation_reason': reason},
    );
    final data = response.data as Map<String, dynamic>;
    return OrderModel.fromJson(data['data'] as Map<String, dynamic>);
  }
}
