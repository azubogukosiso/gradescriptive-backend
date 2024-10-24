import natural from "natural";
let wordnet = new natural.WordNet();

const nGrams = natural.NGrams;

import { removeStopwords } from '../node_modules/stopword/dist/stopword.esm.mjs';

import posTagger from "wink-pos-tagger";

import { pipeline } from "@xenova/transformers";

import { cosineSimilarity } from "./cosineSimilarity.js";


const genEmbeddings = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L12-v2'
);

const keywordEval = async (mainText, studentText) => {
    console.log("\n\nThe Keyword Matching Process");

    // FOR COMPARING KEYWORDS
    const compareWord = async (result, newStudentText) => {
        let match = 0;

        await Promise.all(newStudentText.map(async (string) => {
            if (string === result.string) {
                match = 100;
                console.log(`The word ${result.string} found a match!`);
            } else {
                await Promise.all(result.stringSyns.map(async (stringSyn) => {
                    stringSyn.synonyms.map(syn => {
                        if (string === syn) {
                            console.log(`The synonym of ${result.string}, i.e. ${string}, found a match!`);
                            match = 100;
                        }
                    })
                }));
            }
        }));

        return match;
    }

    // FOR COMPARING KEYPHRASES
    const comparePhrase = async (result, newStudentText) => {
        let match = 0;

        let arrOfNgramsInit = [];

        for (let n_gram_num = 2; n_gram_num < 5; n_gram_num++) {
            let arrayOfNgrams = nGrams.ngrams(newStudentText, n_gram_num);


            arrayOfNgrams.map((array, index) => {
                arrayOfNgrams[index] = array.join(' ');
            });


            arrOfNgramsInit.push(...arrayOfNgrams);
        }

        console.log("List of generated n-grams: ", arrOfNgramsInit);

        let matchArr = [];
        await Promise.all(arrOfNgramsInit.map(async (ngram) => {
            let embeds = await genEmbeddings(ngram, {
                pooling: 'mean',
                normalize: true
            });

            let simRes = cosineSimilarity(embeds.data, result.stringEmbed.data);

            simRes = (simRes * 100).toFixed(2);

            if (simRes >= 70) {
                const matchObj = {
                    simRes,
                    ngram,
                    phrase: result.string,
                }

                matchArr.push(matchObj);
            }
        }));

        if (matchArr.length > 0) {
            const maxObject = matchArr.reduce((max, compare) =>
                (parseFloat(max.simRes) > parseFloat(compare.simRes)) ? max : compare
            );

            match = maxObject.simRes;

            console.log("Closest key phrase match: ", maxObject);
        }

        return match;
    }

    // LOOKING UP SYNONYMS OF A WORD
    const lookupAsync = (string) => {
        return new Promise((resolve, reject) => {
            wordnet.lookup(string, (results) => {
                if (results && results.length > 0) {
                    resolve(results);
                } else {
                    reject(new Error('No synonyms found'));
                }
            });
        });
    };


    let marksForKeywordEvalArr = []; // MARKS EARNED FOR EACH QUESTION
    await Promise.all(studentText.map(async (text, index) => { // LOOPING THROUGH STUDENT'S ANSWER
        let posArrayStudentText = [];

        let tagger = posTagger();
        const posTagResultsStudentText = tagger.tagSentence(text.answer);

        posTagResultsStudentText.map(tagResult => {
            (tagResult.lemma === undefined) ? posArrayStudentText.push(tagResult.value) : posArrayStudentText.push(tagResult.lemma);
        });

        console.log("The student's answer - tokenized and lemmatized: ", posArrayStudentText);

        const newStudentText = removeStopwords(posArrayStudentText);

        console.log("Student's answer without stopwords: ", newStudentText);

        const oldString2 = mainText[index].keywords.split(',');
        oldString2.map((string, index) => {
            const stringNWS = string.trim();
            oldString2[index] = stringNWS;
        });

        let newExaminerKeywords = [];
        await oldString2.map(async (string) => {
            const posTagResultsExaminerKeywords = tagger.tagSentence(string);

            let randomArray = [];
            await posTagResultsExaminerKeywords.map((tagResult) => {
                (tagResult.lemma === undefined) ? randomArray.push(tagResult.value) : randomArray.push(tagResult.lemma);
            })

            let randomArray2 = removeStopwords(randomArray);
            let randomArray3 = randomArray2.join(' ');
            newExaminerKeywords.push(randomArray3);
        })
        console.log("Lemmatized keywords without stopwords: ", newExaminerKeywords);

        let matchPercentages = [];

        await Promise.all(newExaminerKeywords.map(async (string) => {
            const splitString = string.split(' ');
            if (splitString.length === 1) {

                console.log(`The key term ${string}, is a word.`);

                let syns = [];
                syns = await lookupAsync(string);

                const wordSynObj = {
                    string,
                    stringSyns: syns,
                }

                console.log(`Synonyms of ${string}: ${syns}`);

                let match = await compareWord(wordSynObj, newStudentText);
                if (match) {
                    matchPercentages.push(match);
                } else {
                    matchPercentages.push(0);
                }

            } else {
                console.log(`The key term ${string}, is a phrase.`);

                let embeds = await genEmbeddings(string, {
                    pooling: 'mean',
                    normalize: true
                });

                const wordEmbedObj = {
                    string,
                    stringEmbed: embeds,
                }

                console.log(`Embeddings of ${string}: ${embeds}`);

                let match = await comparePhrase(wordEmbedObj, newStudentText);
                if (match) {
                    matchPercentages.push(parseFloat(match));
                } else {
                }
            }
        }));

        let totalPercentage = matchPercentages.reduce((acc, current) => {
            return acc + current;
        }, 0);

        console.log("Total match percentage: ", totalPercentage);

        let avgPercentage = totalPercentage / oldString2.length;

        console.log("Average match percentage: ", totalPercentage);

        let marksForKeywordEval = (avgPercentage.toFixed(2) / 100) * (45 / 100) * mainText[0].marks;

        marksForKeywordEvalArr.push(marksForKeywordEval.toFixed(2));
    }));

    console.log("Total possible marks for semantic similarity evaluation: ", ((45 / 100) * parseInt(mainText[0].marks)).toFixed(2));
    console.log("Marks obtained for keyword evaluation: ", marksForKeywordEvalArr);

    return marksForKeywordEvalArr;
};

export { keywordEval };