import 'package:flutter/foundation.dart';

import '../services/storage_service.dart';

/// Local dev machine IP — change [phoneHost] when testing on a physical device.
///
/// - Chrome / desktop / iOS simulator: `127.0.0.1` (automatic on web)
/// - Android emulator: use `10.0.2.2`
/// - Physical phone (same Wi‑Fi/LAN as PC): use your PC's IPv4 (run `ipconfig`)
class DevHost {
  /// PC LAN IP — use when phone and PC are on the same Wi‑Fi.
  static const String phoneHost = '172.16.230.1';

  /// Use with `adb reverse tcp:8000 tcp:8000` when the phone is on USB.
  static const String usbHost = '127.0.0.1';

  static const int apiPort = 8000;
  static const int reverbPort = 8080;

  static String? _overrideHost;

  static Future<void> load() async {
    final saved = await StorageService.instance.getApiHost();
    _overrideHost = _normalizeHost(saved ?? '');
    if ((saved ?? '').trim().isNotEmpty && _overrideHost == null) {
      await StorageService.instance.clearApiHost();
    } else if (_overrideHost != null && _overrideHost != saved) {
      await StorageService.instance.saveApiHost(_overrideHost!);
    }
  }

  static String get host {
    if (kIsWeb) return '127.0.0.1';
    return _overrideHost ?? phoneHost;
  }

  static String get apiBaseUrl => 'http://$host:$apiPort';
  static String get apiUrl => '$apiBaseUrl/api';

  static Future<void> setHost(String host) async {
    _overrideHost = _normalizeHost(host);
    if (_overrideHost == null) {
      await StorageService.instance.clearApiHost();
    } else {
      await StorageService.instance.saveApiHost(_overrideHost!);
    }
  }

  static String? normalizeHostInput(String host) => _normalizeHost(host);

  static String? _normalizeHost(String host) {
    var value = host.trim();
    if (value.isEmpty) return null;
    value = value.replaceFirst(RegExp(r'^https?://', caseSensitive: false), '');
    final slashIndex = value.indexOf('/');
    if (slashIndex >= 0) {
      value = value.substring(0, slashIndex);
    }
    final colonIndex = value.indexOf(':');
    if (colonIndex > 0) {
      value = value.substring(0, colonIndex);
    }
    value = value.trim();
    return value.isEmpty ? null : value;
  }

  static Future<void> resetHost() => setHost('');
}
