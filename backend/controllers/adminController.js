const Application = require('../models/Application');
const Escalation = require('../models/Escalation');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const University = require('../models/University');
const Counsellor = require('../models/Counsellor');
const VerificationCode = require('../models/VerificationCode');
const crypto = require('crypto');

// @desc    Get control tower pipeline data (Kanban)
// @route   GET /api/admin/pipeline
const getPipeline = async (req, res) => {
  try {
    const stageInfo = [
      { id: 'leads', name: 'New Leads', bg: 'bg-info/5' },
      { id: 'verified', name: 'Verified', bg: 'bg-warning/5' },
      { id: 'shortlist', name: 'Shortlisted', bg: 'bg-primary/5' },
      { id: 'review', name: 'University Review', bg: 'bg-success/5' },
      { id: 'decision', name: 'Final Decision', bg: 'bg-danger/5' },
    ];

    const allCards = await Application.find({})
      .populate('student', 'firstName lastName')
      .populate('university', 'name logo')
      .populate({
        path: 'counsellor',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ updatedAt: -1 });

    const columns = await Promise.all(stageInfo.map(async (stage) => ({
      ...stage,
      count: await Application.countDocuments({ pipelineStage: stage.id })
    })));

    // KPIs
    const totalActive = await Application.countDocuments({
      status: { $nin: ['accepted', 'rejected'] },
    });
    const totalOffers = await Application.countDocuments({ status: 'accepted' });
    const totalApps = await Application.countDocuments({});
    const offerRate = totalApps > 0 ? Math.round((totalOffers / totalApps) * 100) : 0;

    const paidInvoices = await Invoice.find({ status: 'paid' });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amountNumeric || 0), 0);

    res.json({
      success: true,
      data: {
        columns,
        cards: allCards,
        funnelMetrics: {
          activeApps: totalActive,
          offerRate,
          revenue: totalRevenue,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Move application between pipeline stages
// @route   PUT /api/admin/pipeline/:id/move
const movePipelineCard = async (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ['leads', 'verified', 'review', 'shortlist', 'decision'];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: 'Invalid pipeline stage' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { pipelineStage: stage },
      { new: true }
    ).populate('student', 'firstName lastName')
     .populate('university', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics / BI dashboard data
// @route   GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    // Funnel data
    const funnelData = [
      { name: 'Leads', students: await Application.countDocuments({ pipelineStage: 'leads' }) },
      { name: 'Verified', students: await Application.countDocuments({ pipelineStage: 'verified' }) },
      { name: 'Applied', students: await Application.countDocuments({ pipelineStage: 'review' }) },
      { name: 'Offers', students: await Application.countDocuments({ status: 'accepted' }) },
      { name: 'Enrolled', students: Math.floor(await Application.countDocuments({ status: 'accepted' }) * 0.7) },
    ];

    // Revenue by region
    const revenueData = [
      { name: 'North India', value: 45 },
      { name: 'South India', value: 30 },
      { name: 'West India', value: 15 },
      { name: 'East India', value: 10 },
    ];

    // Revenue trend (monthly data)
    const trendData = [
      { name: 'Jan', revenue: 4000000 },
      { name: 'Feb', revenue: 3000000 },
      { name: 'Mar', revenue: 5000000 },
      { name: 'Apr', revenue: 4500000 },
      { name: 'May', revenue: 6000000 },
      { name: 'Jun', revenue: 8000000 },
    ];

    // KPIs
    const totalRevenue = trendData.reduce((sum, t) => sum + t.revenue, 0);
    const totalApps = await Application.countDocuments({});
    const totalOffers = await Application.countDocuments({ status: 'accepted' });
    const conversionRate = totalApps > 0 ? ((totalOffers / totalApps) * 100).toFixed(1) : 0;
    const totalActive = await Application.countDocuments({
      status: { $nin: ['accepted', 'rejected'] },
    });
    const activePartners = await University.countDocuments({});

    res.json({
      success: true,
      data: {
        funnelMetrics: {
          activeApps: totalActive,
          offerRate: conversionRate,
          revenue: totalRevenue,
        },
        funnelData,
        revenueData,
        trendData,
        activePartners,
        kpis: {
          totalRevenue: totalRevenue >= 10000000 
            ? `₹${(totalRevenue / 10000000).toFixed(2)} Cr` 
            : `₹${(totalRevenue / 100000).toFixed(2)} Lakh`,
          conversionRate: `${conversionRate}%`,
          avgProcessTime: '18 Days',
          activePartners,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get escalations
// @route   GET /api/admin/escalations
const getEscalations = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    const query = {};
    const total = await Escalation.countDocuments(query);

    const escalations = await Escalation.find(query)
      .populate('student', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ severity: -1, createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      count: escalations.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: escalations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update escalation
// @route   PUT /api/admin/escalations/:id
const updateEscalation = async (req, res) => {
  try {
    const escalation = await Escalation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!escalation) {
      return res.status(404).json({ message: 'Escalation not found' });
    }

    res.json(escalation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invite codes
// @route   GET /api/admin/invite-codes
const getInviteCodes = async (req, res) => {
  try {
    const codes = await VerificationCode.find()
      .populate('createdBy', 'firstName lastName')
      .populate('usedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: codes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a new admin or partner invite code
// @route   POST /api/admin/invite-codes
const generateInviteCode = async (req, res) => {
  try {
    const { type = 'admin_registration' } = req.body;
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    const newCode = await VerificationCode.create({
      code,
      type,
      createdBy: req.user._id,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours for new codes
    });

    res.status(201).json({ success: true, data: newCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users by role
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all counseling requests
// @route   GET /api/admin/counseling-requests
const getCounselingRequests = async (req, res) => {
  try {
    const Escalation = require('../models/Escalation');
    const requests = await Escalation.find({ type: 'Counseling' })
      .populate('student', 'firstName lastName phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update/Resolve counseling request
// @route   PUT /api/admin/counseling-requests/:id
const updateCounselingRequest = async (req, res) => {
  try {
    const Escalation = require('../models/Escalation');
    const request = await Escalation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Counseling request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    console.log(`[ADMIN] Delete request received for ID: ${req.params.id}`);
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      console.log(`[ADMIN] User not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`[ADMIN] User ${user.email} deleted successfully`);

    // Cascade: delete all related data from MongoDB
    const Application = require('../models/Application');
    const Document = require('../models/Document');

    const [invoiceResult, appResult, docResult] = await Promise.all([
      Invoice.deleteMany({ student: req.params.id }),
      Application.deleteMany({ student: req.params.id }),
      Document.deleteMany({ student: req.params.id }),
    ]);

    console.log(`[ADMIN] Cascade delete — Invoices: ${invoiceResult.deletedCount}, Apps: ${appResult.deletedCount}, Docs: ${docResult.deletedCount}`);
    
    // Always try to delete counsellor profile if exists
    await Counsellor.findOneAndDelete({ user: req.params.id });

    res.json({ 
      success: true, 
      message: 'User and all associated data deleted successfully',
      cascade: {
        invoices: invoiceResult.deletedCount,
        applications: appResult.deletedCount,
        documents: docResult.deletedCount,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPipeline, movePipelineCard, getAnalytics,
  getEscalations, updateEscalation,
  getInviteCodes, generateInviteCode,
  getUsers, updateUser, deleteUser,
  getCounselingRequests, updateCounselingRequest
};
