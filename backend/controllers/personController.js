const Person = require('../models/Person');
const Case   = require('../models/Case');
const { uploadToCloudinary } = require('../services/cloudinary');
const axios  = require('axios');

const createPerson = async (req, res) => {
  try {
    const person = await Person.create({ ...req.body, reportedBy: req.user._id });
    if (req.body.caseId) {
      await Case.findByIdAndUpdate(req.body.caseId, { $push: { persons: person._id } });
    }
    res.status(201).json(person);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPersons = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type)     filter.type     = req.query.type;
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.gender)   filter.gender   = req.query.gender;
    const persons = await Person.find(filter).sort({ createdAt: -1 });
    res.json(persons);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('matchedWith');
    if (!person) return res.status(404).json({ message: 'Person not found' });
    res.json(person);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ message: 'Person not found' });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'namadhu-kavalan/persons');
    const photo  = { url: result.secure_url, publicId: result.public_id, uploadedAt: new Date() };

    person.photos.push(photo);
    if (!person.primaryPhoto) person.primaryPhoto = result.secure_url;
    await person.save();

    // Send to AI service for face processing
    try {
      const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/process-face`, {
        personId: person._id.toString(),
        imageUrl: result.secure_url,
        personType: person.type,
      }, { timeout: 30000 });

      if (aiRes.data.embedding) {
        person.faceEmbedding = aiRes.data.embedding;
        person.faceProcessed = true;
        await person.save();
      }
    } catch (aiErr) {
      console.log('[AI] Face processing skipped:', aiErr.message);
    }

    res.json({ message: 'Photo uploaded', photo, person });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updatePerson = async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!person) return res.status(404).json({ message: 'Person not found' });
    res.json(person);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createPerson, getPersons, getPerson, uploadPhoto, updatePerson };
