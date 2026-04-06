const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { createPerson, getPersons, getPerson, uploadPhoto, updatePerson } = require('../controllers/personController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

router.get('/',                    protect, getPersons);
router.get('/:id',                 protect, getPerson);
router.post('/',                   protect, createPerson);
router.put('/:id',                 protect, authorize('admin', 'officer'), updatePerson);
router.post('/:id/photo',          protect, upload.single('photo'), uploadPhoto);

module.exports = router;
