const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');

// @desc    Upload document
// @route   POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, category } = req.body;

    const fileSizeBytes = req.file.size;
    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(1) + ' MB';

    // Check if a document with same name exists — create new version
    const existing = await Document.findOne({ student: req.user._id, name });

    if (existing) {
      existing.versions.push({
        filePath: existing.filePath,
        uploadedAt: existing.updatedAt,
        uploadedBy: req.user._id,
      });
      existing.filePath = req.file.path;
      existing.fileSize = fileSizeMB;
      existing.originalName = req.file.originalname;
      existing.status = 'pending';
      await existing.save();
      return res.json(existing);
    }

    const document = await Document.create({
      student: req.user._id,
      name: name || req.file.originalname,
      category: category || 'academic',
      filePath: req.file.path,
      fileSize: fileSizeMB,
      originalName: req.file.originalname,
      status: 'pending',
      versions: [],
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List user's documents
// @route   GET /api/documents
const getDocuments = async (req, res) => {
  try {
    const query = { student: req.user._id };
    if (req.query.category) {
      query.category = req.query.category;
    }

    const documents = await Document.find(query)
      .populate('verifiedBy', 'firstName lastName')
      .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(document.filePath, document.originalName || path.basename(document.filePath));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify document (admin only)
// @route   PUT /api/documents/:id/verify
const verifyDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.status = 'verified';
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    await document.save();

    const populated = await document.populate('verifiedBy', 'firstName lastName');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get version history
// @route   GET /api/documents/:id/history
const getDocumentHistory = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('verifiedBy', 'firstName lastName')
      .populate('versions.uploadedBy', 'firstName lastName');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      document: {
        _id: document._id,
        name: document.name,
        status: document.status,
        verifiedBy: document.verifiedBy,
        verifiedAt: document.verifiedAt,
      },
      versions: document.versions,
      sharedWith: document.sharedWith,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Ensure the user owns the document or is an admin
    if (document.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Delete current file
    if (document.filePath && fs.existsSync(document.filePath)) {
      try { fs.unlinkSync(document.filePath); } catch (e) { console.error('Error deleting file:', e); }
    }

    // Delete version files
    if (document.versions && document.versions.length > 0) {
      document.versions.forEach(version => {
        if (version.filePath && fs.existsSync(version.filePath)) {
          try { fs.unlinkSync(version.filePath); } catch (e) { console.error('Error deleting version file:', e); }
        }
      });
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument, getDocuments, downloadDocument,
  verifyDocument, getDocumentHistory, deleteDocument
};
