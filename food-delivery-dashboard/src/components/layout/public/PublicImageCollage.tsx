import Image from "next/image";
import { showcaseImages } from "@/lib/public-sections";

export function PublicImageCollage() {
  return (
    <div className="public-collage">
      <div className="public-collage-main">
        <Image
          src={showcaseImages.main.src}
          alt={showcaseImages.main.alt}
          width={520}
          height={640}
          className="h-full w-full object-cover"
          unoptimized
        />
        <div className="public-collage-badge">30 min avg.</div>
        <p className="public-collage-overlay-title">Fresh today</p>
      </div>

      <div className="public-collage-side">
        <div className="public-collage-side-card public-collage-side-card--tall">
          <Image
            src={showcaseImages.sideTop.src}
            alt={showcaseImages.sideTop.alt}
            width={240}
            height={320}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
        <div className="public-collage-side-card">
          <Image
            src={showcaseImages.sideBottom.src}
            alt={showcaseImages.sideBottom.alt}
            width={240}
            height={200}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
      </div>

      <div className="public-collage-thumbs">
        {showcaseImages.thumbs.map((image, index) => (
          <div key={`${image.src}-${index}`} className="public-collage-thumb">
            <Image
              src={image.src}
              alt={image.alt}
              width={160}
              height={100}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
