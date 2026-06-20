import '../constants/dev_host.dart';

/// Resolves API media paths to URLs the current device can load.
class MediaUrl {
  static String? resolve(String? path) {
    if (path == null || path.trim().isEmpty) {
      return null;
    }

    final storagePath = _extractStoragePath(path.trim());
    if (storagePath == null || storagePath.isEmpty) {
      return null;
    }

    return '${DevHost.apiBaseUrl}/storage/$storagePath';
  }

  static String? _extractStoragePath(String value) {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      final uri = Uri.tryParse(value);
      if (uri == null) {
        return null;
      }
      return _normalizeStoragePath(uri.path);
    }

    return _normalizeStoragePath(value);
  }

  static String? _normalizeStoragePath(String path) {
    var normalized = path.startsWith('/') ? path.substring(1) : path;

    if (normalized.startsWith('storage/')) {
      normalized = normalized.substring('storage/'.length);
    }

    return normalized.isEmpty ? null : normalized;
  }
}
