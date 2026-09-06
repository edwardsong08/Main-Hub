import type { Metadata } from "next";
import { HubExperience } from "@/components/hub-experience";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ProfileEmbed() {
  return <HubExperience profileEmbed />;
}
