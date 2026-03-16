const Section = require('../models/Section');

// @desc    Get all sections
// @route   GET /api/sections
exports.getSections = async (req, res) => {
  try {
    const { semester, department } = req.query;
    const query = { createdBy: req.user.id };
    
    if (semester) query.semester = semester;
    if (department) query.department = department;

    const sections = await Section.find(query).sort({ semester: 1, name: 1 });
    
    res.json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create section
// @route   POST /api/sections
exports.createSection = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    req.body.department = req.user.department;
    
    const section = await Section.create(req.body);
    
    res.status(201).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
exports.updateSection = async (req, res) => {
  try {
    let section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    if (section.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this section'
      });
    }

    section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    if (section.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this section'
      });
    }

    await section.deleteOne();

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add course to section
// @route   POST /api/sections/:id/courses
exports.addCourse = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    section.courses.push(req.body);
    await section.save();

    res.status(201).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};