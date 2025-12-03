import express from 'express';
import { listarFormasPagamento } from '../controllers/paymentMethodController.js';

const router = express.Router();

router.get('/', listarFormasPagamento);

export default router;
