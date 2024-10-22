import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Participant',
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Expense = mongoose.model('Expense', expenseSchema);
export { Expense };
