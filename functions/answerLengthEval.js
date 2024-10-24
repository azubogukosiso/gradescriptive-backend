const answerLengthEval = (examParameters, studentAnswer) => {
    let answerLengthMarksArr = [];

    examParameters.map((examParameter, index) => {
        const exam_answer = examParameter.answer.split(' ');

        const student_answer = studentAnswer[index].answer.split(' ');

        console.log("\n\nAnswer Length Evaluation.");
        console.log("Number of words used in student's answer: ", student_answer.length);
        console.log("Number of words used in lecturer's answer: ", exam_answer.length);

        const percentage = (student_answer.length / exam_answer.length) * 100;

        console.log("Percentage length of student answer against lecturer answer: ", percentage);

        let answerLengthMarks;

        if (percentage >= 70) {
            answerLengthMarks = (10 / 100) * parseInt(examParameter.marks);
        } else {
            answerLengthMarks = (percentage / 100) * (10 / 100) * parseInt(examParameter.marks);
        }

        answerLengthMarksArr.push(parseFloat(answerLengthMarks.toFixed(2)));
    });

    console.log("Total possible marks for answer length evaluation: ", (10 / 100) * parseInt(examParameters[0].marks).toFixed(2));
    console.log("Marks obtained for answer length evaluation: ", answerLengthMarksArr);

    return answerLengthMarksArr;
};

export { answerLengthEval };