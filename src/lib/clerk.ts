export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}

export function requireClerkConfigured(): void {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is not configured.");
  }

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not configured.");
  }
}
