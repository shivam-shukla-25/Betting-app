const { Schema, model, Types } = require('mongoose');

const betSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: ['placed', 'settled', 'cancelled'],
      default: 'placed',
    },
  },
  { timestamps: true }
);

module.exports = model('Bet', betSchema);
