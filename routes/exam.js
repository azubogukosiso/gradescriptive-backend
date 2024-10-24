import express from "express";
const questionRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config()

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import pkg from 'nodemailer-express-handlebars';
const hbs = pkg;
import pkg_2 from 'nodemailer';
const nodemailer = pkg_2;

// MODELS
import { Exam } from "../models/exam.model.js";
import { ExamAnswer } from "../models/examAnswer.model.js";
import { ExamResult } from "../models/examResult.model.js";

// FUNCTIONS
import { answerLengthEval } from "../functions/answerLengthEval.js";
import { semanticSimEval } from "../functions/semanticSimEval.js";
import { keywordEval } from "../functions/keywordEval.js"

var transporter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS
        },
    }
);

const handlebarOptions = {
    viewEngine: {
        extName: '.handlebars',
        partialsDir: path.resolve(__dirname, 'views'),
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, 'views'),
};

transporter.use('compile', hbs(handlebarOptions))


// ############## ROUTE LIST ##############

// SAVES EXAM PARAMETERS AND QUESTIONS TO DATABASE
questionRouter.route("/").post((req, res) => {
    let isEmpty = false;
    if (!req.body.examTitle || !req.body.examDuration === 0 || !req.body.examDuration) {
        res.status(400).send({ error: 'Fill up all fields!' });
    } else {
        req.body.questions.map(questionData => {
            if (!questionData.question || !questionData.answer || questionData.marks === 0 || !questionData.keywords || !questionData.marks) {
                isEmpty = true;
            }
        })
        if (isEmpty) {
            res.status(400).send({ error: 'Fill up all fields!' });
        }
        else {
            req.body.examDuration = parseInt(req.body.examDuration);

            console.log(req.body);

            new Exam(req.body).save()
                .then((_savedDoc) => {
                    res.status(200).send({ success: 'Saved successfully!' });
                })
                .catch(err => res.status(500).send(err));
        }
    }
});

// LOADS ALL EXAMS
questionRouter.route("/").get((_req, res) => {
    Exam.find()
        .then(allExams => {
            res.status(200).json(allExams);
        })
        .catch(err => res.status(500).send(err));
});

// LOADS ALL DATA FOR A PARTICULAR EXAM
questionRouter.route("/:id").get((req, res) => {
    Exam.findById(req.params.id)
        .then(questionData => {
            res.status(200).json(questionData);
        })
        .catch(err => res.status(500).send(err));
});

// LOADS EXAM RESULTS FOR A LECTURER
questionRouter.route("/results").post((req, res) => {
    ExamResult.find({ lecturerID: req.body.lecturerID })
        .then(resultData => {
            res.status(200).json(resultData);
        })
        .catch(err => res.status(500).send(err));
});

// SUBMITS EXAM ANSWERS FOR AN EXAM
questionRouter.route("/submit").post((req, res) => {
    console.log(req.body);
    let isEmpty = false;
    req.body.studentAnswers.map(studentAnswer => {
        if (!studentAnswer.answer) {
            isEmpty = true;
        }
    })
    if (isEmpty) {
        res.status(400).send({ error: 'Fill up all fields!' });
    } else {
        new ExamAnswer(req.body).save()
            .then(async (savedDoc) => {
                res.status(200).send({ success: 'Saved successfully!' });

                const markForAnswerLength = answerLengthEval(savedDoc.examQuestions, savedDoc.studentAnswers);

                const markForSemanticSim = await semanticSimEval(savedDoc.examQuestions, savedDoc.studentAnswers);

                const markForKeyword = await keywordEval(savedDoc.examQuestions, savedDoc.studentAnswers);

                const totalMarksArr = [];
                for (let index = 0; index < markForAnswerLength.length; index++) {
                    let totalMarks = markForAnswerLength[index] + markForSemanticSim[index] + parseFloat(markForKeyword[index]);
                    totalMarksArr.push(totalMarks.toFixed(2));
                }
                console.log(totalMarksArr);

                let sumOfTotalMarks = totalMarksArr.reduce((acc, current) => {
                    return parseFloat(acc) + parseFloat(current);
                }, 0);


                const setMarksArr = [];
                for (let index = 0; index < savedDoc.examQuestions.length; index++) {
                    setMarksArr.push(savedDoc.examQuestions[index].marks);
                }

                let sumOfSetMarks = setMarksArr.reduce((acc, current) => {
                    return parseFloat(acc) + parseFloat(current);
                }, 0);


                console.log("total score: ", sumOfTotalMarks.toFixed(2), "/", sumOfSetMarks.toFixed(2));

                console.log("Examiner's Answers: ", savedDoc.examQuestions)
                console.log("Email address: ", savedDoc.studentEmail);

                const examResultDetails = {
                    lecturerID: savedDoc.lecturerID, examTitle: savedDoc.examTitle, examId: savedDoc.examId, studentEmail: savedDoc.studentEmail, examResult: `${sumOfTotalMarks.toFixed(2)}/${sumOfSetMarks.toFixed(2)}`
                }

                new ExamResult(examResultDetails).save()
                    .then((savedDocExamResult) => {
                        console.log(savedDocExamResult);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            })
            .catch(err => {
                res.status(500).send(err);
            });
    }

});

// SENDS RESULTS AS EMAIL
questionRouter.route("/email").post(async (req, res) => {
    console.log(req.body);

    const mailOptions = {
        from: '"Gradescriptive" <gradescriptive@gmail.com>',
        to: req.body.studentEmail,
        subject: `Your grades are ready ${req.body.studentEmail}`,
        template: "email",
        context: {
            exam: req.body.examTitle,
            score: req.body.examResult
        },
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email delivery successful!");
        res.status(200).send({ msg: 'success' });
    } catch (error) {
        console.log("Error sending mail", error);
        res.status(500).send({ msg: error });
    }
});

// module.exports = router;
export { questionRouter };