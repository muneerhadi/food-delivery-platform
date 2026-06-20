import '../constants/dev_host.dart';

/// Resolves API media paths to URLs the current device can load.
class MediaUrl {
  static String? resolve(String? path) {
    if (path == null || path.trim().isEmpty) {
      return null;
    }

    final trimmed = path.trim();

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      final uri = Uri.tryParse(trimmed);
      if (uri == null) {
        return null;
      }
      if (!uri.path.contains('/storage/')) {
        return trimmed;
      }
    }

    final storagePath = _extractStoragePath(trimmed);
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
