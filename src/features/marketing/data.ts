import { getLandingBannersForPublic } from "@/features/marketing/banners";
import { prisma } from "@/lib/prisma";

export async function getMarketingSettings() {
  const settings = await prisma.marketingSettings.findUnique({ where: { id: "default" } });
  return {
    whatsappUrl:
      settings?.whatsappUrl ||
      process.env.NEXT_PUBLIC_WHATSAPP_URL ||
      "https://wa.me/5500000000000",
    blogUrl:
      settings?.blogUrl || process.env.NEXT_PUBLIC_BLOG_URL || "https://blog.cotacondo.com.br",
    pixelScripts: settings?.pixelScripts || null,
    supplierLpHost: settings?.supplierLpHost || null,
  };
}

export async function getActiveBanners() {
  return getLandingBannersForPublic();
}
