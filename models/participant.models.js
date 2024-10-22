import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
        required: true
        ,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amountOwed: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    }
});

const Participant = mongoose.model('Participant', participantSchema);
export { Participant };
