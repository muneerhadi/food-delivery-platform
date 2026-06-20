import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../widgets/common/empty_state_widget.dart';
import '../widgets/common/loading_widget.dart';
import 'address_list_controller.dart';

class AddressListScreen extends GetView<AddressListController> {
  const AddressListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Addresses')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => controller.openForm(),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: Obx(() {
        if (controller.isLoading.value) return const LoadingWidget();
        if (controller.addresses.isEmpty) {
          return EmptyStateWidget(
            title: 'No addresses saved',
            subtitle: 'Add an address for faster checkout',
            icon: Icons.location_on_outlined,
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: controller.addresses.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (_, index) {
            final address = controller.addresses[index];
            return Dismissible(
              key: ValueKey(address.id),
              direction: DismissDirection.endToStart,
              onDismissed: (_) => controller.deleteAddress(address.id),
              background: Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(right: 20),
                color: AppColors.error,
                child: const Icon(Icons.delete, color: Colors.white),
              ),
              child: Card(
                child: ListTile(
                  onTap: () => controller.setDefault(address),
                  title: Row(
                    children: [
                      Text(address.label, style: AppTheme.heading4),
                      if (address.isDefault) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text('Default', style: AppTheme.caption.copyWith(color: AppColors.primary)),
                        ),
                      ],
                    ],
                  ),
                  subtitle: Text('${address.address}${address.city != null ? ', ${address.city}' : ''}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.edit_outlined),
                    onPressed: () => controller.openForm(address),
                  ),
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
