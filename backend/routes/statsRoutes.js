const express = require('express');
const router  = express.Router();
const Person  = require('../models/Person');
const Case    = require('../models/Case');
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/summary', protect, async (req, res) => {
  try {
    const [
      totalMissing, totalUnidentified, totalCases,
      activeCases, resolvedCases, totalOfficers,
      missingFound, recentCases,
    ] = await Promise.all([
      Person.countDocuments({ type: 'missing', status: 'active' }),
      Person.countDocuments({ type: 'unidentified', status: 'active' }),
      Case.countDocuments(),
      Case.countDocuments({ status: { $in: ['open', 'under_investigation'] } }),
      Case.countDocuments({ status: 'resolved' }),
      User.countDocuments({ role: 'officer', isApproved: true }),
      Person.countDocuments({ type: 'missing', status: 'found' }),
      Case.find().sort({ createdAt: -1 }).limit(5).populate('assignedTo', 'name'),
    ]);
    res.json({
      totalMissing, totalUnidentified, totalCases,
      activeCases, resolvedCases, totalOfficers, missingFound,
      recentCases,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/district', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await Case.aggregate([
      { $group: { _id: '$district', total: { $sum: 1 }, active: { $sum: { $cond: [{ $in: ['$status', ['open', 'under_investigation']] }, 1, 0] } } } },
      { $sort: { total: -1 } }
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
