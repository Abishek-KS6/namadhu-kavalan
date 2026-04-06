const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { textSearch, faceSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

router.get('/text',        protect, textSearch);
router.post('/face',       protect, upload.single('photo'), faceSearch);

module.exports = router;
