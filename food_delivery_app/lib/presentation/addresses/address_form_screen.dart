import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../widgets/common/custom_button.dart';
import '../widgets/common/custom_text_field.dart';
import 'address_form_controller.dart';

class AddressFormScreen extends GetView<AddressFormController> {
  const AddressFormScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(controller.editing == null ? 'Add Address' : 'Edit Address')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Obx(() => Wrap(
                  spacing: 8,
                  children: AddressFormController.labels.map((label) {
                    final selected = controller.selectedLabel.value == label;
                    return ChoiceChip(
                      label: Text(label),
                      selected: selected,
                      onSelected: (_) {
                        controller.selectedLabel.value = label;
                        controller.labelController.text = label;
                      },
                    );
                  }).toList(),
                )),
            const SizedBox(height: 16),
            CustomTextField(
              controller: controller.addressController,
              label: 'Address',
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            CustomTextField(controller: controller.cityController, label: 'City'),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: controller.useMyLocation,
              icon: const Icon(Icons.my_location),
              label: const Text('Use My Location'),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: Obx(() => GoogleMap(
                    initialCameraPosition: CameraPosition(target: controller.mapCenter, zoom: 14),
                    onTap: controller.onMapTap,
                    markers: controller.lat.value != null && controller.lng.value != null
                        ? {
                            Marker(
                              markerId: const MarkerId('selected'),
                              position: LatLng(controller.lat.value!, controller.lng.value!),
                            ),
                          }
                        : {},
                  )),
            ),
            const SizedBox(height: 24),
            Obx(() => CustomButton(
                  label: 'Save Address',
                  isLoading: controller.isSaving.value,
                  onPressed: controller.save,
                )),
          ],
        ),
      ),
    );
  }
}
