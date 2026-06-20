import 'package:flutter/material.dart';

import '../../../app/theme/sofra_colors.dart';
import '../../widgets/sofra/sofra_brand_background.dart';

class SplashDecorations extends StatelessWidget {
  const SplashDecorations({super.key});

  @override
  Widget build(BuildContext context) {
    return const Stack(
      children: [
        Positioned(
          top: -110,
          right: -90,
          child: _SoftSplashBlob(size: 260),
        ),
        Positioned(
          bottom: -120,
          left: -110,
          child: _SoftSplashBlob(size: 290),
        ),
        Positioned(
          top: 120,
          left: -70,
          child: _SoftSplashBlob(size: 150, opacity: 0.65),
        ),
        Positioned(
          top: 18,
          left: 18,
          child: SofraLeafCluster(size: 84),
        ),
        Positioned(
          right: 20,
          bottom: 26,
          child: SofraLeafCluster(size: 92, mirrored: true),
        ),
      ],
    );
  }
}

class _SoftSplashBlob extends StatelessWidget {
  const _SoftSplashBlob({
    required this.size,
    this.opacity = 1,
  });

  final double size;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: SofraColors.softGreen.withValues(alpha: opacity),
        borderRadius: BorderRadius.circular(size * 0.38),
      ),
    );
  }
}
