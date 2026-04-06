const express = require('express');
const router  = express.Router();
const { createCase, getCases, getCase, updateCase, addActivity } = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',              protect, getCases);
router.get('/:id',           protect, getCase);
router.post('/',             protect, authorize('admin', 'officer'), createCase);
router.put('/:id',           protect, authorize('admin', 'officer'), updateCase);
router.post('/:id/activity', protect, authorize('admin', 'officer'), addActivity);

module.exports = router;
