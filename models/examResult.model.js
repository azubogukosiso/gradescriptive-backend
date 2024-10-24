// const mongoose = require("mongoose");
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const examResultSchema = new Schema(
    {
        lecturerID: {
            type: String,
            required: true,
        },
        examTitle: {
            type: String,
            required: true,
        },
        examId: {
            type: String,
            required: true,
        },
        studentEmail: {
            type: String,
            required: true,
        },
        examResult: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const ExamResult = mongoose.model('Exam_Result', examResultSchema);
export { ExamResult };
