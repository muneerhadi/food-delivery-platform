class AddressModel {
  final int id;
  final String label;
  final String address;
  final String? city;
  final double? lat;
  final double? lng;
  final bool isDefault;

  AddressModel({
    required this.id,
    required this.label,
    required this.address,
    this.city,
    this.lat,
    this.lng,
    required this.isDefault,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'] as int,
      label: json['label'] as String? ?? '',
      address: json['address'] as String? ?? '',
      city: json['city'] as String?,
      lat: _toDouble(json['lat']),
      lng: _toDouble(json['lng']),
      isDefault: json['is_default'] as bool? ?? false,
    );
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'address': address,
        'city': city,
        'lat': lat,
        'lng': lng,
        'is_default': isDefault,
      };

  Map<String, dynamic> toRequestJson() => {
        'label': label,
        'address': address,
        'city': city,
        'lat': lat,
        'lng': lng,
        'is_default': isDefault,
      };

  AddressModel copyWith({
    int? id,
    String? label,
    String? address,
    String? city,
    double? lat,
    double? lng,
    bool? isDefault,
  }) {
    return AddressModel(
      id: id ?? this.id,
      label: label ?? this.label,
      address: address ?? this.address,
      city: city ?? this.city,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
