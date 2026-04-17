const mongoose = require('mongoose');

const User = require('../models/user.model');
const Bet = require('../models/bet.model');
const HttpError = require('../lib/http-error');

async function placeBet(req, res, next) {
  const { userId, amount } = req.body || {};

  if (!mongoose.isValidObjectId(userId)) {
    return next(new HttpError(400, 'A valid userId is required'));
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return next(new HttpError(400, 'amount must be a positive number'));
  }

  const session = await mongoose.startSession();

  try {
    let bet;

    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      // Conditional atomic debit. If two requests race, only one matches the
      // `balance >= amount` predicate; the other returns modifiedCount === 0
      // and we abort the transaction so the bet is never inserted.
      const result = await User.updateOne(
        { _id: userId, balance: { $gte: numericAmount } },
        { $inc: { balance: -numericAmount } },
        { session }
      );

      if (result.modifiedCount !== 1) {
        throw new HttpError(400, 'Insufficient balance');
      }

      const [created] = await Bet.create(
        [{ userId, amount: numericAmount }],
        { session }
      );
      bet = created;
    });

    const user = await User.findById(userId).lean();
    return res.status(201).json({
      bet: {
        id: bet._id,
        userId: bet.userId,
        amount: bet.amount,
        status: bet.status,
        createdAt: bet.createdAt,
      },
      balance: user ? user.balance : null,
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return next(err);
    }
    return next(err);
  } finally {
    await session.endSession();
  }
}

module.exports = { placeBet };
