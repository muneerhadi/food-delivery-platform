import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  StorageService._();
  static final StorageService instance = StorageService._();

  static const _tokenKey = 'auth_token';
  static const _userKey = 'auth_user';
  static const _apiHostKey = 'api_host';

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  Future<SharedPreferences> get _storage async {
    return _prefs ??= await SharedPreferences.getInstance();
  }

  Future<void> saveToken(String token) async {
    final prefs = await _storage;
    await prefs.setString(_tokenKey, token);
  }

  Future<String?> getToken() async {
    final prefs = await _storage;
    return prefs.getString(_tokenKey);
  }

  Future<void> clearToken() async {
    final prefs = await _storage;
    await prefs.remove(_tokenKey);
  }

  Future<void> saveUser(String json) async {
    final prefs = await _storage;
    await prefs.setString(_userKey, json);
  }

  Future<String?> getUser() async {
    final prefs = await _storage;
    return prefs.getString(_userKey);
  }

  Future<void> clearUser() async {
    final prefs = await _storage;
    await prefs.remove(_userKey);
  }

  Future<void> clear() async {
    await clearToken();
    await clearUser();
  }

  Future<void> saveApiHost(String host) async {
    final prefs = await _storage;
    await prefs.setString(_apiHostKey, host);
  }

  Future<String?> getApiHost() async {
    final prefs = await _storage;
    return prefs.getString(_apiHostKey);
  }

  Future<void> clearApiHost() async {
    final prefs = await _storage;
    await prefs.remove(_apiHostKey);
  }
}
