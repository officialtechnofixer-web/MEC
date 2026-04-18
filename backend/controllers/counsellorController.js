const Counsellor = require('../models/Counsellor');
const Application = require('../models/Application');

// @desc    Get all counsellors
// @route   GET /api/counsellors
const getCounsellors = async (req, res) => {
  try {
    const { search, region } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
      ];
    }

    if (region) {
      query.region = region;
    }

    const counsellors = await Counsellor.find(query).sort({ name: 1 });

    // Get unassigned leads count
    const unassignedLeads = await Application.countDocuments({ counsellor: null, pipelineStage: 'leads' });
    const highIntentLeads = Math.floor(unassignedLeads * 0.6);

    res.json({
      success: true,
      data: counsellors,
      stats: {
        unassignedLeads,
        highIntentLeads,
        standardLeads: unassignedLeads - highIntentLeads,
        targetKPI: '85% Utilization',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new counsellor
// @route   POST /api/counsellors
const addCounsellor = async (req, res) => {
  try {
    const counsellor = await Counsellor.create(req.body);
    res.status(201).json(counsellor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update counsellor
// @route   PUT /api/counsellors/:id
const updateCounsellor = async (req, res) => {
  try {
    const counsellor = await Counsellor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!counsellor) {
      return res.status(404).json({ message: 'Counsellor not found' });
    }

    res.json(counsellor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auto-assign unassigned leads to counsellors
// @route   POST /api/counsellors/auto-assign
const autoAssignLeads = async (req, res) => {
  try {
    // Get available counsellors (sorted by utilization, ascending = least busy first)
    const counsellors = await Counsellor.find({ acceptingLeads: true })
      .sort({ utilizationRate: 1 });

    if (counsellors.length === 0) {
      return res.status(400).json({ message: 'No counsellors available for assignment' });
    }

    // Get unassigned lead applications
    const unassigned = await Application.find({
      counsellor: null,
      pipelineStage: 'leads',
    });

    if (unassigned.length === 0) {
      return res.json({ message: 'No unassigned leads to process', assigned: 0 });
    }

    let assignedCount = 0;
    let counsellorIdx = 0;

    for (const app of unassigned) {
      const counsellor = counsellors[counsellorIdx % counsellors.length];

      // Check capacity
      if (counsellor.activeStudents < counsellor.capacity) {
        app.counsellor = counsellor._id;
        await app.save();

        counsellor.activeStudents += 1;
        counsellor.utilizationRate = Math.round((counsellor.activeStudents / counsellor.capacity) * 100);

        // If at capacity, stop accepting leads
        if (counsellor.activeStudents >= counsellor.capacity) {
          counsellor.acceptingLeads = false;
        }

        counsellor.recentAssignments.unshift({
          studentName: `Student ${app._id.toString().slice(-4)}`,
          type: 'auto',
          timestamp: new Date(),
          note: `Auto-assigned via Smart Assigner`,
        });

        await counsellor.save();
        assignedCount++;
      }

      counsellorIdx++;
    }

    res.json({
      message: `Successfully assigned ${assignedCount} leads`,
      assigned: assignedCount,
      total: unassigned.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete counsellor
// @route   DELETE /api/counsellors/:id
// @access  Private/Admin
const deleteCounsellor = async (req, res) => {
  try {
    const counsellor = await Counsellor.findByIdAndDelete(req.params.id);

    if (!counsellor) {
      return res.status(404).json({ message: 'Counsellor not found' });
    }

    res.json({
      success: true,
      message: 'Counsellor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getCounsellors, 
  addCounsellor, 
  updateCounsellor, 
  autoAssignLeads,
  deleteCounsellor
};
