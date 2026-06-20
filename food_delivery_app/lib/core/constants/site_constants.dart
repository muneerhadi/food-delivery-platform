import 'package:flutter/foundation.dart';

import 'dev_host.dart';

/// Public marketing site (Next.js dashboard) — privacy, terms, download page.
class SiteConstants {
  static const int webPort = 3000;

  static String get webBaseUrl {
    if (kIsWeb) return 'http://127.0.0.1:$webPort';
    return 'http://${DevHost.host}:$webPort';
  }

  static String get privacyUrl => '$webBaseUrl/privacy';
  static String get termsUrl => '$webBaseUrl/terms';
  static String get homeUrl => webBaseUrl;
}
