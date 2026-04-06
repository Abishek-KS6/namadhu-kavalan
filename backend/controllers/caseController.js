const Case    = require('../models/Case');
const Person  = require('../models/Person');
const { generateCaseNumber } = require('../services/caseNumberGenerator');

const createCase = async (req, res) => {
  try {
    const { title, type, priority, description, district } = req.body;
    const caseNumber = await generateCaseNumber(type);
    const newCase = await Case.create({
      caseNumber, title, type, priority, description,
      district: district || req.user.district || 'Unknown',
      reportedBy: req.user._id,
      activities: [{ action: 'Case created', by: req.user._id }],
    });
    res.status(201).json(newCase);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getCases = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.type)     filter.type     = req.query.type;
    if (req.query.district) filter.district = req.query.district;
    if (req.user.role === 'officer') filter.district = req.user.district;
    const cases = await Case.find(filter)
      .populate('assignedTo', 'name badgeNumber')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getCase = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id)
      .populate('assignedTo', 'name badgeNumber email')
      .populate('reportedBy', 'name email')
      .populate('persons');
    if (!c) return res.status(404).json({ message: 'Case not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateCase = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Case not found' });
    const { status, priority, assignedTo, note } = req.body;
    if (status)     c.status     = status;
    if (priority)   c.priority   = priority;
    if (assignedTo) c.assignedTo = assignedTo;
    if (status === 'resolved') c.resolvedAt = new Date();
    c.activities.push({ action: `Case updated: ${Object.keys(req.body).join(', ')}`, note, by: req.user._id });
    await c.save();
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addActivity = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Case not found' });
    c.activities.push({ action: req.body.action, note: req.body.note, by: req.user._id });
    await c.save();
    const io = req.app.get('io');
    io.to(`case_${req.params.id}`).emit('case_update', { caseId: req.params.id, activity: c.activities[c.activities.length - 1] });
    res.json({ message: 'Activity added', activities: c.activities });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createCase, getCases, getCase, updateCase, addActivity };
