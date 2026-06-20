import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../app/routes/app_routes.dart';
import '../../app/theme/sofra_colors.dart';
import '../../core/constants/app_assets.dart';
import '../widgets/sofra/sofra_brand_background.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;
  static const _imageBackground = Color(0xFFFCFCF9);

  static const _pages = [
    _OnboardingPageData(
      title: 'Healthy Meals,\nDelivered Fast',
      highlightedText: 'Delivered Fast',
      description:
          'Order wholesome meals from nearby kitchens and trusted restaurants.',
      imageAsset: AppAssets.onboardingGreetingHero,
    ),
    _OnboardingPageData(
      title: 'Choose What\nYou Love',
      highlightedText: 'You Love',
      description:
          'Browse top-rated spots and discover dishes that match your taste.',
      imageAsset: AppAssets.onboardingRestaurantsHero,
    ),
    _OnboardingPageData(
      title: 'Track Every\nOrder',
      highlightedText: 'Order',
      description:
          'Follow your delivery from kitchen to door with simple live updates.',
      imageAsset: AppAssets.onboardingTrackingHero,
    ),
  ];

  bool get _isLastPage => _currentPage == _pages.length - 1;

  @override
  void initState() {
    super.initState();
    // Assets are being replaced during development; clear stale decoded images.
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToAuth() => Get.offAllNamed(AppRoutes.login);

  void _next() {
    if (_isLastPage) {
      _goToAuth();
      return;
    }

    _pageController.nextPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SofraBrandBackground(
        backgroundColor: _imageBackground,
        padding: const EdgeInsets.symmetric(horizontal: 26),
        child: Column(
          children: [
            const SizedBox(height: 10),
            const SofraLogo(asset: AppAssets.logo, width: 122),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _pages.length,
                onPageChanged: (page) => setState(() => _currentPage = page),
                itemBuilder: (context, index) {
                  return _OnboardingPage(page: _pages[index]);
                },
              ),
            ),
            _Dots(currentPage: _currentPage, pageCount: _pages.length),
            const SizedBox(height: 20),
            SofraGlassButton(
              label: _isLastPage ? 'Get Started' : 'Next',
              onPressed: _next,
            ),
            const SizedBox(height: 10),
            SofraGlassTextButton(
              label: _isLastPage ? 'Sign in' : 'Skip',
              onPressed: _goToAuth,
            ),
            const SizedBox(height: 14),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.page});

  final _OnboardingPageData page;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 8),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Image.asset(
              page.imageAsset,
              fit: BoxFit.contain,
              filterQuality: FilterQuality.high,
            ),
          ),
        ),
        const SizedBox(height: 12),
        _HighlightedTitle(
          title: page.title,
          highlightedText: page.highlightedText,
        ),
        const SizedBox(height: 10),
        Text(
          page.description,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: SofraColors.textSecondary,
            fontSize: 15.5,
            height: 1.35,
          ),
        ),
        const SizedBox(height: 4),
      ],
    );
  }
}

class _HighlightedTitle extends StatelessWidget {
  const _HighlightedTitle({
    required this.title,
    required this.highlightedText,
  });

  final String title;
  final String highlightedText;

  @override
  Widget build(BuildContext context) {
    final parts = title.split(highlightedText);
    return Text.rich(
      TextSpan(
        children: [
          TextSpan(text: parts.first),
          TextSpan(
            text: highlightedText,
            style: const TextStyle(color: SofraColors.mutedGold),
          ),
          if (parts.length > 1) TextSpan(text: parts.last),
        ],
      ),
      textAlign: TextAlign.center,
      style: const TextStyle(
        color: SofraColors.darkGreen,
        fontSize: 36,
        fontWeight: FontWeight.w900,
        height: 1.07,
      ),
    );
  }
}

class _Dots extends StatelessWidget {
  const _Dots({
    required this.currentPage,
    required this.pageCount,
  });

  final int currentPage;
  final int pageCount;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(pageCount, (index) {
        final isActive = currentPage == index;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          margin: const EdgeInsets.symmetric(horizontal: 7),
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: isActive ? SofraColors.darkGreen : SofraColors.border,
            shape: BoxShape.circle,
          ),
        );
      }),
    );
  }
}

class _OnboardingPageData {
  const _OnboardingPageData({
    required this.title,
    required this.highlightedText,
    required this.description,
    required this.imageAsset,
  });

  final String title;
  final String highlightedText;
  final String description;
  final String imageAsset;
}
