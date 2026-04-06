const Person = require('../models/Person');
const axios  = require('axios');
const { uploadToCloudinary } = require('../services/cloudinary');

// Text-based search
const textSearch = async (req, res) => {
  try {
    const { q, type, district, gender, minAge, maxAge } = req.query;
    const filter = { status: 'active' };
    if (type)     filter.type     = type;
    if (district) filter.district = district;
    if (gender)   filter.gender   = gender;
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { lastSeenPlace: { $regex: q, $options: 'i' } },
        { foundPlace: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
        { identifyingMarks: { $regex: q, $options: 'i' } },
      ];
    }
    const persons = await Person.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ results: persons, count: persons.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Face-based search
const faceSearch = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    // Upload search photo to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'namadhu-kavalan/searches');

    // Send to AI for face matching
    const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/search-face`, {
      imageUrl:   result.secure_url,
      searchType: req.body.searchType || 'all',
      threshold:  parseFloat(req.body.threshold) || 0.6,
      topK:       parseInt(req.body.topK) || 10,
    }, { timeout: 60000 });

    const matches = aiRes.data.matches || [];

    // Get full person details for matches
    const personIds = matches.map(m => m.personId);
    const persons   = await Person.find({ _id: { $in: personIds } });

    const enriched = matches.map(match => ({
      ...match,
      person: persons.find(p => p._id.toString() === match.personId),
    })).filter(m => m.person);

    res.json({
      searchPhoto: result.secure_url,
      matches: enriched,
      totalMatches: enriched.length,
    });

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI service unavailable. Please try again later.' });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = { textSearch, faceSearch };
