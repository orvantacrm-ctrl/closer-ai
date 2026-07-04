"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function ClerkStatusLogger() {
  const { userId, sessionId, isLoaded, isSignedIn } = useAuth();
  const publishableKeyConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  useEffect(() => {
    console.log("[Clerk] initialized", {
      publishableKeyConfigured,
      isLoaded,
      isSignedIn,
      userId,
      sessionId,
    });

    if (!publishableKeyConfigured) {
      console.warn("[Clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set.");
    }
  }, [publishableKeyConfigured, isLoaded, isSignedIn, userId, sessionId]);

  return null;
}
