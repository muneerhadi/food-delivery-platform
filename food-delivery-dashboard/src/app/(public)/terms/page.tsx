import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  description: `Terms of service for the ${siteConfig.name} food delivery app.`,
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Acceptance</h2>
          <p>
            By creating an account or using the {siteConfig.name} app, you agree to these Terms of Service and our{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Service description</h2>
          <p>
            {siteConfig.name} provides a platform to browse restaurant menus, place food orders, and receive deliveries.
            Restaurants and drivers are independent partners; we facilitate ordering and communication.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Accounts</h2>
          <p>
            You are responsible for keeping your login credentials secure and for all activity under your account. You must
            provide accurate contact and delivery information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Orders and payments</h2>
          <p>
            Prices, fees, and availability are set by restaurants and shown before you confirm an order. Cancellations and
            refunds follow restaurant and platform policies displayed at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Prohibited use</h2>
          <p>
            You may not misuse the service, interfere with other users, attempt unauthorized access, or use the platform for
            unlawful purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Limitation of liability</h2>
          <p>
            {siteConfig.name} is provided &quot;as is.&quot; To the extent permitted by law, we are not liable for indirect
            damages arising from use of the service. Food quality and preparation are the responsibility of participating
            restaurants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            For questions about these terms, contact{" "}
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
