import 'dart:ui';

import 'package:flutter/material.dart';

import '../../../app/theme/sofra_colors.dart';

class SofraBrandBackground extends StatelessWidget {
  const SofraBrandBackground({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.symmetric(horizontal: 24),
    this.showTopLeaf = true,
    this.showBottomLeaf = true,
    this.backgroundColor = SofraColors.background,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final bool showTopLeaf;
  final bool showBottomLeaf;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        ColoredBox(color: backgroundColor),
        const Positioned(
          top: -110,
          right: -90,
          child: _SoftBlob(size: 260),
        ),
        const Positioned(
          bottom: -120,
          left: -100,
          child: _SoftBlob(size: 280),
        ),
        const Positioned(
          top: 150,
          left: -70,
          child: _SoftBlob(size: 150, opacity: 0.7),
        ),
        if (showTopLeaf)
          const Positioned(
            top: 18,
            left: 18,
            child: SofraLeafCluster(size: 74),
          ),
        if (showBottomLeaf)
          const Positioned(
            right: 18,
            bottom: 28,
            child: SofraLeafCluster(size: 86, mirrored: true),
          ),
        SafeArea(
          child: Padding(
            padding: padding,
            child: child,
          ),
        ),
      ],
    );
  }
}

class SofraLogo extends StatelessWidget {
  const SofraLogo({
    super.key,
    required this.asset,
    this.width = 128,
  });

  final String asset;
  final double width;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      asset,
      width: width,
      fit: BoxFit.contain,
      gaplessPlayback: true,
    );
  }
}

class SofraPrimaryButton extends StatelessWidget {
  const SofraPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: SofraColors.darkGreen.withValues(alpha: 0.2),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: SofraColors.darkGreen,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
        child: isLoading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white),
              )
            : Text(
                label,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
      ),
    );
  }
}

/// Shared glass surface styling for onboarding / greeting screens.
class SofraGlassSurface extends StatelessWidget {
  const SofraGlassSurface({
    super.key,
    required this.child,
    this.borderRadius = const BorderRadius.all(Radius.circular(18)),
    this.padding = EdgeInsets.zero,
    this.blurSigma = 18,
    this.tint = SofraGlassTint.primary,
  });

  final Widget child;
  final BorderRadius borderRadius;
  final EdgeInsetsGeometry padding;
  final double blurSigma;
  final SofraGlassTint tint;

  @override
  Widget build(BuildContext context) {
    final tintColors = switch (tint) {
      SofraGlassTint.primary => (
          top: Colors.white.withValues(alpha: 0.78),
          bottom: SofraColors.softGreen.withValues(alpha: 0.42),
          border: Colors.white.withValues(alpha: 0.92),
          shadow: SofraColors.darkGreen.withValues(alpha: 0.16),
        ),
      SofraGlassTint.secondary => (
          top: Colors.white.withValues(alpha: 0.62),
          bottom: Colors.white.withValues(alpha: 0.28),
          border: Colors.white.withValues(alpha: 0.82),
          shadow: SofraColors.mutedGold.withValues(alpha: 0.12),
        ),
    };

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        boxShadow: [
          BoxShadow(
            color: tintColors.shadow,
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [tintColors.top, tintColors.bottom],
              ),
              borderRadius: borderRadius,
              border: Border.all(color: tintColors.border, width: 1.35),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

enum SofraGlassTint { primary, secondary }

/// Frosted glass primary action — used on onboarding / greeting screens.
class SofraGlassButton extends StatelessWidget {
  const SofraGlassButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return SofraGlassSurface(
      tint: SofraGlassTint.primary,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(18),
          child: SizedBox(
            width: double.infinity,
            height: 56,
            child: Center(
              child: isLoading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: SofraColors.darkGreen,
                      ),
                    )
                  : Text(
                      label,
                      style: const TextStyle(
                        color: SofraColors.darkGreen,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.2,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Frosted glass secondary action (Skip / Sign in).
class SofraGlassTextButton extends StatelessWidget {
  const SofraGlassTextButton({
    super.key,
    required this.label,
    required this.onPressed,
  });

  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SofraGlassSurface(
      tint: SofraGlassTint.secondary,
      borderRadius: const BorderRadius.all(Radius.circular(14)),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: SofraColors.mutedGold,
                fontSize: 16,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.15,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class SofraLeafCluster extends StatelessWidget {
  const SofraLeafCluster({
    super.key,
    this.size = 80,
    this.mirrored = false,
  });

  final double size;
  final bool mirrored;

  @override
  Widget build(BuildContext context) {
    final leaves = SizedBox(
      width: size,
      height: size,
      child: Stack(
        children: [
          Positioned(
            left: size * 0.28,
            top: size * 0.1,
            child: _Leaf(width: size * 0.22, height: size * 0.42, angle: -0.7),
          ),
          Positioned(
            left: size * 0.48,
            top: size * 0.28,
            child: _Leaf(width: size * 0.2, height: size * 0.34, angle: 0.9),
          ),
          Positioned(
            left: size * 0.08,
            top: size * 0.42,
            child: _Leaf(width: size * 0.18, height: size * 0.3, angle: -1.2),
          ),
          Positioned(
            right: size * 0.12,
            bottom: size * 0.1,
            child: _GoldDot(size: size * 0.08),
          ),
          Positioned(
            right: size * 0.32,
            bottom: size * 0.26,
            child: _GoldDot(size: size * 0.06),
          ),
        ],
      ),
    );

    if (!mirrored) return leaves;
    return Transform.flip(flipX: true, child: leaves);
  }
}

class _SoftBlob extends StatelessWidget {
  const _SoftBlob({
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

class _Leaf extends StatelessWidget {
  const _Leaf({
    required this.width,
    required this.height,
    required this.angle,
  });

  final double width;
  final double height;
  final double angle;

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: angle,
      child: Container(
        width: width,
        height: height,
        decoration: const BoxDecoration(
          color: SofraColors.gold,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(40),
            bottomRight: Radius.circular(40),
            topRight: Radius.circular(8),
            bottomLeft: Radius.circular(8),
          ),
        ),
      ),
    );
  }
}

class _GoldDot extends StatelessWidget {
  const _GoldDot({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        color: SofraColors.gold,
        shape: BoxShape.circle,
      ),
    );
  }
}
