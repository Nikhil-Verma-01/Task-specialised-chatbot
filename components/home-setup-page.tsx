"use client";

import { useEffect, useState } from "react";

import { SetupForm } from "@/components/setup-form";
import { loadChatSession } from "@/lib/storage";
import { MentorContext } from "@/types/chat";

export function HomeSetupPage() {
  const [initialValue, setInitialValue] = useState<Partial<MentorContext>>();

  useEffect(() => {
    const storedSession = loadChatSession();

    if (storedSession) {
      setInitialValue(storedSession.context);
    }
  }, []);

  return <SetupForm initialValue={initialValue} />;
}
