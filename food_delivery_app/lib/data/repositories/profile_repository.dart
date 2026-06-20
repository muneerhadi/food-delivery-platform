import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../../core/services/storage_service.dart';
import '../models/api_response.dart';
import '../models/notification_model.dart';
import '../models/user_model.dart';

class ProfileRepository {
  final _client = DioClient.instance;

  Future<UserModel> getProfile() async {
    final response = await _client.get(ApiConstants.profile);
    final data = response.data as Map<String, dynamic>;
    return UserModel.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<UserModel> updateProfile(Map<String, dynamic> payload) async {
    final response = await _client.put(ApiConstants.profile, data: payload);
    final data = response.data as Map<String, dynamic>;
    final user = UserModel.fromJson(data['data'] as Map<String, dynamic>);
    await StorageService.instance.saveUser(user.toJsonString());
    return user;
  }

  Future<void> changePassword({
    required String currentPassword,
    required String password,
  }) async {
    await _client.put(
      ApiConstants.changePassword,
      data: {
        'current_password': currentPassword,
        'password': password,
        'password_confirmation': password,
      },
    );
  }

  Future<PaginatedResponse<NotificationModel>> getNotifications({int page = 1}) async {
    final response = await _client.get(
      ApiConstants.notifications,
      queryParameters: {'page': page},
    );
    final data = response.data as Map<String, dynamic>;
    return PaginatedResponse.fromJson(
      data['data'] as Map<String, dynamic>,
      NotificationModel.fromJson,
    );
  }

  Future<void> markNotificationRead(int id) async {
    await _client.post('${ApiConstants.notifications}/$id/read');
  }

  Future<void> markAllNotificationsRead() async {
    await _client.post(ApiConstants.notificationsReadAll);
  }
}
