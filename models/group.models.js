import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        },
    ],
    expenses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Expense',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Group = mongoose.model('Group', groupSchema);
export { Group };
