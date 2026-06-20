class RestaurantModel {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final String? logo;
  final String? coverImage;
  final String address;
  final String city;
  final double? lat;
  final double? lng;
  final String? phone;
  final double rating;
  final int totalReviews;
  final double deliveryFee;
  final int? deliveryTime;
  final double minimumOrder;
  final bool isOpen;
  final double? distanceKm;

  RestaurantModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.logo,
    this.coverImage,
    required this.address,
    required this.city,
    this.lat,
    this.lng,
    this.phone,
    required this.rating,
    required this.totalReviews,
    required this.deliveryFee,
    this.deliveryTime,
    required this.minimumOrder,
    required this.isOpen,
    this.distanceKm,
  });

  factory RestaurantModel.fromJson(Map<String, dynamic> json) {
    return RestaurantModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String?,
      logo: json['logo'] as String?,
      coverImage: json['cover_image'] as String?,
      address: json['address'] as String? ?? '',
      city: json['city'] as String? ?? '',
      lat: _toDouble(json['lat']),
      lng: _toDouble(json['lng']),
      phone: json['phone'] as String?,
      rating: _toDouble(json['rating']) ?? 0,
      totalReviews: json['total_reviews'] as int? ?? 0,
      deliveryFee: _toDouble(json['delivery_fee']) ?? 0,
      deliveryTime: json['delivery_time'] as int?,
      minimumOrder: _toDouble(json['minimum_order']) ?? 0,
      isOpen: json['is_open'] as bool? ?? false,
      distanceKm: _toDouble(json['distance_km']),
    );
  }

  /// Partial restaurant payload returned on order list/detail endpoints.
  factory RestaurantModel.fromOrderJson(Map<String, dynamic> json) {
    if (json['id'] != null) {
      return RestaurantModel.fromJson(json);
    }

    return RestaurantModel(
      id: 0,
      name: json['name'] as String? ?? '',
      slug: '',
      logo: json['logo'] as String?,
      address: '',
      city: '',
      rating: 0,
      totalReviews: 0,
      deliveryFee: 0,
      minimumOrder: 0,
      isOpen: false,
      phone: json['phone'] as String?,
    );
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'description': description,
        'logo': logo,
        'cover_image': coverImage,
        'address': address,
        'city': city,
        'lat': lat,
        'lng': lng,
        'phone': phone,
        'rating': rating,
        'total_reviews': totalReviews,
        'delivery_fee': deliveryFee,
        'delivery_time': deliveryTime,
        'minimum_order': minimumOrder,
        'is_open': isOpen,
        'distance_km': distanceKm,
      };

  RestaurantModel copyWith({
    int? id,
    String? name,
    String? slug,
    String? description,
    String? logo,
    String? coverImage,
    String? address,
    String? city,
    double? lat,
    double? lng,
    String? phone,
    double? rating,
    int? totalReviews,
    double? deliveryFee,
    int? deliveryTime,
    double? minimumOrder,
    bool? isOpen,
    double? distanceKm,
  }) {
    return RestaurantModel(
      id: id ?? this.id,
      name: name ?? this.name,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      logo: logo ?? this.logo,
      coverImage: coverImage ?? this.coverImage,
      address: address ?? this.address,
      city: city ?? this.city,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      phone: phone ?? this.phone,
      rating: rating ?? this.rating,
      totalReviews: totalReviews ?? this.totalReviews,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      deliveryTime: deliveryTime ?? this.deliveryTime,
      minimumOrder: minimumOrder ?? this.minimumOrder,
      isOpen: isOpen ?? this.isOpen,
      distanceKm: distanceKm ?? this.distanceKm,
    );
  }
}
