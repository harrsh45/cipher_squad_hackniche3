import mongoose from 'mongoose';

const lotterySchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: [true, 'Lottery name must be unique']
    },
    resultDate: {
        type: Date,
        required: true
    },
    prizePool: {
        type: Number,
        required: true,
        min: [0, 'Prize pool cannot be negative']
    },
    ticketPrice: {
        type: Number,
        required: true,
        min: [0, 'Ticket price cannot be negative']
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
});

const Lottery = mongoose.model('lottery', lotterySchema);

export default Lottery;
