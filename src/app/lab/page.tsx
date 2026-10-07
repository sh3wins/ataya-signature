import type { Metadata } from "next";
import FlavourLab from "@/components/lab/FlavourLab";

export const metadata: Metadata = { title: "The Flavour Lab", description: "What happens when you mix two flavours?" };

export default function LabPage() {
  return <FlavourLab />;
}
