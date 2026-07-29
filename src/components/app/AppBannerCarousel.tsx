"use client";

import { BannerCarousel, type BannerSlide } from "@/components/marketing/BannerCarousel";

type AppBannerCarouselProps = {
  banners: BannerSlide[];
};

/** Banner rotativo da área autenticada — fica entre o nome da org e o título do recurso. */
export function AppBannerCarousel({ banners }: AppBannerCarouselProps) {
  if (banners.length === 0) return null;
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-black/5">
      <BannerCarousel banners={banners} compact />
    </div>
  );
}
