import 'package:get/get.dart';

import '../../data/repositories/address_repository.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/order_repository.dart';
import '../../data/repositories/profile_repository.dart';
import '../../data/repositories/restaurant_repository.dart';
import '../../presentation/addresses/address_form_controller.dart';
import '../../presentation/addresses/address_list_controller.dart';
import '../../presentation/auth/login/login_controller.dart';
import '../../presentation/auth/register/register_controller.dart';
import '../../presentation/checkout/checkout_controller.dart';
import '../../presentation/cart/home_tab_controller.dart';
import '../../presentation/home/home_controller.dart';
import '../../presentation/home/home_screen.dart';
import '../../presentation/notifications/notification_controller.dart';
import '../../presentation/onboarding/onboarding_screen.dart';
import '../../presentation/orders/order_detail/order_detail_controller.dart';
import '../../presentation/orders/order_list/order_list_controller.dart';
import '../../presentation/orders/order_tracking/order_tracking_controller.dart';
import '../../presentation/profile/profile_controller.dart';
import '../../presentation/restaurants/restaurant_detail/restaurant_detail_controller.dart';
import '../../presentation/restaurants/restaurant_list/restaurant_list_controller.dart';
import '../../presentation/splash/splash_controller.dart';
import '../../presentation/auth/login/login_screen.dart';
import '../../presentation/auth/register/register_screen.dart';
import '../../presentation/checkout/checkout_screen.dart';
import '../../presentation/orders/order_detail/order_detail_screen.dart';
import '../../presentation/orders/order_tracking/order_tracking_screen.dart';
import '../../presentation/restaurants/restaurant_detail/restaurant_detail_screen.dart';
import '../../presentation/splash/splash_screen.dart';
import '../../presentation/cart/cart_screen.dart';
import '../../presentation/addresses/address_list_screen.dart';
import '../../presentation/addresses/address_form_screen.dart';
import 'app_routes.dart';

class AppPages {
  static final pages = [
    GetPage(
      name: AppRoutes.splash,
      page: () => const SplashScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(AuthRepository.new);
        Get.put(SplashController());
      }),
    ),
    GetPage(
      name: AppRoutes.login,
      page: () => const LoginScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(AuthRepository.new);
        Get.lazyPut(LoginController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.onboarding,
      page: () => const OnboardingScreen(),
    ),
    GetPage(
      name: AppRoutes.register,
      page: () => const RegisterScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(AuthRepository.new);
        Get.lazyPut(RegisterController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => const HomeScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(AuthRepository.new);
        Get.lazyPut(RestaurantRepository.new);
        Get.lazyPut(OrderRepository.new);
        Get.lazyPut(ProfileRepository.new);
        Get.lazyPut(HomeTabController.new, fenix: true);
        Get.lazyPut(HomeController.new, fenix: true);
        Get.lazyPut(RestaurantListController.new, fenix: true);
        Get.lazyPut(OrderListController.new, fenix: true);
        Get.lazyPut(NotificationController.new, fenix: true);
        Get.lazyPut(ProfileController.new, fenix: true);
      }),
    ),
    GetPage(
      name: AppRoutes.restaurantDetail,
      page: () => const RestaurantDetailScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(RestaurantRepository.new);
        Get.lazyPut(RestaurantDetailController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.cart,
      page: () => const CartScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(RestaurantRepository.new);
      }),
    ),
    GetPage(
      name: AppRoutes.checkout,
      page: () => const CheckoutScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(AddressRepository.new);
        Get.lazyPut(OrderRepository.new);
        Get.lazyPut(CheckoutController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.orderDetail,
      page: () => const OrderDetailScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(OrderRepository.new);
        Get.lazyPut(OrderDetailController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.orderTracking,
      page: () => const OrderTrackingScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(OrderRepository.new);
        Get.lazyPut(OrderTrackingController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.addressList,
      page: () => const AddressListScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(AddressRepository.new);
        Get.lazyPut(AddressListController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.addressForm,
      page: () => const AddressFormScreen(),
      binding: BindingsBuilder(() {
        Get.lazyPut(AddressRepository.new);
        Get.lazyPut(AddressFormController.new);
      }),
    ),
  ];
}
