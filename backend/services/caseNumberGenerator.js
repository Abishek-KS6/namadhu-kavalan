const Case = require('../models/Case');

const generateCaseNumber = async (type) => {
  const prefix = type === 'missing_person' ? 'MP' : 'UB';
  const year   = new Date().getFullYear();
  const count  = await Case.countDocuments({ type }) + 1;
  return `NK-${prefix}-${year}-${String(count).padStart(4, '0')}`;
};

module.exports = { generateCaseNumber };
