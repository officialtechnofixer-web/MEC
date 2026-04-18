const Application = require('../models/Application');
const University = require('../models/University');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// @desc    Create new application
// @route   POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { university, course, academics, testScores, source } = req.body;

    // Calculate a mock AI match score
    const aiMatchScore = Math.floor(70 + Math.random() * 30);

    const application = await Application.create({
      student: req.user._id,
      university,
      course,
      academics: academics || {},
      testScores: testScores || {},
      source: source || 'Web',
      aiMatchScore,
      pipelineStage: 'leads',
    });

    const populated = await application.populate('university', 'name logo location partnerUser');

    // Notify the University Partner native account and CC the super admin
    if (populated.university && populated.university.partnerUser) {
       const partner = await User.findById(populated.university.partnerUser);
       if (partner && partner.email) {
          const studentName = `${req.user.firstName} ${req.user.lastName}`;
          
          // Find an admin to notify as well
          const admin = await User.findOne({ role: 'admin' });
          const toEmails = admin && admin.email ? [partner.email, admin.email].join(', ') : partner.email;

          await sendEmail({
            to: toEmails,
            subject: `New Application Received: ${studentName}`,
            html: `
              <h3>New Lead Alert!</h3>
              <p>A new student (<strong>${studentName}</strong>) has just submitted an application for <strong>${course}</strong> at <strong>${populated.university.name}</strong>.</p>
              <br/>
              <p>Please log in to your UAFMS Partner Dashboard to review their documents and make a decision.</p>
            `
          });
       }
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List user's applications
// @route   GET /api/applications
const getApplications = async (req, res) => {
  try {
    const query = { student: req.user._id };

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('university', 'name logo location courses')
      .populate('counsellor', 'name avatar isOnline')
      .sort({ updatedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('university', 'name logo location courses')
      .populate('counsellor', 'name avatar isOnline role');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Students can only see their own
    if (req.user.role === 'student' && application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const allowedFields = [
      'course', 'status', 'currentStep', 'academics', 'testScores',
      'missingDocuments', 'pipelineStage', 'counsellor',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    // If status changes to submitted, record date
    if (req.body.status === 'submitted' && !application.submittedAt) {
      application.submittedAt = new Date();
      application.currentStep = 2;
      application.pipelineStage = 'verified';
    }

    // If accepted/rejected, record decision date
    if (['accepted', 'rejected'].includes(req.body.status)) {
      application.decisionDate = new Date();
      application.currentStep = 4;
      application.pipelineStage = 'decision';
    }

    await application.save();
    const populated = await application.populate('university', 'name logo location');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete application (draft only)
// @route   DELETE /api/applications/:id
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft applications can be deleted' });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit bulk applications
// @route   POST /api/applications/bulk
const submitBulkApplications = async (req, res) => {
  try {
    const { applications } = req.body;
    // applications: [{ universityId, course, academics, testScores }]

    if (!applications || !Array.isArray(applications) || applications.length === 0) {
      return res.status(400).json({ message: 'No applications provided' });
    }

    const createdApplications = [];
    const admin = await User.findOne({ role: 'admin' });

    for (const appData of applications) {
      const { universityId, course, academics, testScores } = appData;

      // Calculate a mock AI match score
      const aiMatchScore = Math.floor(70 + Math.random() * 30);

      const application = await Application.create({
        student: req.user._id,
        university: universityId,
        course,
        academics: academics || {},
        testScores: testScores || {},
        status: 'submitted',
        submittedAt: new Date(),
        aiMatchScore,
        pipelineStage: 'leads',
      });

      const populated = await application.populate('university', 'name logo location partnerUser');
      createdApplications.push(populated);

      // Notify partner and admin
      if (populated.university && populated.university.partnerUser) {
        const partner = await User.findById(populated.university.partnerUser);
        if (partner && partner.email) {
          const studentName = `${req.user.firstName} ${req.user.lastName}`;
          const toEmails = admin && admin.email ? [partner.email, admin.email].join(', ') : partner.email;

          await sendEmail({
            to: toEmails,
            subject: `New Application Received: ${studentName}`,
            html: `
              <h3>New Lead Alert!</h3>
              <p>A new student (<strong>${studentName}</strong>) has just submitted an application for <strong>${course}</strong> at <strong>${populated.university.name}</strong>.</p>
              <br/>
              <p>Please log in to your UAFMS Partner Dashboard to review their documents and make a decision.</p>
            `
          });
        }
      }
    }

    res.status(201).json(createdApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createApplication, getApplications, getApplication,
  updateApplication, deleteApplication, submitBulkApplications,
};
