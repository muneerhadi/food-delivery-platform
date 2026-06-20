import 'dev_host.dart';

class ReverbConstants {
  static String get apiBaseUrl => DevHost.apiBaseUrl;
  static const String appKey = 'food-delivery-key';
  static String get host => DevHost.host;
  static const int port = DevHost.reverbPort;
  static const bool useTls = false;
}
