const router = require("express").Router();


const { createUser, loginUser } = require("../controller/userController");
const { createBook, getBooks, getBookById, updateBooks, deleteBookById } = require("../controller/bookController");
const { reviewBook, updateBookReview, deleteReviewById } = require("../controller/reviewController");
const { isAuthenticated, isAuthorized } = require("../middleware/commonMIddleware");


//======================================= User APIs =============================================//
router.post("/register", createUser);
router.post("/login", loginUser);
//===================================== Book APIs ===============================================//
router.post("/books", isAuthenticated, isAuthorized, createBook);
router.get("/books", isAuthenticated, getBooks);
router.get("/books/:bookId", isAuthenticated, getBookById);
router.put("/books/:bookId", isAuthenticated, isAuthorized, updateBooks);
router.delete("/books/:bookId", isAuthenticated, isAuthorized, deleteBookById);
//===================================== Review APIs ==============================================//
router.post("/books/:bookId/review", reviewBook);
router.put("/books/:bookId/review/:reviewId", updateBookReview);
router.delete("/books/:bookId/review/:reviewId", deleteReviewById);

//================================= Invalid Path API =========================================//
router.all('/*', (req , res) => {
    res.status(400).send({ status: false, message: " path invalid" });
});


module.exports = router;