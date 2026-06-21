import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function LoginShowcase() {
  return (
    <div className="login-showcase-grid h-full min-h-[640px]">
      <div className="login-showcase-card login-showcase-card--square overflow-hidden">
        <Image
          src="/login/login-collage-kitchen.png"
          alt="Fresh ingredients prepared in local kitchens"
          width={400}
          height={400}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>

      <div className="login-showcase-card login-showcase-card--tall relative overflow-hidden">
        <Image
          src="/login/login-collage-delivery.png"
          alt="Meal delivery arriving at your door"
          width={500}
          height={700}
          className="h-full w-full object-cover"
          unoptimized
        />
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-sofra-text shadow-sm">
          30 min avg.
        </div>
        <p className="absolute bottom-6 left-6 font-serif text-4xl font-bold leading-none text-white drop-shadow-lg">
          Fresh today
        </p>
      </div>

      <div className="login-showcase-card login-showcase-card--text flex flex-col justify-between rounded-[1.35rem] bg-[#f7efe4] p-6 md:p-8">
        <div>
          <h3 className="font-serif text-2xl font-bold leading-tight text-sofra-text md:text-3xl">
            Healthy meals,{" "}
            <span className="italic text-sofra-mutedGold">delivered with care.</span>
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-sofra-textMuted md:text-base">
            Manage restaurants, drivers, and orders from one dashboard built for local food delivery.
          </p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sofra-text transition hover:text-sofra-green"
        >
          Learn more
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="login-showcase-card login-showcase-card--tall relative overflow-hidden">
        <Image
          src="/login/login-collage-sharing.png"
          alt="Friends enjoying food together"
          width={500}
          height={700}
          className="h-full w-full object-cover"
          unoptimized
        />
        <p className="absolute bottom-6 left-6 font-serif text-5xl font-bold italic text-white drop-shadow-lg">New</p>
      </div>
    </div>
  );
}
