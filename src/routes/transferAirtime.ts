import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth';
import { transferAirtime } from '../controller/transferAirtime';

router.post('/transfer', auth, transferAirtime);

export default router;
