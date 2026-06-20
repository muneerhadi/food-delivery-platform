import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/services/echo_service.dart';
import '../../../data/repositories/order_repository.dart';

class OrderTrackingController extends GetxController {
  final OrderRepository _repository = Get.find();
  final EchoService _echo = EchoService.instance;

  final status = 'pending'.obs;
  final driverName = ''.obs;
  final driverPhone = ''.obs;
  final driverAvatar = Rxn<String>();
  final driverLat = Rxn<double>();
  final driverLng = Rxn<double>();
  final isLoading = true.obs;
  final errorMessage = ''.obs;

  late final String orderNumber;
  late final String _trackingChannel;
  GoogleMapController? mapController;

  static const defaultLatLng = LatLng(37.7749, -122.4194);

  @override
  void onInit() {
    super.onInit();
    orderNumber = Get.arguments as String;
    _trackingChannel = 'private-tracking.$orderNumber';
    _loadInitialTracking();
    _subscribeToLiveTracking();
  }

  Future<void> fetchTracking() => _loadInitialTracking();

  Future<void> _loadInitialTracking() async {
    isLoading.value = true;
    try {
      final data = await _repository.trackOrder(orderNumber);
      _applyTrackingPayload(data);
      errorMessage.value = '';
    } on ApiException catch (e) {
      errorMessage.value = e.message;
    } catch (_) {
      errorMessage.value = 'Failed to load tracking';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _subscribeToLiveTracking() async {
    await _echo.subscribeToTracking(orderNumber, (data) {
      status.value = data['status'] as String? ?? status.value;

      final lat = _toDouble(data['lat']);
      final lng = _toDouble(data['lng']);
      if (lat != null && lng != null) {
        driverLat.value = lat;
        driverLng.value = lng;
        mapController?.animateCamera(CameraUpdate.newLatLng(LatLng(lat, lng)));
      }
    });
  }

  void _applyTrackingPayload(Map<String, dynamic> data) {
    status.value = data['status'] as String? ?? 'pending';

    final driver = data['driver'] as Map<String, dynamic>?;
    if (driver != null) {
      driverName.value = driver['name'] as String? ?? '';
      driverPhone.value = driver['phone'] as String? ?? '';
      driverAvatar.value = driver['avatar'] as String?;
    }

    final location = data['driver_location'] as Map<String, dynamic>?;
    if (location != null) {
      final lat = _toDouble(location['lat']);
      final lng = _toDouble(location['lng']);
      if (lat != null && lng != null) {
        driverLat.value = lat;
        driverLng.value = lng;
      }
    }
  }

  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  Set<Marker> get markers {
    if (driverLat.value == null || driverLng.value == null) return {};
    return {
      Marker(
        markerId: const MarkerId('driver'),
        position: LatLng(driverLat.value!, driverLng.value!),
        infoWindow: InfoWindow(title: driverName.value.isEmpty ? 'Driver' : driverName.value),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      ),
    };
  }

  LatLng get cameraTarget {
    if (driverLat.value != null && driverLng.value != null) {
      return LatLng(driverLat.value!, driverLng.value!);
    }
    return defaultLatLng;
  }

  void onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  @override
  void onClose() {
    _echo.unsubscribe(channelName: _trackingChannel);
    mapController?.dispose();
    super.onClose();
  }
}
