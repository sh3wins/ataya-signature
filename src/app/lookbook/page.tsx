import type { Metadata } from "next";
import Lookbook from "@/components/lookbook/Lookbook";

export const metadata: Metadata = { title: "Lookbook — A day at Ataya", description: "An editorial film you control with your scroll." };

export default function LookbookPage() {
  return <Lookbook />;
}
