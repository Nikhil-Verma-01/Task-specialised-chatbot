"use client";

import { useEffect, useState } from "react";

import { SetupForm } from "@/components/setup-form";
import { loadChatSession } from "@/lib/storage";
import { MentorContext } from "@/types/chat";

export function HomeSetupPage() {
  const [initialValue, setInitialValue] = useState<Partial<MentorContext>>();

  useEffect(() => {
    setInitialValue(loadChatSession()?.context);
  }, []);

  return <SetupForm initialValue={initialValue} />;
}
