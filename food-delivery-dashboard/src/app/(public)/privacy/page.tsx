import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `Privacy policy for the ${siteConfig.name} food delivery app.`,
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <p>
            {siteConfig.name} (&quot;we&quot;, &quot;our&quot;) operates a food delivery platform that connects customers,
            restaurants, and drivers. This policy explains how we collect, use, and protect your information when you use
            our mobile app and related services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Information we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details such as name, email, phone number, and delivery addresses</li>
            <li>Order history, payment method type, and delivery preferences</li>
            <li>Device information and push notification tokens for order updates</li>
            <li>Location data when you allow it, to show nearby restaurants and track deliveries</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">How we use your information</h2>
          <p>
            We use your data to process orders, communicate status updates, improve our service, and provide customer
            support. We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Sharing with partners</h2>
          <p>
            Order details are shared with the restaurant preparing your food and the driver delivering it, as needed to
            complete your order. Payment processing may involve trusted payment providers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Your choices</h2>
          <p>
            You may update profile information in the app, manage notification settings, and contact us to request account
            deletion or data inquiries at{" "}
            <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
              {siteConfig.supportEmail}
            </a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
              {siteConfig.supportEmail}
            </a>.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm">
        <Link href="/" className="text-primary hover:underline">← Back to home</Link>
      </p>
    </article>
  );
}
