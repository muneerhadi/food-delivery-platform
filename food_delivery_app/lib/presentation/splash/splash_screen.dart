import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../core/constants/app_assets.dart';
import '../../app/theme/sofra_colors.dart';
import '../widgets/sofra/sofra_brand_background.dart';
import 'splash_controller.dart';
import 'widgets/splash_loading_indicator.dart';

class SplashScreen extends GetView<SplashController> {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Ensure SplashController is created so auth redirect runs
    controller;
    return Scaffold(
      backgroundColor: SofraColors.splashBackground,
      body: SofraBrandBackground(
        padding: EdgeInsets.zero,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Center(
              child: Image.asset(
                AppAssets.logo,
                width: MediaQuery.sizeOf(context).width.clamp(320.0, 430.0),
                fit: BoxFit.contain,
                gaplessPlayback: true,
                filterQuality: FilterQuality.high,
              ),
            ),
            const Positioned(
              left: 0,
              right: 0,
              bottom: 80,
              child: SplashLoadingIndicator(),
            ),
          ],
        ),
      ),
    );
  }
}
