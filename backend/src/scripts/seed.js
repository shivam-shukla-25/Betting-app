require('dotenv').config();

const mongoose = require('mongoose');

const connectDb = require('../config/db');
const User = require('../models/user.model');
const Bet = require('../models/bet.model');

async function run() {
  await connectDb();

  await Bet.deleteMany({});
  await User.deleteMany({});

  const user = await User.create({ username: 'demo', balance: 100 });

  console.log('Seed complete.');
  console.log(`  userId : ${user._id}`);
  console.log(`  balance: $${user.balance.toFixed(2)}`);
  console.log('');
  console.log('Try it:');
  console.log(
    `  curl -X POST http://localhost:4000/place-bet -H "content-type: application/json" -d '{"userId":"${user._id}","amount":100}'`
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
