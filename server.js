// const express = require("express");
import express from "express";
// const cookieParser = require("cookie-parser");
import cookieParser from "cookie-parser";
// const mongoose = require("mongoose");
import mongoose from "mongoose";
// const cors = require('cors');
import cors from "cors";
// require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config()

const app = express();

const PORT = process.env.PORT || 5000;

// ROUTES
// const questionRouter = require("./routes/exam");
import { questionRouter } from "./routes/exam.js";
import { authRouter } from "./routes/auth.js"

// CONNECTION TO THE DATABASE
mongoose.connect(process.env.MONGO_URL_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    app.listen(PORT, () => {
        console.log("server has started at port", PORT)
    });
});

app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/exam", questionRouter);
app.use("/auth", authRouter);
