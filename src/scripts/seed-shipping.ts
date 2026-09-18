import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { db } from "@/db"
import { shippingZones } from "@/db/schema"

async function seedShippingZones() {
  console.log("Seeding shipping zones...")
  
  await db.insert(shippingZones).values([
    {
      zoneName: "Inside Dhaka",
      baseRate: "70.00",
      perKgRate: "0.00",
      isActive: true,
    },
    {
      zoneName: "Dhaka Suburbs",
      baseRate: "100.00",
      perKgRate: "0.00",
      isActive: true,
    },
    {
      zoneName: "Outside Dhaka",
      baseRate: "130.00",
      perKgRate: "0.00",
      isActive: true,
    }
  ]).onConflictDoNothing()
  
  console.log("Shipping zones seeded successfully.")
  process.exit(0)
}

seedShippingZones().catch((e) => {
  console.error(e)
  process.exit(1)
})
