import 'dart:convert';

import 'package:pusher_reverb_flutter/pusher_reverb_flutter.dart';

import '../constants/reverb_constants.dart';
import 'storage_service.dart';

typedef EchoEventCallback = void Function(Map<String, dynamic> data);

class EchoService {
  EchoService._();
  static final EchoService instance = EchoService._();

  ReverbClient? _client;
  final Map<String, Channel> _channels = {};

  Future<ReverbClient> _getClient() async {
    if (_client != null) return _client!;

    _client = ReverbClient.instance(
      host: ReverbConstants.host,
      port: ReverbConstants.port,
      appKey: ReverbConstants.appKey,
      useTLS: ReverbConstants.useTls,
      authEndpoint: '${ReverbConstants.apiBaseUrl}/broadcasting/auth',
      authorizer: (channelName, socketId) async {
        final token = await StorageService.instance.getToken();
        return {
          'Accept': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        };
      },
    );

    await _client!.connect();
    return _client!;
  }

  Future<void> subscribeToOrderUpdates(String customerId, EchoEventCallback onUpdate) async {
    final client = await _getClient();
    final channelName = 'private-orders.$customerId';
    final channel = client.subscribeToPrivateChannel(channelName);
    channel.bind('order.status.updated', (_, data) => onUpdate(_parseEventData(data)));
    _channels[channelName] = channel;
  }

  Future<void> subscribeToTracking(String orderNumber, EchoEventCallback onLocationUpdate) async {
    final client = await _getClient();
    final channelName = 'private-tracking.$orderNumber';
    final channel = client.subscribeToPrivateChannel(channelName);
    channel.bind('driver.location.updated', (_, data) => onLocationUpdate(_parseEventData(data)));
    _channels[channelName] = channel;
  }

  Map<String, dynamic> _parseEventData(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    if (data is String) {
      try {
        return Map<String, dynamic>.from(jsonDecode(data) as Map);
      } catch (_) {
        return {'raw': data};
      }
    }
    return {};
  }

  Future<void> unsubscribe({String? channelName}) async {
    if (channelName == null) {
      for (final entry in _channels.entries.toList()) {
        entry.value.unsubscribe();
        _channels.remove(entry.key);
      }
      return;
    }

    final channel = _channels[channelName];
    if (channel != null) {
      channel.unsubscribe();
      _channels.remove(channelName);
    }
  }

  Future<void> disconnect() async {
    await unsubscribe();
    _client?.disconnect();
    _client = null;
  }
}
