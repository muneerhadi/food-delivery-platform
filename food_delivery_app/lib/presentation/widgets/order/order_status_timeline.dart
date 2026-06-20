import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';

class OrderStatusTimeline extends StatefulWidget {
  final String currentStatus;

  const OrderStatusTimeline({super.key, required this.currentStatus});

  static const steps = [
    ('pending', 'Order Placed'),
    ('confirmed', 'Confirmed'),
    ('preparing', 'Preparing'),
    ('ready', 'Ready'),
    ('picked_up', 'Picked Up'),
    ('on_the_way', 'On The Way'),
    ('delivered', 'Delivered'),
  ];

  @override
  State<OrderStatusTimeline> createState() => _OrderStatusTimelineState();
}

class _OrderStatusTimelineState extends State<OrderStatusTimeline>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  int get _currentIndex {
    final idx = OrderStatusTimeline.steps.indexWhere((s) => s.$1 == widget.currentStatus);
    return idx < 0 ? 0 : idx;
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: List.generate(OrderStatusTimeline.steps.length, (index) {
          final step = OrderStatusTimeline.steps[index];
          final isCompleted = index < _currentIndex;
          final isCurrent = index == _currentIndex;
          final isUpcoming = index > _currentIndex;

          return Row(
            children: [
              Column(
                children: [
                  _StepCircle(
                    isCompleted: isCompleted,
                    isCurrent: isCurrent,
                    pulseController: isCurrent ? _pulseController : null,
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: 72,
                    child: Text(
                      step.$2,
                      textAlign: TextAlign.center,
                      style: AppTheme.caption.copyWith(
                        fontWeight: isCurrent ? FontWeight.w600 : FontWeight.normal,
                        color: isUpcoming ? AppColors.textSecondary : AppColors.textPrimary,
                      ),
                      maxLines: 2,
                    ),
                  ),
                ],
              ),
              if (index < OrderStatusTimeline.steps.length - 1)
                Container(
                  width: 24,
                  height: 2,
                  margin: const EdgeInsets.only(bottom: 28),
                  color: isCompleted ? AppColors.success : AppColors.border,
                ),
            ],
          );
        }),
      ),
    );
  }
}

class _StepCircle extends StatelessWidget {
  final bool isCompleted;
  final bool isCurrent;
  final AnimationController? pulseController;

  const _StepCircle({
    required this.isCompleted,
    required this.isCurrent,
    this.pulseController,
  });

  @override
  Widget build(BuildContext context) {
    Widget circle = Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isCompleted
            ? AppColors.success
            : isCurrent
                ? AppColors.primary
                : Colors.transparent,
        border: Border.all(
          color: isUpcoming ? AppColors.border : (isCompleted ? AppColors.success : AppColors.primary),
          width: 2,
        ),
      ),
      child: isCompleted
          ? const Icon(Icons.check, size: 12, color: Colors.white)
          : null,
    );

    if (isCurrent && pulseController != null) {
      circle = AnimatedBuilder(
        animation: pulseController!,
        builder: (context, child) {
          return Container(
            padding: EdgeInsets.all(4 * pulseController!.value),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withValues(alpha: 0.15 * (1 - pulseController!.value)),
            ),
            child: child,
          );
        },
        child: circle,
      );
    }

    return circle;
  }

  bool get isUpcoming => !isCompleted && !isCurrent;
}
