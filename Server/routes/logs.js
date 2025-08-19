const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Log = require('../models/Log');

// GET /api/logs - Get all user's logs (reverse chronological)
router.get('/', auth, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET /api/logs/:id - Get a single log
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ msg: 'Log not found' });
    if (log.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });
    res.json(log);
  } catch (err) {
    console.error('Error fetching log:', err);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Log not found' });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// POST /api/logs - Create new log
router.post('/', auth, async (req, res) => {
  const { yesterday, today, blockers } = req.body;
  try {
    if (!yesterday || !today || !blockers) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    const newLog = new Log({
      userId: req.user.id,
      yesterday,
      today,
      blockers,
    });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (err) {
    console.error('Error creating log:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// PUT /api/logs/:id - Update log
router.put('/:id', auth, async (req, res) => {
  const { yesterday, today, blockers } = req.body;
  try {
    if (!yesterday || !today || !blockers) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    let log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ msg: 'Log not found' });
    if (log.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });

    log.yesterday = yesterday;
    log.today = today;
    log.blockers = blockers;
    await log.save();
    res.json(log);
  } catch (err) {
    console.error('Error updating log:', err);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Log not found' });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// DELETE /api/logs/:id - Delete log
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ msg: 'Log not found' });
    if (log.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });

    await log.deleteOne();
    res.json({ msg: 'Log deleted' });
  } catch (err) {
    console.error('Error deleting log:', err);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Log not found' });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;