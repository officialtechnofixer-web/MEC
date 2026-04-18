const mongoose = require('mongoose');

const consentLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: [true, 'Consent action description is required'] },
    ipAddress: { type: String, default: '0.0.0.0' },
    status: {
      type: String,
      enum: ['granted', 'revoked'],
      default: 'granted',
    },
    policyVersion: { type: String, default: 'v2.1' },
  },
  { timestamps: true }
);

consentLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ConsentLog', consentLogSchema);
