import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';

import '../../../app/routes/app_routes.dart';
import '../../../core/constants/dev_host.dart';
import '../../../core/network/api_exception.dart';
import '../../../data/repositories/auth_repository.dart';

class LoginController extends GetxController {
  final AuthRepository _authRepository = Get.find();

  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final formKey = GlobalKey<FormState>();
  final isLoading = false.obs;
  final serverUrl = DevHost.apiUrl.obs;

  @override
  void onInit() {
    super.onInit();
    _refreshServerUrl();
  }

  void _refreshServerUrl() {
    serverUrl.value = DevHost.apiUrl;
  }

  Future<void> login() async {
    if (!formKey.currentState!.validate()) return;
    isLoading.value = true;
    try {
      await _authRepository.login(
        emailController.text.trim(),
        passwordController.text,
      );
      Fluttertoast.showToast(msg: 'Welcome back!');
      Get.offAllNamed(AppRoutes.home);
    } on ApiException catch (e) {
      Fluttertoast.showToast(msg: e.message);
    } catch (e) {
      Fluttertoast.showToast(msg: 'Login failed');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> showServerSettings() async {
    final hostController = TextEditingController(text: DevHost.host);
    await Get.dialog(
      AlertDialog(
        title: const Text('Server connection'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'USB cable: use 127.0.0.1 (run adb reverse tcp:8000 tcp:8000 on PC).\n'
                'Wi‑Fi: use your PC IPv4 from ipconfig — phone and PC must be on the same network.',
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    label: Text('USB (${DevHost.usbHost})'),
                    onPressed: () => hostController.text = DevHost.usbHost,
                  ),
                  ActionChip(
                    label: Text('Wi‑Fi (${DevHost.phoneHost})'),
                    onPressed: () => hostController.text = DevHost.phoneHost,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: hostController,
                decoration: const InputDecoration(
                  labelText: 'Server IP address',
                  hintText: '127.0.0.1 or 172.16.230.14',
                ),
                keyboardType: TextInputType.number,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final ok = await _testConnection(hostController.text.trim());
              Fluttertoast.showToast(
                msg: ok ? 'Server reachable' : 'Cannot reach server',
              );
            },
            child: const Text('Test'),
          ),
          TextButton(
            onPressed: () async {
              await DevHost.resetHost();
              _refreshServerUrl();
              Get.back();
              Fluttertoast.showToast(msg: 'Server reset to default');
            },
            child: const Text('Reset'),
          ),
          TextButton(onPressed: Get.back, child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              final host = hostController.text.trim();
              await DevHost.setHost(host);
              _refreshServerUrl();
              Get.back();
              final ok = await _testConnection(host);
              Fluttertoast.showToast(
                msg: ok
                    ? 'Server updated and reachable'
                    : 'Saved, but server not reachable yet',
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    hostController.dispose();
  }

  Future<bool> _testConnection(String host) async {
    final normalizedHost = DevHost.normalizeHostInput(host);
    if (normalizedHost == null) return false;
    try {
      final dio = Dio(
        BaseOptions(
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 5),
          headers: {'Accept': 'application/json'},
        ),
      );
      final response = await dio.get(
        'http://$normalizedHost:${DevHost.apiPort}/api/auth/login',
        options: Options(validateStatus: (_) => true),
      );
      return response.statusCode != null;
    } catch (_) {
      return false;
    }
  }

  void goToRegister() => Get.toNamed(AppRoutes.register);

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
