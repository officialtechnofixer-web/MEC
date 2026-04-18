const Scholarship = require('../models/Scholarship');

exports.getScholarships = async (req, res) => {
  try {
    const { university } = req.query;
    let query = {};
    if (university) {
      query = { $or: [{ university: university }, { university: 'General' }] };
    }
    const scholarships = await Scholarship.find(query).sort({ deadline: 1 });
    res.status(200).json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
