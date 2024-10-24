import { pipeline } from "@xenova/transformers";
import { cosineSimilarity } from "./cosineSimilarity.js";

const semanticSimEval = async (examParameters, studentAnswer) => {
    const semanticSimilarityMarksArr = [];

    // LOAD MODEL
    const genEmbeddings = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L12-v2'
    );

    await Promise.all(examParameters.map(async (examParameter, index) => {
        // GENERATE EMBEDDINGS FOR EXAM ANSWERS
        let exam_answerEmbeddings = await genEmbeddings(examParameter.answer, {
            pooling: 'mean',
            normalize: true
        });

        // GENERATE EMBEDDINGS FOR STUDENT'S ANSWER
        let student_answerEmbeddings = await genEmbeddings(studentAnswer[index].answer, {
            pooling: 'mean',
            normalize: true
        });

        console.log("\n\nSemantic Similarity Evaluation.");
        console.log("Embeddings for lecturer and student's answer: ", exam_answerEmbeddings, student_answerEmbeddings);

        // COSINE SIMILARITY MEASURE
        let similarityResult = cosineSimilarity(exam_answerEmbeddings.data, student_answerEmbeddings.data);

        console.log("The cosine similarity result of embedding comparison: ", similarityResult);

        // CHECK IF SIMILARITY RESULT IS GREATER THAN 0
        if (similarityResult >= 0) {
            let percentage = similarityResult * 100;    // CONVERT TO PERCENTAGE

            // CALCULATE EARNED MARKS FOR STUDENT'S ANSWER
            let semanticSimilarityMarks = (percentage.toFixed(2) / 100) * (45 / 100) * parseInt(examParameter.marks);

            semanticSimilarityMarksArr.push(parseFloat(semanticSimilarityMarks.toFixed(2)));
        } else {
            // CALCULATE EARNED MARKS FOR STUDENT'S ANSWER
            semanticSimilarityMarksArr.push(0.00);
        }
    }));

    console.log("Total possible marks for semantic similarity evaluation: ", (45 / 100) * parseInt(examParameters[0].marks).toFixed(2));
    console.log("Marks obtained for semantic similarity evaluation: ", semanticSimilarityMarksArr);

    return semanticSimilarityMarksArr;
};

export { semanticSimEval };