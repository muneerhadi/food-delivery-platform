import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../app/theme/sofra_colors.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/utils/validators.dart';
import '../../widgets/common/custom_text_field.dart';
import '../../widgets/sofra/sofra_brand_background.dart';
import 'login_controller.dart';

class LoginScreen extends GetView<LoginController> {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SofraBrandBackground(
        child: SingleChildScrollView(
          child: Form(
            key: controller.formKey,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: MediaQuery.sizeOf(context).height -
                    MediaQuery.paddingOf(context).vertical,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 36),
                  const Center(
                      child: SofraLogo(asset: AppAssets.logo, width: 132)),
                  const SizedBox(height: 22),
                  const Text(
                    'Welcome Back',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: SofraColors.darkGreen,
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Sign in to continue your food journey',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: SofraColors.textSecondary,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Obx(
                    () => TextButton(
                      onPressed: controller.showServerSettings,
                      child: Text(
                        'Server: ${controller.serverUrl.value}',
                        style: const TextStyle(
                          color: SofraColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                  _AuthCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        CustomTextField(
                          controller: controller.emailController,
                          label: 'Email Address',
                          keyboardType: TextInputType.emailAddress,
                          validator: Validators.email,
                          prefixIcon: const Icon(Icons.mail_outline,
                              color: SofraColors.darkGreen),
                        ),
                        const SizedBox(height: 14),
                        CustomTextField(
                          controller: controller.passwordController,
                          label: 'Password',
                          obscureText: true,
                          validator: Validators.password,
                          prefixIcon: const Icon(Icons.lock_outline,
                              color: SofraColors.darkGreen),
                          suffixIcon: const Icon(Icons.visibility_outlined,
                              color: SofraColors.textSecondary),
                        ),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {},
                            child: const Text(
                              'Forgot password?',
                              style: TextStyle(
                                  color: SofraColors.mutedGold,
                                  fontWeight: FontWeight.w700),
                            ),
                          ),
                        ),
                        Obx(
                          () => SofraPrimaryButton(
                            label: 'Login',
                            isLoading: controller.isLoading.value,
                            onPressed: controller.login,
                          ),
                        ),
                        const SizedBox(height: 18),
                        const _DividerLabel(label: 'or continue with'),
                        const SizedBox(height: 16),
                        const Row(
                          children: [
                            Expanded(
                                child: _SocialButton(
                                    label: 'Google', iconLabel: 'G')),
                            SizedBox(width: 12),
                            Expanded(
                                child: _SocialButton(
                                    label: 'Apple', icon: Icons.apple)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account? ",
                        style: TextStyle(color: SofraColors.textSecondary),
                      ),
                      GestureDetector(
                        onTap: controller.goToRegister,
                        child: const Text(
                          'Sign up',
                          style: TextStyle(
                            color: SofraColors.darkGreen,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AuthCard extends StatelessWidget {
  const _AuthCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SofraColors.card,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 28,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _DividerLabel extends StatelessWidget {
  const _DividerLabel({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: SofraColors.border)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            label,
            style:
                const TextStyle(color: SofraColors.textSecondary, fontSize: 13),
          ),
        ),
        const Expanded(child: Divider(color: SofraColors.border)),
      ],
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({
    required this.label,
    this.icon,
    this.iconLabel,
  });

  final String label;
  final IconData? icon;
  final String? iconLabel;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: () {},
      style: OutlinedButton.styleFrom(
        foregroundColor: SofraColors.textPrimary,
        side: const BorderSide(color: SofraColors.border),
        minimumSize: const Size(0, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null)
            Icon(icon, size: 20, color: SofraColors.textPrimary),
          if (iconLabel != null)
            Text(
              iconLabel!,
              style: const TextStyle(
                color: SofraColors.gold,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}
