import express from 'express';
import {
    addExpenseToGroup,
    getUserExpenses,
    getGroupExpenses,
    generateBalanceSheet,
    createGroup
} from '../controllers/expense.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/add', addExpenseToGroup);
// router.get('/expenseuser', getUserExpenses);
router.route("/expenseuser").get(verifyJWT, getUserExpenses)
router.get('/group/:groupId', getGroupExpenses);
router.get('/group/:groupId/balance-sheet', generateBalanceSheet);
router.post('/creategroup', createGroup);
export default router;
