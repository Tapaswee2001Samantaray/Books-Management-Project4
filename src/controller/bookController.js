const moment = require("moment");
const { isValidObjectId } = require("mongoose");

const bookModel = require("../model/bookModel.js");
const userModel = require("../model/userModel");
const reviewModel = require("../model/reviewModel");
const { validateISBN } = require("../validator/validator.js");
const {uploadFile} = require("../AWS/awsConfiguration");

// ===================================== Create Books =====================================================//
const createBook = async function (req, res) {
    try {
        let body = req.body;
        let { title, excerpt, ISBN, category, subcategory, releasedAt } = body;

        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, message: "Body can not be empty" });
        }

        if (title && typeof title != "string") {
            return res.status(400).send({ status: false, message: "Title must be in string" });
        }
        if (!title || !title.trim()) {
            return res.status(400).send({ status: false, message: "Title must be present in body and can't be empty." });
        }
        title = title.toLowerCase().trim();
        let checkTitle = await bookModel.findOne({ title: title });
        if (checkTitle) {
            return res.status(400).send({ status: false, message: "This title already in use for other book" });
        }

        if (excerpt && typeof excerpt != "string") {
            return res.status(400).send({ status: false, message: "Excerpt must be in string" });
        }
        if (!excerpt || !excerpt.trim()) {
            return res.status(400).send({ status: false, message: " Excerpt must be present in body and can't be empty." });
        }
        excerpt = excerpt.trim();

        if (ISBN && typeof ISBN != "string") {
            return res.status(400).send({ status: false, message: "ISBN must be in string" });
        }
        if (!ISBN || !ISBN.trim()) {
            return res.status(400).send({ status: false, message: " ISBN must be present in body and it can't be empty." });
        }
        if (!validateISBN(ISBN.trim())) {
            return res.status(400).send({ status: false, message: " Invalid ISBN number it should contain only 13 digits" });
        }
        const checkISBN = await bookModel.findOne({ ISBN: ISBN });
        if (checkISBN) {
            return res.status(400).send({ status: false, message: "This ISBN number is already alotted." });
        }

        if (category && typeof category != "string") {
            return res.status(400).send({ status: false, message: "category must be in string" });
        }
        if (!category || !category.trim()) {
            return res.status(400).send({ status: false, message: "Category must be present in body and can't be empty." });
        }
        category = category.trim();

        if (subcategory && typeof subcategory != "string") {
            return res.status(400).send({ status: false, message: "subcategory must be in string" });
        }
        if (!subcategory || !subcategory.trim()) {
            return res.status(400).send({ status: false, message: "Subategory must be present in body and can't be empty." });
        }
        subcategory = subcategory.trim();

        if (releasedAt && typeof releasedAt != "string") {
            return res.status(400).send({ status: false, message: "releasedAt must be in string" });
        }
        if (!releasedAt || !releasedAt.trim()) {
            return res.status(400).send({ status: false, message: "releasedAt must be present in body and can't be empty." });
        }
        let trimReleasedAt = releasedAt.trim();
        if (moment(trimReleasedAt, "YYYY-MM-DD").format("YYYY-MM-DD") !== trimReleasedAt) {
            return res.status(400).send({ status: false, message: "Please enter the Date in the format of 'YYYY-MM-DD'." });
<<<<<<< HEAD
        }

        let files = req.files
        if (files && files.length > 0) {
            let uploadFileURL = await uploadFile(files[0])
            body.bookCover = uploadFileURL
            
            const uniqueCover = await bookModel.findOne({ bookCover: uploadFileURL })
            if (uniqueCover) {
                return res.status(400).send({ status: false, message: "Book cover is already exist." })
            }
            
        } else {
            return res.status(400).send({ status: false, message: "No file found" })
=======
>>>>>>> f8ee648fe1902963e9753627124eb1429ec60344
        }

        const bookList = await bookModel.create(body);

        res.status(201).send({ status: true, message: "Success", data: bookList });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


// ====================================== Get All Books List ==================================================//
const getBooks = async function (req, res) {
    try {
        let data = req.query;
        const { userId, category, subcategory } = data;

        if (userId) {

            if (!isValidObjectId(userId)) {
                return res.status(400).send({ status: false, message: "Invalid User ID." });
            }
            const checkUserId = await userModel.findById(userId);
            if (!checkUserId) {
                return res.status(404).send({ status: false, message: "Data not found with this User ID. Please enter a valid User ID." });
            }
        }

        const bookDetails = await bookModel.find({ ...data, isDeleted: false }).sort({ title: 1 }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0, ISBN: 0, subcategory: 0 });
        if (bookDetails.length == 0) {
            return res.status(404).send({ status: false, message: "Data not found or data already deleted." });
        }

        res.status(200).send({ status: true, message: "Books List.", data: bookDetails });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


// ================================= Get Books List By BookId =================================================//
const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        if (!bookId) {
            return res.status(400).send({ status: false, message: "Please provide book Id in param." });
        }
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid Book Id." });
        }

        let getBookData = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ __v: 0 });
        if (!getBookData) {
            return res.status(404).send({ status: false, message: "No book exist with this id or it might be deleted." });
        }

        let reviewData = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 });

        let reviewCount = reviewData.length;

        getBookData._doc.reviewsData = reviewData;
        getBookData._doc.reviews = reviewCount;

        return res.status(200).send({ status: true, message: 'Books List', data: getBookData });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



// =================================== Update Books ===========================================================//
const updateBooks = async function (req, res) {
    try {
        let BookID = req.params.bookId;
        let data = req.body;

        const { title, excerpt, ISBN, releasedAt } = data;

        if (Object.keys(data).length != 0) {

            if (!title && !excerpt && !ISBN && !releasedAt) {
                return res.status(400).send({ status: false, message: "At least one field is required." });
            }

            let updateData = {};

            if (title) {
                if (title && typeof title != "string") {
                    return res.status(400).send({ status: false, message: "Title must be in string" });
                }
                if (!title.trim()) {
                    return res.status(400).send({ status: false, message: "Title can not be empty." });
                }
                let trimTitle = title.toLowerCase().trim();
                const checkTitle = await bookModel.findOne({ title: trimTitle });
                if (checkTitle) {
                    return res.status(400).send({ status: false, message: `The title ${trimTitle} is already is in use for a Book.Try another one.` });
                }
                updateData.title = trimTitle;
            }

            if (excerpt) {
                if (excerpt && typeof excerpt != "string") {
                    return res.status(400).send({ status: false, message: "excerpt must be in string" });
                }
                if (!excerpt.trim()) {
                    return res.status(400).send({ status: false, message: "Excerpt can not be empty." });
                }
                let trimExcerpt = excerpt.trim();
                updateData.excerpt = trimExcerpt;
            }

            if (ISBN) {
                if (ISBN && typeof ISBN != "string") {
                    return res.status(400).send({ status: false, message: "ISBN must be in string" });
                }
                if (!ISBN.trim()) {
                    return res.status(400).send({ status: false, message: "ISBN can not be empty." });
                }
                let trimISBN = ISBN.trim();
                if (!validateISBN(trimISBN)) {
                    return res.status(400).send({ status: false, message: " Invalid ISBN number it should contain only 13 digits" });
                }
                const checkISBN = await bookModel.findOne({ ISBN: trimISBN });
                if (checkISBN) {
                    return res.status(400).send({ status: false, message: `The ISBN ${trimISBN} is already is in use for a Book.Try another one.` });
                }
                updateData.ISBN = trimISBN;
            }

            if (releasedAt) {
                if (releasedAt && typeof releasedAt != "string") {
                    return res.status(400).send({ status: false, message: "releasedAt must be in string" });
                }
                let trimReleasedAt = releasedAt.trim();
                if (moment(trimReleasedAt, "YYYY-MM-DD").format("YYYY-MM-DD") !== trimReleasedAt) {
                    return res.status(400).send({ status: false, message: "Please enter the Date in the format of 'YYYY-MM-DD'." });
                }
                updateData.releasedAt = trimReleasedAt;
            }

            const updateBookDetails = await bookModel.findOneAndUpdate(
                { _id: BookID, isDeleted: false },
                updateData,
                { new: true }
            );

            if (!updateBookDetails) {
                return res.status(404).send({ status: false, message: "No data found for updation." });
            }

            return res.status(200).send({ status: true, message: "Success", data: updateBookDetails });
        } else {
            return res.status(400).send({ status: false, message: "Invalid request, body can't be empty." });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



// ====================================== Delete Books ===================================================//
const deleteBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        let deleteByBookId = await bookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            { isDeleted: true, deletedAt: Date.now() }
        );

        if (!deleteByBookId) {
            return res.status(404).send({ status: false, message: "Book is already deleted." });
        }

        await reviewModel.updateMany(
            { bookId: bookId, isDeleted: false },
            { isDeleted: true }
        );

        return res.status(200).send({ status: true, message: "Successfully Deleted." });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


module.exports = { createBook, getBooks, getBookById, updateBooks, deleteBookById };