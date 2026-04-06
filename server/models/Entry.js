const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  dayLabel: { type: String, required: true },
  
  // Planned phase
  plannedDsa: { type: String, default: '' },
  plannedSubject: { type: String, default: '' },
  plannedTopic: { type: String, default: '' },
  
  // Execution phase
  dsaWork: { type: String, default: '' },
  subject: { type: String, default: 'None' }, // Removed ENUM restriction
  topic: { type: String, default: '' },
  dsaDone: { type: Boolean, default: false },
  subjectDone: { type: Boolean, default: false },
  timeSpent: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Ensure a user can only have one entry per date
entrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Entry', entrySchema);
