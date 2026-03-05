import mongoose from 'mongoose';
import SubscriptionPlan from './models/subscriptionPlan';
import dotenv from 'dotenv';
import { MONGO_URI } from './utils/secrets';
dotenv.config();

const plans = [
  // {
  //   name: 'Free',
  //   price: 0,
  //   campaignLimit: 2,
  //   description: '2 campaigns each month',
  // },
  {
    name: 'Launch',
    price: 29000,
    campaignLimit: 5,
    description: '5 campaigns each month',
  },
  {
    name: 'Pro',
    price: 79000,
    campaignLimit: 15,
    description: '15 campaigns each month',
  },
  {
    name: 'Premium',
    price: 199,
    campaignLimit: null,
    description: 'Unlimited campaigns',
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI || '');
  for (const plan of plans) {
    await SubscriptionPlan.updateOne(
      { name: plan.name },
      { $set: plan },
      { upsert: true }
    );
  }
  console.log('Subscription plans seeded');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
