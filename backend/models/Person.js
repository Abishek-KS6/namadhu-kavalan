const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  age:              { type: Number },
  gender:           { type: String, enum: ['male', 'female', 'other'] },
  height:           { type: String },
  weight:           { type: String },
  bloodGroup:       { type: String },
  identifyingMarks: { type: String },
  languages:        [{ type: String }],
  address:          { type: String },
  district:         { type: String },
  state:            { type: String, default: 'Tamil Nadu' },
  type:             { type: String, enum: ['missing', 'unidentified'], required: true },
  status:           { type: String, enum: ['active', 'found', 'closed'], default: 'active' },
  photos:           [{ url: String, publicId: String, uploadedAt: Date }],
  primaryPhoto:     { type: String, default: null },
  faceEmbedding:    [{ type: Number }],
  faceProcessed:    { type: Boolean, default: false },
  caseId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  lastSeenDate:     { type: Date },
  lastSeenPlace:    { type: String },
  reportedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foundDate:        { type: Date },
  foundPlace:       { type: String },
  bodyCondition:    { type: String },
  matchedWith:      { type: mongoose.Schema.Types.ObjectId, ref: 'Person', default: null },
  matchScore:       { type: Number, default: null },
}, { timestamps: true });

PersonSchema.index({ type: 1, status: 1 });
PersonSchema.index({ district: 1 });
PersonSchema.index({ name: 'text' });

module.exports = mongoose.model('Person', PersonSchema);
