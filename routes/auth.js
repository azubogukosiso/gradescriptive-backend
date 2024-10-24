import express from "express";
const authRouter = express.Router();
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config()

// MODELS
import { Lecturer } from "../models/lecturer.model.js"
import { Student } from "../models/student.model.js"


// HANDLE ERRORS
const handleErrors = (err) => {
    console.log(err);
    const errors = { email: "", password: "", regNo: "", staffID: "" };

    // INCORRECT STAFF ID ERROR
    if (err.message.includes("Incorrect Staff ID")) {
        errors.staffID = "This is an invalid staff ID";
        return errors;
    }

    // INCORRECT REG NO ERROR
    if (err.message.includes("Incorrect Reg No")) {
        errors.regNo = "This is an invalid registration number";
        return errors;
    }

    // INCORRECT EMAIL ERROR
    if (err.message.includes("Incorrect Email")) {
        errors.email = "This email is not registered";
        return errors;
    }

    // INCORRECT PASSWORD ERROR
    if (err.message.includes("Incorrect Password")) {
        errors.password = "The password is not correct";
        return errors;
    }

    return errors;
};

// CREATE COOKIE VALIDITY TIME
const maxAge = 3 * 24 * 60 * 60; // 3 days
// CREATE JWT USING FXN
const createToken = (id) => {
    return jwt.sign({ id }, "gradescriptiveSecretToken", {
        expiresIn: maxAge,
    });
};



// ############## ROUTE LIST ##############

// LOGS IN STUDENT
authRouter.route("/student").post(async (req, res) => {
    console.log(req.body);
    const { email, regNo, password } = req.body;

    try {
        const student = await Student.login(email, regNo, password);
        const studentID = student._id;
        const token = createToken(student._id);
        // res.cookie("gradescriptive", token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: maxAge * 1000 }).status(200).send({ success: 'Sent' });
        res.status(200).json({ token, userRole: 'student', studentID, email });
    } catch (err) {
        const errorObj = handleErrors(err);
        console.log(errorObj);
        res.status(400).send(errorObj);
    }
});

// LOGS IN LECTURER
authRouter.route("/lecturer").post(async (req, res) => {
    console.log(req.body);
    const { email, staffID, password } = req.body;

    try {
        const lecturer = await Lecturer.login(email, staffID, password);
        const lecturerID = lecturer._id;
        const token = createToken(lecturer._id);
        // res.cookie("gradescriptive", token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: maxAge * 1000 }).status(200).send({ success: 'Sent' });
        res.status(200).json({ token, userRole: 'lecturer', lecturerID, email });
    } catch (err) {
        const errorObj = handleErrors(err);
        res.status(400).send(errorObj);
    }
});

export { authRouter };
