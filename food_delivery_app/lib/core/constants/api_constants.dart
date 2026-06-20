import 'dev_host.dart';

class ApiConstants {
  static String get baseUrl => DevHost.apiUrl;

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  // Restaurants
  static const String restaurants = '/restaurants';

  // Orders
  static const String orders = '/orders';

  // Addresses
  static const String addresses = '/addresses';

  // Promos
  static const String validatePromo = '/promos/validate';

  // Profile
  static const String profile = '/profile';
  static const String changePassword = '/profile/password';

  // Notifications
  static const String notifications = '/notifications';
  static const String notificationsReadAll = '/notifications/read-all';
  static const String registerFcmToken = '/notifications/register-token';
}
