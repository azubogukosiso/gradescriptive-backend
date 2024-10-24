const cosineSimilarity = (vectorA, vectorB) => {
    if (vectorA.length !== vectorB.length) {
        throw new Error("Vectors must have the same dimension");
    }

    // CALCULATE THE DOT PRODUCT OF THE TWO VECTORS
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        magnitudeA += vectorA[i] ** 2;
        magnitudeB += vectorB[i] ** 2;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    // AVOID DIVISION BY ZERO
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    // CALCULATE THE COSINE SIMILARITY
    const similarity = dotProduct / (magnitudeA * magnitudeB);

    return similarity;
}

export { cosineSimilarity };