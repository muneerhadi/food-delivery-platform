import 'package:intl/intl.dart';

class Helpers {
  static String formatCurrency(num amount) {
    return NumberFormat.currency(symbol: '\$', decimalDigits: 2).format(amount);
  }

  static String formatDate(String? date) {
    if (date == null) return '';
    try {
      return DateFormat('MMM d, yyyy • h:mm a').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  static String timeAgo(String? date) {
    if (date == null) return '';
    try {
      final dt = DateTime.parse(date);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (_) {
      return date;
    }
  }

  static String greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
