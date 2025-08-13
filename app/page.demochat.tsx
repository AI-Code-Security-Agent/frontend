"use client";

import { CreateDemoChatSession } from "@/components/demo/CreateDemoChatSession";

export default function DemoChatPreview() {
  return (
    <div className="min-h-screen bg-background">
      <CreateDemoChatSession />
    </div>
  );
}