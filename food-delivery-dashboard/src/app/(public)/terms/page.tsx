import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  description: `Terms of service for the ${siteConfig.name} food delivery app.`,
};

export default function TermsPage() {
  return (
    <article className="public-prose-page mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="public-prose mt-10">
        <section>
          <h2>Acceptance</h2>
          <p>
            By creating an account or using the {siteConfig.name} app, you agree to these Terms of Service and our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2>Service description</h2>
          <p>
            {siteConfig.name} provides a platform to browse restaurant menus, place food orders, and receive deliveries.
            Restaurants and drivers are independent partners; we facilitate ordering and communication.
          </p>
        </section>

        <section>
          <h2>Accounts</h2>
          <p>
            You are responsible for keeping your login credentials secure and for all activity under your account. You must
            provide accurate contact and delivery information.
          </p>
        </section>

        <section>
          <h2>Orders and payments</h2>
          <p>
            Prices, fees, and availability are set by restaurants and shown before you confirm an order. Cancellations and
            refunds follow restaurant and platform policies displayed at checkout.
          </p>
        </section>

        <section>
          <h2>Prohibited use</h2>
          <p>
            You may not misuse the service, interfere with other users, attempt unauthorized access, or use the platform for
            unlawful purposes.
          </p>
        </section>

        <section>
          <h2>Limitation of liability</h2>
          <p>
            {siteConfig.name} is provided &quot;as is.&quot; To the extent permitted by law, we are not liable for indirect
            damages arising from use of the service. Food quality and preparation are the responsibility of participating
            restaurants.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For questions about these terms, contact{" "}
            <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
          </p>
        </section>
      </div>

      <p className="relative mt-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 transition hover:underline"
        >
          ← Back to home
        </Link>
      </p>
    </article>
  );
}
