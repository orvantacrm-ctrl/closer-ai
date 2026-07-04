import { PrismaClient } from "@prisma/client";
import { startOfDay, subDays } from "date-fns";

const db = new PrismaClient();

async function main() {
  const demoClerkId = "demo_user_closer_ai";

  const user = await db.user.upsert({
    where: { clerkId: demoClerkId },
    update: {},
    create: {
      clerkId: demoClerkId,
      email: "demo@closera.ai",
      name: "Demo Owner",
    },
  });

  const business = await db.business.upsert({
    where: { id: "demo-business" },
    update: {},
    create: {
      id: "demo-business",
      userId: user.id,
      name: "Mike's HVAC",
      industry: "HVAC",
      phone: "+15551234567",
      email: "hello@mikeshvac.com",
      aiName: "Mike's HVAC AI Receptionist",
      aiTone: "professional",
      servicesJson: JSON.stringify([
        "AC Repair",
        "Furnace Installation",
        "Maintenance Plans",
      ]),
      hoursJson: JSON.stringify({
        monday: { open: "08:00", close: "18:00" },
        tuesday: { open: "08:00", close: "18:00" },
        wednesday: { open: "08:00", close: "18:00" },
        thursday: { open: "08:00", close: "18:00" },
        friday: { open: "08:00", close: "18:00" },
      }),
      onboardingDone: true,
      subscription: {
        create: {
          plan: "PROFESSIONAL",
          status: "TRIALING",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const customers = await Promise.all(
    [
      { name: "Sarah Johnson", phone: "+15559876543", email: "sarah@email.com" },
      { name: "Tom Williams", phone: "+15555550123", email: null },
      { name: "Lisa Chen", phone: "+15555550999", email: "lisa@email.com" },
    ].map((c) =>
      db.customer.create({
        data: { businessId: business.id, ...c, lastContactAt: new Date() },
      })
    )
  );

  await db.call.createMany({
    data: [
      {
        businessId: business.id,
        customerId: customers[0].id,
        fromNumber: "+15559876543",
        toNumber: "+15551234567",
        status: "ANSWERED",
        durationSeconds: 180,
      },
      {
        businessId: business.id,
        customerId: customers[1].id,
        fromNumber: "+15555550123",
        toNumber: "+15551234567",
        status: "RECOVERED",
        recovered: true,
      },
      {
        businessId: business.id,
        customerId: customers[2].id,
        fromNumber: "+15555550999",
        toNumber: "+15551234567",
        status: "MISSED",
      },
    ],
  });

  await db.appointment.createMany({
    data: [
      {
        businessId: business.id,
        customerId: customers[0].id,
        title: "AC Maintenance",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: "SCHEDULED",
      },
      {
        businessId: business.id,
        customerId: customers[2].id,
        title: "Furnace Inspection",
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "SCHEDULED",
      },
    ],
  });

  const conversation = await db.conversation.create({
    data: {
      businessId: business.id,
      customerId: customers[1].id,
      channel: "SMS",
      status: "OPEN",
      subject: "Missed call recovery",
      lastMessage: "Sorry we missed your call. How can we help you today?",
      messages: {
        create: [
          {
            role: "assistant",
            content: "Sorry we missed your call. How can we help you today?",
          },
          {
            role: "user",
            content: "Need AC repair tomorrow if possible",
          },
        ],
      },
    },
  });

  void conversation;

  for (let i = 0; i < 30; i++) {
    await db.dailyMetric.upsert({
      where: {
        businessId_date: {
          businessId: business.id,
          date: startOfDay(subDays(new Date(), i)),
        },
      },
      create: {
        businessId: business.id,
        date: startOfDay(subDays(new Date(), i)),
        revenueRecovered: Math.floor(Math.random() * 500) + 100,
        callsAnswered: Math.floor(Math.random() * 5) + 1,
        missedCallsRecovered: Math.floor(Math.random() * 3),
        appointmentsBooked: Math.floor(Math.random() * 2),
        leadsConverted: Math.floor(Math.random() * 2),
        reviewsGenerated: Math.floor(Math.random() * 2),
      },
      update: {},
    });
  }

  console.log("Seed complete:", { user: user.email, business: business.name });
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
