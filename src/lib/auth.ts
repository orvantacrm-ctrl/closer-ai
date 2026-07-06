import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Business, Subscription, User } from "@prisma/client";

const ANONYMOUS_USER_ID = "no-auth-user";
const ANONYMOUS_USER_EMAIL = "no-auth@local";

export async function getCurrentUser(): Promise<User | null> {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return db.user.findUnique({ where: { clerkId: ANONYMOUS_USER_ID } });
  }

  const { userId } = await auth();
  if (!userId) return null;

  return db.user.findUnique({ where: { clerkId: userId } });
}

export async function getOrCreateUser(
  clerkUser?: Awaited<ReturnType<typeof currentUser>>,
): Promise<User> {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const existingUser = await db.user.findUnique({ where: { clerkId: ANONYMOUS_USER_ID } });
    if (existingUser) return existingUser;

    return db.user.create({
      data: {
        clerkId: ANONYMOUS_USER_ID,
        email: ANONYMOUS_USER_EMAIL,
        name: "Demo User",
      },
    });
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const resolvedClerkUser = clerkUser ?? (await currentUser());
  const email =
    resolvedClerkUser?.emailAddresses.find(
      (e) => e.id === resolvedClerkUser.primaryEmailAddressId,
    )?.emailAddress ?? `${userId}@placeholder.local`;

  console.log("[auth] getOrCreateUser", { clerkId: userId, email });

  const existingByClerkId = await db.user.findUnique({ where: { clerkId: userId } });
  if (existingByClerkId) {
    console.log("[auth] existing user found by clerkId", {
      clerkId: userId,
      userId: existingByClerkId.id,
    });
    return existingByClerkId;
  }

  const existingByEmail = await db.user.findUnique({ where: { email } });
  if (existingByEmail) {
    console.log("[auth] existing user found by email", {
      clerkId: userId,
      email,
      userId: existingByEmail.id,
      currentClerkId: existingByEmail.clerkId,
    });

    const updatedUser = await db.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId: userId,
        name: resolvedClerkUser?.fullName ?? resolvedClerkUser?.firstName ?? existingByEmail.name,
      },
    });

    console.log("[auth] updated existing user with clerkId", {
      clerkId: userId,
      userId: updatedUser.id,
    });
    return updatedUser;
  }

  const createdUser = await db.user.create({
    data: {
      clerkId: userId,
      email,
      name: resolvedClerkUser?.fullName ?? resolvedClerkUser?.firstName ?? null,
    },
  });

  console.log("[auth] newly created user", {
    clerkId: userId,
    email,
    userId: createdUser.id,
  });
  return createdUser;
}

export type BusinessWithSubscription = Business & {
  subscription: Subscription | null;
};

export async function getActiveBusiness(
  userId: string
): Promise<BusinessWithSubscription | null> {
  return db.business.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { subscription: true },
  });
}

export async function getOrCreateBusiness(userId: string): Promise<BusinessWithSubscription> {
  const business = await getActiveBusiness(userId);
  if (business) return business;

  return db.business.create({
    data: {
      userId,
      name: "Default Business",
      email: "",
      timezone: "America/New_York",
    },
    include: { subscription: true },
  });
}

export async function requireBusiness(): Promise<BusinessWithSubscription> {
  const user = await getOrCreateUser();
  const business = await getOrCreateBusiness(user.id);

  return business;
}
