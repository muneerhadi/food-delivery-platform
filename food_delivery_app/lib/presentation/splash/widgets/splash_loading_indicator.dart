import 'package:flutter/material.dart';

import '../../../app/theme/sofra_colors.dart';

class SplashLoadingIndicator extends StatefulWidget {
  const SplashLoadingIndicator({super.key});

  @override
  State<SplashLoadingIndicator> createState() => _SplashLoadingIndicatorState();
}

class _SplashLoadingIndicatorState extends State<SplashLoadingIndicator> {
  int _activeIndex = 0;

  @override
  void initState() {
    super.initState();
    _startAnimation();
  }

  Future<void> _startAnimation() async {
    while (mounted) {
      await Future.delayed(const Duration(milliseconds: 400));
      if (!mounted) return;
      setState(() => _activeIndex = (_activeIndex + 1) % 3);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            final isActive = index == _activeIndex;
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 5),
              width: isActive ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: isActive ? SofraColors.darkGreen : SofraColors.border,
              ),
            );
          }),
        ),
      ],
    );
  }
}
