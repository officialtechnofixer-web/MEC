const University = require('../models/University');
const Application = require('../models/Application');

// @desc    Search universities and courses
// @route   GET /api/universities/search
const searchUniversities = async (req, res) => {
  try {
    const { q, country, degreeLevel, page = 1, limit = 20 } = req.query;

    let query = {};

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'courses.name': { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }

    // Country filter
    if (country) {
      query.country = country;
    }

    // Degree level filter
    if (degreeLevel) {
      query['courses.degreeLevel'] = degreeLevel;
    }

    const total = await University.countDocuments(query);
    const universities = await University.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    // Flatten to course-level results
    const results = [];
    universities.forEach((uni) => {
      const filteredCourses = degreeLevel
        ? uni.courses.filter((c) => c.degreeLevel === degreeLevel)
        : uni.courses;

      filteredCourses.forEach((course) => {
        results.push({
          universityId: uni._id,
          universityName: uni.name,
          location: uni.location,
          logo: uni.logo,
          courseId: course._id,
          courseName: course.name,
          fee: course.fee,
          duration: course.duration,
          intake: course.intake,
          degreeLevel: course.degreeLevel,
          // Mock match score
          matchScore: Math.floor(75 + Math.random() * 25),
        });
      });
    });

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get university details
// @route   GET /api/universities/:id
const getUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    res.json(university);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI match recommendations for a student
// @route   GET /api/universities/recommendations
const getRecommendations = async (req, res) => {
  try {
    // Get student's applications to know their interests
    const applications = await Application.find({ student: req.user._id })
      .populate('university', 'name logo');

    // Get all universities
    const universities = await University.find({}).limit(14);

    // Generate recommendations (mock AI scoring)
    const recommendations = universities.map((uni) => {
      const courses = uni.courses.map((course) => ({
        universityId: uni._id,
        universityName: uni.name,
        logo: uni.logo,
        courseName: course.name,
        fee: course.fee,
        matchScore: Math.floor(78 + Math.random() * 22),
      }));
      return courses;
    }).flat();

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommendations.slice(0, 14));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new university
// @route   POST /api/universities
// @access  Private/Admin
const createUniversity = async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json({
      success: true,
      data: university,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'University with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all universities (admin list)
// @route   GET /api/universities
// @access  Private/Admin
const getUniversities = async (req, res) => {
  try {
    const universities = await University.find({}).sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Private/Admin
const updateUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    res.json({
      success: true,
      data: university,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete university
// @route   DELETE /api/universities/:id
// @access  Private/Admin
const deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    res.json({
      success: true,
      message: 'University deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  searchUniversities, 
  getUniversity, 
  getRecommendations, 
  createUniversity, 
  getUniversities,
  updateUniversity,
  deleteUniversity
};
