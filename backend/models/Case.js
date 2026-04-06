const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  caseNumber:   { type: String, required: true, unique: true },
  title:        { type: String, required: true },
  type:         { type: String, enum: ['missing_person', 'unidentified_body'], required: true },
  status:       { type: String, enum: ['open', 'under_investigation', 'resolved', 'closed'], default: 'open' },
  priority:     { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  description:  { type: String },
  district:     { type: String, required: true },
  persons:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reportedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activities:   [{
    action: String,
    note:   String,
    by:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at:     { type: Date, default: Date.now },
  }],
  resolvedAt:   { type: Date, default: null },
  resolvedNote: { type: String, default: null },
}, { timestamps: true });

CaseSchema.index({ caseNumber: 1 });
CaseSchema.index({ status: 1, district: 1 });

module.exports = mongoose.model('Case', CaseSchema);
