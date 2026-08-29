import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { getProfile, updateProfile, addWeightLog, getPreferences, updatePreferences, deleteAccount } = require('../controllers/user.controller');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/weight', addWeightLog);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.delete('/account', deleteAccount);

export default router;
