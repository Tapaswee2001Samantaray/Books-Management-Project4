const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const reviewModel = require("../model/reviewModel");
const bookModel = require("../model/bookModel");
const { validateName } = require("../validator/validator");


// ================================= Create Reviews For Books ==============================================//
const reviewBook = async function (req, res) {
    try {
        let data = req.body;
        const bookId = req.params.bookId;

        let { review, rating, reviewedBy } = data

        if (!bookId) {
            return res.status(400).send({ status: false, message: "please provide book id." });
        }
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid book id." });
        }

        const checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false });

        if (!checkBook) {
            return res.status(404).send({ status: false, message: "Book id does not exist in database." });
        }

        if (!rating) {
            return res.status(400).send({ status: false, message: "please provide rating, it is mandatory." });
        }
        rating = parseFloat(rating);
        if (!rating || (!(rating <= 5 && rating >= 1))) {
            return res.status(400).send({ status: false, message: "rating is invalid. It must be 1 to 5." });
        }
        data["rating"] = rating;

        if (review == "") {
            return res.status(400).send({ status: false, message: "review can't be empty." });
        }
        if (review) {
            if (typeof review != "string") {
                return res.status(400).send({ status: false, message: "review must be in string" });
            }
            if (!review.trim()) {
                return res.status(400).send({ status: false, message: "review can't be empty." });
            }
            review = review.trim();
            data["review"] = review;
        }

        if (reviewedBy == "") {
            data["reviewedBy"] = "Guest";
        }
        if (reviewedBy) {
            if (typeof reviewedBy != "string") {
                return res.status(400).send({ status: false, message: "reviewedBy must be string." });
            }
            reviewedBy = reviewedBy.trim();
            if (!validateName(reviewedBy)) {
                return res.status(400).send({ status: false, message: "reviewer name is invalid." });
            }
        }

        data['bookId'] = bookId;
        data['reviewedAt'] = Date.now();

        const reviewData = await reviewModel.create(data);

        let result = {
            _id: reviewData._id,
            bookId: reviewData.bookId,
            reviewedBy: reviewData.reviewedBy,
            reviewedAt: reviewData.reviewedAt,
            rating: reviewData.rating,
            review: reviewData.review
        }

        await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: 1 } }
        );
        return res.status(201).send({ status: true, message: "Success", data: result });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


// ============================== Update Reviews Of Books =====================================================//
const updateBookReview = async function (req, res) {
    try {
        let data = req.params;
        let { bookId, reviewId } = data;

        let body = req.body;
        let { reviewedBy, review, rating } = body;

        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid Book ID." });
        }

        let checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!checkBookId) {
            return res.status(404).send({ status: false, message: "This book ID is not exist or might be deleted." });
        }

        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: "Invalid Review ID." });
        }

        let checkReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!checkReview) {
            return res.status(404).send({ status: false, message: "This Review ID is not exist or might be deleted." });
        }

        checkReview = checkReview.bookId;

        if (checkReview != bookId) {
            return res.status(400).send({ status: false, message: "Book ID not relevant to Review Id." });
        }

        if (!reviewedBy && !review && !rating) {
            return res.status(400).send({ status: false, message: "At least one field is required." });
        }

        let updateData = {};

        if (reviewedBy) {
            if (typeof reviewedBy != "string") {
                return res.status(400).send({ status: false, message: "reviewedBy must be string." });
            }
            if (!reviewedBy.trim()) {
                return res.status(400).send({ status: false, message: "reviewedBy can not be empty." });
            }
            reviewedBy = reviewedBy.trim();
            if (!validateName(reviewedBy)) {
                return res.status(400).send({ status: false, message: "reviewer name is invalid." });
            }
            updateData.reviewedBy = reviewedBy;
        }

        if (review) {
            if (typeof review != "string") {
                return res.status(400).send({ status: false, message: "review must be string." });
            }
            if (!review.trim()) {
                return res.status(400).send({ status: false, message: "review can not be empty." });
            }
            review = review.trim();
            updateData.review = review;
        }

        if (rating) {
            rating = parseFloat(rating);
            if (!rating || (!(rating <= 5 && rating >= 1))) {
                return res.status(400).send({ status: false, message: "rating is invalid. It must be 1 to 5." });
            }
            updateData.rating = rating;
        }

        updateData.reviewedAt = Date.now();

        let updateReview = await reviewModel.findOneAndUpdate(
            { _id: reviewId, isDeleted: false },
            updateData,
            { new: true }
        ).select({ __v: 0, createdAt: 0, updatedAt: 0, isDeleted: 0 });

        return res.status(200).send({ status: true, message: "Success", data: updateReview });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


// ================================= Delete Revies of Books =====================================================//
const deleteReviewById = async function (req, res) {
    try {
        let data = req.params;
        let { bookId, reviewId } = data;

        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid Book ID." });
        }

        let checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!checkBookId) {
            return res.status(404).send({ status: false, message: "This book ID is not exist or might be deleted." });
        }

        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: "Invalid Review ID." });
        }

        let checkReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!checkReview) {
            return res.status(404).send({ status: false, message: "This Review ID is not exist or might be deleted." });
        }

        checkReview = checkReview.bookId;

        if (checkReview != bookId) {
            return res.status(400).send({ status: false, message: "Book ID not relevant to Review Id." });
        }

        await reviewModel.findOneAndUpdate(
            { _id: reviewId, isDeleted: false },
            { isDeleted: true }
        );

        await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: -1 } },
        );

        return res.status(200).send({ status: true, message: "Successfully Deleted." });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = { reviewBook, updateBookReview, deleteReviewById };