// const mongoose = require("mongoose");
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const examAnswerSchema = new Schema(
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
        examQuestions: [],
        studentAnswers: [],
    },
    {
        timestamps: true,
    }
);

const ExamAnswer = mongoose.model('Exam_Answer', examAnswerSchema);
export { ExamAnswer };
// module.exports = ExamAnswer;