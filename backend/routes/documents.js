const express = require('express');
const router = express.Router();
const {
  uploadDocument, getDocuments, downloadDocument,
  verifyDocument, getDocumentHistory, deleteDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id/download', protect, downloadDocument);
router.delete('/:id', protect, deleteDocument);
router.put('/:id/verify', protect, authorize('admin'), verifyDocument);
router.get('/:id/history', protect, getDocumentHistory);

module.exports = router;
