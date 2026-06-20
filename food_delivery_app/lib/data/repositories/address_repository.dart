import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/address_model.dart';

class AddressRepository {
  final _client = DioClient.instance;

  Future<List<AddressModel>> getAddresses() async {
    final response = await _client.get(ApiConstants.addresses);
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List<dynamic>;
    return list
        .map((e) => AddressModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<AddressModel> createAddress(Map<String, dynamic> payload) async {
    final response = await _client.post(ApiConstants.addresses, data: payload);
    final data = response.data as Map<String, dynamic>;
    return AddressModel.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<AddressModel> updateAddress(int id, Map<String, dynamic> payload) async {
    final response = await _client.put('${ApiConstants.addresses}/$id', data: payload);
    final data = response.data as Map<String, dynamic>;
    return AddressModel.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<void> deleteAddress(int id) async {
    await _client.delete('${ApiConstants.addresses}/$id');
  }
}
