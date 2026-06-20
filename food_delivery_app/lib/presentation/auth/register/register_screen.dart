import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../app/theme/sofra_colors.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/constants/site_constants.dart';
import '../../../core/utils/validators.dart';
import '../../widgets/common/custom_text_field.dart';
import '../../widgets/sofra/sofra_brand_background.dart';
import 'register_controller.dart';

class RegisterScreen extends GetView<RegisterController> {
  const RegisterScreen({super.key});

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
                  const SizedBox(height: 24),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: IconButton.filledTonal(
                      onPressed: controller.goToLogin,
                      style:
                          IconButton.styleFrom(backgroundColor: Colors.white),
                      icon: const Icon(Icons.arrow_back_ios_new,
                          color: SofraColors.darkGreen, size: 18),
                    ),
                  ),
                  const Center(
                      child: SofraLogo(asset: AppAssets.logo, width: 116)),
                  const SizedBox(height: 14),
                  const Text(
                    'Create Account',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: SofraColors.darkGreen,
                      fontSize: 31,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Join Sofra and get your favorites delivered.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: SofraColors.textSecondary,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 24),
                  _RegisterCard(
                    child: Column(
                      children: [
                        CustomTextField(
                          controller: controller.nameController,
                          label: 'Full Name',
                          validator: (v) => Validators.required(v, 'Name'),
                          prefixIcon: const Icon(Icons.person_outline,
                              color: SofraColors.darkGreen),
                        ),
                        const SizedBox(height: 14),
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
                          controller: controller.phoneController,
                          label: 'Phone Number',
                          keyboardType: TextInputType.phone,
                          prefixIcon: const Icon(Icons.phone_outlined,
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
                        const SizedBox(height: 14),
                        CustomTextField(
                          controller: controller.confirmPasswordController,
                          label: 'Confirm Password',
                          obscureText: true,
                          validator: (v) => Validators.confirmPassword(
                              v, controller.passwordController.text),
                          prefixIcon: const Icon(Icons.verified_user_outlined,
                              color: SofraColors.darkGreen),
                        ),
                        const SizedBox(height: 14),
                        const _TermsRow(),
                      ],
                    ),
                  ),
                  const SizedBox(height: 22),
                  Obx(
                    () => SofraPrimaryButton(
                      label: 'Sign Up',
                      isLoading: controller.isLoading.value,
                      onPressed: controller.register,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Already have an account? ',
                        style: TextStyle(color: SofraColors.textSecondary),
                      ),
                      GestureDetector(
                        onTap: controller.goToLogin,
                        child: const Text(
                          'Login',
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

class _RegisterCard extends StatelessWidget {
  const _RegisterCard({required this.child});

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

class _TermsRow extends StatelessWidget {
  const _TermsRow();

  Future<void> _open(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(5),
            border: Border.all(color: SofraColors.border, width: 1.5),
          ),
          child:
              const Icon(Icons.check, size: 14, color: SofraColors.darkGreen),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text.rich(
            TextSpan(
              text: 'I agree to the ',
              style: const TextStyle(color: SofraColors.textSecondary, fontSize: 13),
              children: [
                TextSpan(
                  text: 'Terms',
                  style: const TextStyle(
                    color: SofraColors.darkGreen,
                    fontWeight: FontWeight.w800,
                  ),
                  recognizer: TapGestureRecognizer()
                      ..onTap = () => _open(SiteConstants.termsUrl),
                ),
                const TextSpan(text: ' & '),
                TextSpan(
                  text: 'Privacy',
                  style: const TextStyle(
                    color: SofraColors.darkGreen,
                    fontWeight: FontWeight.w800,
                  ),
                  recognizer: TapGestureRecognizer()
                      ..onTap = () => _open(SiteConstants.privacyUrl),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
