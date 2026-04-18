const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    label: { type: String, default: '' },
    description: { type: String, default: '' },
    group: { type: String, default: 'general' },
    type: { type: String, enum: ['text', 'toggle', 'number'], default: 'text' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
