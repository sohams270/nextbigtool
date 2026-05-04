import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — NextBigTool",
  description:
    "Simple, transparent pricing for founders and builders. Start free, submit your tool, build in public, and unlock the Founder's CRM to turn upvoters into pipeline.",
  openGraph: {
    title: "Pricing — NextBigTool",
    description:
      "Simple, transparent pricing for founders and builders. Start free, submit your tool, build in public, and unlock the Founder's CRM to turn upvoters into pipeline.",
    url: "https://www.nextbigtool.com/pricing",
    siteName: "NextBigTool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — NextBigTool",
    description:
      "Simple, transparent pricing for founders and builders. Start free, submit your tool, build in public, and unlock the Founder's CRM to turn upvoters into pipeline.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
