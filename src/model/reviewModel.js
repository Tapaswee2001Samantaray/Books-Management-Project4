const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId


const reviewSchema = new mongoose.Schema(
    {
        bookId: {
            type: ObjectId,
            require: true,
            ref: "bookData",
            trim: true
        },
        reviewedBy: {
            type: String,
            require: true,
            default: 'Guest',
            trim: true,
            value: {
                type: String,
                trim: true
            }
        },
        reviewedAt: {
            type: Date,
            require: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            require: true
        },
        review: {
            type: String,
            trim: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true })


module.exports = mongoose.model('reviewData', reviewSchema)