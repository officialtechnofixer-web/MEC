const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    course: { type: String, required: [true, 'Course name is required'] },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'action_required'],
      default: 'draft',
    },
    currentStep: { type: Number, default: 1, min: 1, max: 4 },
    // 1 = Draft, 2 = Submitted, 3 = Under Review, 4 = Decision

    // Academic background
    academics: {
      institution: { type: String, default: '' },
      degree: { type: String, default: '' },
      cgpa: { type: String, default: '' },
      passingYear: { type: String, default: '' },
      transcriptDoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    },

    // Test scores
    testScores: {
      gre: { type: Number, default: null },
      ielts: { type: Number, default: null },
      toefl: { type: Number, default: null },
      gate: { type: Number, default: null },
      gmat: { type: Number, default: null },
      jee: { type: Number, default: null },
      cat: { type: Number, default: null },
    },

    // Missing documents list
    missingDocuments: [{ type: String }],

    // Counsellor assignment
    counsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'Counsellor', default: null },

    // AI match score
    aiMatchScore: { type: Number, default: 0 },

    // Pipeline column (for admin CRM view)
    pipelineStage: {
      type: String,
      enum: ['leads', 'verified', 'review', 'shortlist', 'decision'],
      default: 'leads',
    },

    // Lead source
    source: {
      type: String,
      enum: ['Web', 'Referral', 'Walk-in', 'Campaign'],
      default: 'Web',
    },

    // Submission date
    submittedAt: { type: Date, default: null },
    decisionDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for efficient queries
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ pipelineStage: 1 });

module.exports = mongoose.model('Application', applicationSchema);
