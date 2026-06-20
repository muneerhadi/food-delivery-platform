import 'package:dio/dio.dart';
import 'package:get/get.dart' hide Response;

import '../constants/api_constants.dart';
import '../constants/dev_host.dart';
import '../services/storage_service.dart';
import '../../app/routes/app_routes.dart';
import 'api_exception.dart';

class DioClient {
  DioClient._() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          options.baseUrl = ApiConstants.baseUrl;
          final token = await StorageService.instance.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final recovered = await _retryWithFallbackHost(error);
          if (recovered != null) {
            handler.resolve(recovered);
            return;
          }

          final exception = _handleError(error);
          handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              error: exception,
              response: error.response,
              type: error.type,
            ),
          );
        },
      ),
    );
  }

  static final DioClient instance = DioClient._();
  late final Dio _dio;

  Dio get dio => _dio;

  Future<Response<dynamic>?> _retryWithFallbackHost(DioException error) async {
    final isNetworkIssue = error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError;
    if (!isNetworkIssue) return null;

    if (error.requestOptions.extra['host_fallback_attempted'] == true) {
      return null;
    }

    final currentHost = DevHost.host;
    final fallbackHosts =
        DevHost.fallbackHosts.where((host) => host != currentHost).toList();

    if (fallbackHosts.isEmpty) return null;

    for (final host in fallbackHosts) {
      try {
        final retryOptions = error.requestOptions.copyWith(
          baseUrl: 'http://$host:${DevHost.apiPort}/api',
          extra: {
            ...error.requestOptions.extra,
            'host_fallback_attempted': true,
          },
        );
        final response = await _dio.fetch<dynamic>(retryOptions);
        await DevHost.setHost(host);
        return response;
      } catch (_) {
        // Try next fallback host.
      }
    }
    return null;
  }

  ApiException _handleError(DioException error) {
    final response = error.response;
    final statusCode = response?.statusCode;
    final data = response?.data;

    String message = 'Something went wrong';
    Map<String, dynamic>? errors;

    if (data is Map<String, dynamic>) {
      message = data['message']?.toString() ?? message;
      if (data['errors'] is Map) {
        errors = Map<String, dynamic>.from(data['errors'] as Map);
      }
    }

    if (statusCode == 401) {
      StorageService.instance.clear();
      if (Get.currentRoute != AppRoutes.login) {
        Get.offAllNamed(AppRoutes.login);
      }
      message =
          message.isEmpty ? 'Session expired. Please login again.' : message;
    } else if (statusCode == 422) {
      message = message.isEmpty ? 'Validation failed' : message;
    } else if (statusCode == 500) {
      message = 'Server error. Please try again later.';
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      message =
          'Connection timeout at ${error.requestOptions.uri}. Ensure Laravel is running and server host is correct.';
    } else if (error.type == DioExceptionType.connectionError) {
      message =
          'Cannot reach the server at ${ApiConstants.baseUrl}. Check Wi‑Fi and server IP in login settings.';
    }

    return ApiException(
        message: message, statusCode: statusCode, errors: errors);
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.get<T>(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw e.error is ApiException ? e.error as ApiException : _handleError(e);
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
  }) async {
    try {
      return await _dio.post<T>(path, data: data);
    } on DioException catch (e) {
      throw e.error is ApiException ? e.error as ApiException : _handleError(e);
    }
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
  }) async {
    try {
      return await _dio.put<T>(path, data: data);
    } on DioException catch (e) {
      throw e.error is ApiException ? e.error as ApiException : _handleError(e);
    }
  }

  Future<Response<T>> delete<T>(String path) async {
    try {
      return await _dio.delete<T>(path);
    } on DioException catch (e) {
      throw e.error is ApiException ? e.error as ApiException : _handleError(e);
    }
  }
}
