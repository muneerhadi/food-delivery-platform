import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../../core/services/storage_service.dart';
import '../models/api_response.dart';
import '../models/user_model.dart';

class AuthRepository {
  final _client = DioClient.instance;

  Future<UserModel> login(String email, String password) async {
    final response = await _client.post(
      ApiConstants.login,
      data: {'email': email, 'password': password},
    );
    final data = response.data as Map<String, dynamic>;
    final apiResponse = ApiResponse.fromJson(data, (d) => d);
    final payload = apiResponse.data as Map<String, dynamic>;
    final user = UserModel.fromJson(payload['user'] as Map<String, dynamic>);
    final token = payload['token'] as String;
    await StorageService.instance.saveToken(token);
    await StorageService.instance.saveUser(user.toJsonString());
    return user;
  }

  Future<UserModel> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    final response = await _client.post(
      ApiConstants.register,
      data: {
        'name': name,
        'email': email,
        'password': password,
        'password_confirmation': password,
        if (phone != null) 'phone': phone,
      },
    );
    final data = response.data as Map<String, dynamic>;
    final payload = data['data'] as Map<String, dynamic>;
    final user = UserModel.fromJson(payload['user'] as Map<String, dynamic>);
    final token = payload['token'] as String;
    await StorageService.instance.saveToken(token);
    await StorageService.instance.saveUser(user.toJsonString());
    return user;
  }

  Future<void> logout() async {
    try {
      await _client.post(ApiConstants.logout);
    } finally {
      await StorageService.instance.clear();
    }
  }

  Future<UserModel?> getCachedUser() async {
    final json = await StorageService.instance.getUser();
    if (json == null) return null;
    return UserModel.fromJsonString(json);
  }

  Future<String?> getToken() => StorageService.instance.getToken();
}
