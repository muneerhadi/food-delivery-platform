import 'package:get/get.dart';

class HomeTabController extends GetxController {
  final currentIndex = 0.obs;

  void changeTab(int index) => currentIndex.value = index;

  void goToHome() => currentIndex.value = 0;

  void goToCart() => currentIndex.value = 1;
}
