const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");
const { validateName, validateEmail, validatePassword, validateMobileNo, validatePincode, validatePlace } = require("../validator/validator");


// ========================================== Create User ================================================//
const createUser = async function (req, res) {
    try {
        let data = req.body;
        let { title, name, phone, email, password, address } = data;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Request can't be empty" });
        }

        if (title && typeof title != "string") {
            return res.status(400).send({ status: false, message: "Title must be in string" });
        }
        if (!title || !title.trim()) {
            return res.status(400).send({ status: false, message: "Title must be required or can't be empty" });
        }
        if (!["Mr", "Mrs", "Miss"].includes(title.trim())) {
            return res.status(400).send({ status: false, message: "please use a valid title as Mr,Mrs,Miss" });
        }

        if (name && typeof name != "string") {
            return res.status(400).send({ status: false, message: "Name must be in string" });
        }
        if (!name || !name.trim()) {
            return res.status(400).send({ status: false, message: "Name must be required or it can't be empty" });
        }
        if (!validateName(name.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid name" });
        }

        if (phone && typeof phone != "string") {
            return res.status(400).send({ status: false, message: "Phone must be in string" });
        }
        if (!phone || !phone.trim()) {
            return res.status(400).send({ status: false, message: "Phone number must be required or can't be empty" });
        }
        if (!validateMobileNo(phone.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid indian format number" });
        }
        const existPhone = await userModel.findOne({ phone: phone });
        if (existPhone) {
            return res.status(400).send({ status: false, message: "phone is already exist,enter a unique number" });
        }

        if (email && typeof email != "string") {
            return res.status(400).send({ status: false, message: "Email must be in string" });
        }
        if (!email || !email.trim()) {
            return res.status(400).send({ status: false, message: "Email must be required or email can't be empty" });
        }
        if (!validateEmail(email.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid email" });
        }
        const existEmail = await userModel.findOne({ email: email });
        if (existEmail) {
            return res.status(400).send({ status: false, message: "Email already exist,it should be unique" });
        }

        if (password && typeof password != "string") {
            return res.status(400).send({ status: false, message: "Password must be in string" });
        }
        if (!password || !password.trim()) {
            return res.status(400).send({ status: false, message: "password must be required or password can't be empty" });
        }
        if (!validatePassword(password.trim())) {
            return res.status(400).send({ status: false, message: "Password Must be 8-15 length,consist of mixed character and special character" });
        }

        if (address) {
            if (typeof address != "object") {
                return res.status(400).send({ status: false, message: "value of address must be in json format" });
            }
            let { street, city, pincode } = address;
            if (street && typeof street != "string") {
                return res.status(400).send({ status: false, message: "Street must be in string" });
            }
            if (!street || !street.trim()) {
                return res.status(400).send({ status: false, message: "Street must be required or Street can't be empty" });
            }
            if (city && typeof city != "string") {
                return res.status(400).send({ status: false, message: "City must be in string" });
            }
            if (!city || !city.trim()) {
                return res.status(400).send({ status: false, message: "city must be required or city can't be empty" });
            }
            if (!validatePlace(city.trim())) {
                return res.status(400).send({ status: false, message: "city is invalid, number is not allowed" });
            }
            if (pincode && typeof pincode != "string") {
                return res.status(400).send({ status: false, message: "pincode must be in string" });
            }
            if (!pincode || !pincode.trim()) {
                return res.status(400).send({ status: false, message: "pincode must be required or pincode can't be empty" });
            }
            if (!validatePincode(pincode.trim())) {
                return res.status(400).send({ status: false, message: "pincode is invalid" });
            }
        }

        let userDetails = await userModel.create(data);

        res.status(201).send({ status: true, message: "Success", data: userDetails });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


// ====================================== LOGIN User ======================================================//
const loginUser = async function (req, res) {
    try {
        const data = req.body;
        let { email, password } = data;
        if (Object.keys(data).length != 0) {

            if (email && typeof email != "string") {
                return res.status(400).send({ status: false, message: "email must be in string" });
            }
            if (!email || !email.trim()) {
                return res.status(400).send({ status: false, message: "Email is mandatory and can not be empty." });
            }
            email = email.toLowerCase().trim();
            if (!validateEmail(email)) {
                return res.status(400).send({ status: false, message: "Please enter a valid Email." });
            }

            if (password && typeof password != "string") {
                return res.status(400).send({ status: false, message: "password must be in string" });
            }
            if (!password || !password.trim()) {
                return res.status(400).send({ status: false, message: "Password is mandatory and can not be empty." });
            }

            const userData = await userModel.findOne({ email: email, password: password });
            if (!userData) {
                return res.status(404).send({ status: false, message: "No such user exist. Please Enter a valid Email and Passowrd." });
            }

            let token = jwt.sign({
                userId: userData._id.toString(),
                exp: Math.floor(Date.now() / 1000) + (120 * 60),
                iat: Math.floor(Date.now())
            }, 'project4grp14');

            res.setHeader("x-api-key", token);
            res.status(200).send({ status: true, message: "Successfully Login.", data: { "token": token } });
        } else {
            return res.status(400).send({ status: false, message: "Body can not be empty" });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = { createUser, loginUser };