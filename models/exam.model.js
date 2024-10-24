// const mongoose = require("mongoose");
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const examSchema = new Schema(
    {
        lecturerID: {
            type: String,
            required: true,
        },
        examTitle: {
            type: String,
            required: true,
        },
        examDuration: {
            type: Number,
            required: true,
        },
        questions: [],
    },
    {
        timestamps: true,
    }
);

const Exam = mongoose.model('Exam', examSchema);
export { Exam };
// module.exports = Exam;