import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Center | IGMART",
  description: "Get help with buying, selling, disputes and account issues on IGMART.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
