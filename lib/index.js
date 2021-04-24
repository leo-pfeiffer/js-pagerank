'use strict';

/**
 * Import the mathjs package as math.
 * @type {module}
 * */
const math = require('mathjs')

/**
 * Implementation of the Google PageRank Algorithm. To run it, create an instance with an adjacency matrix
 * and call the `iterate` method on it.
 * @type {Class}
 * */
const PageRank = class {

    /**
     * Instantiate a new PageRank object with an adjacency matrix
     * @param {Array<Array<Number>>} A: Adjacency matrix.
     * @param {Array<Number> | null} v: Distribution vector (if not specified, uniform over the nodes)
     * @param {Number} tol: The tolerance threshold for convergence.
     * @param {Number} d: Damping factor. Probability of transitioning to an adjacent node.
     * @param {Number} maxIt: Maximum iteration in case the algorithm doesn't converge.
     * */
    constructor(A, v=null, d=0.85, tol=0.01, maxIt=1000) {

        /**
         * Adjacency matrix.
         * @type {Array<Array<Number>>}
         * */
        this.A = A;

        /**
         * Number of pages in the adjacency matrix.
         * @type {Number}
         * */
        this.pageCount = A.length;

        /**
         * Initial probability.
         * @type {Number}
         * */
        this.initProb = 1 / this.pageCount;

        /**
         * Damping factor. Probability of transitioning to an adjacent node.
         * @type {Number}
         * */
        this.d = d !== null ? d : 0.85;

        /**
         * Alpha, probability of jumping to random node.
         * @type {Number}
         * */
        this.alpha = 1 - this.d;

        /**
         * The tolerance threshold for convergence.
         * @type {Number}
         * */
        this.tol = tol;

        /**
         * The maximum number of iterations
         * @type {Number}
         * */
        this.maxIt = maxIt;

        /**
         * Hyperlink matrix containing the weighted links between nodes.
         * @type {Array<Array<Number>>}
         * */
        this.H = PageRank.makeMatrixH(A);

        /**
         * Array with binary dangling nodes vector.
         * @type {Array<Number>}
         * */
        this.a = PageRank.detectDangling(A);

        /**
         * General distribution vector (uniform over the nodes if not specified).
         * @type {Array<Number>}
         * */
        this.v = v || new Array(this.pageCount).fill(this.initProb)

        /**
         * Contains result of ranking.
         * */
        this.result = {};
    }

    /**
     * Convert an adjacency matrix into an H (hyperlink) matrix.
     * @param {Array<Array<Number>>} adjacency: The adjacency matrix to convert.
     * @return {Array<Array<Number>>}
     * */
    static makeMatrixH(adjacency) {
        return adjacency.map((row) => {
            const rowSum = row.reduce((a, b) => a + b, 0)
            if (rowSum === 0) return row
            else return row.map(el => el / rowSum)
        })
    }

    /**
     * Perform the Power Method iterations of the algorithm.
     * @param {Object<string, Number> | null} nameMap - optional. Keys are node names, values are index in adjacency matrix.
     * @return {Object} - Contains the resulting array, number of iterations, and whether the algorithm converged
     * */
    iterate(nameMap=null) {

        // the object we will return
        let output = {iterations: this.maxIt, converged: false}

        // pi vector - the target of our convergence
        let pi = math.matrix(new Array(this.pageCount).fill(1/this.pageCount))

        // save for comparison
        let piPrevious = math.clone(pi)

        // iterate at most until max iterations have been reached
        for (let i=0; i<this.maxIt; i++) {

            // Pi vector scaled by the damping factor
            let scaledPi = math.multiply(this.d, pi)

            // Calculate new pi
            let left = math.multiply(scaledPi, this.H)
            let right = math.multiply(math.add(math.multiply(scaledPi, this.a), this.alpha), this.v)

            pi = math.add(left, right);

            // check convergence on all nodes
            let conv = math.abs(math.subtract(pi, piPrevious)).toArray().filter(el => el > this.tol).length === 0

            // stop if converged
            if (conv) {
                output.converged = true;
                output.iterations = i + 1;
                break;
            }

            // save pi vector of current iteration
            piPrevious = math.clone(pi);
        }

        // add result to the output
        output.pi = pi.toArray();

        // add mapped results if nameMap supplied
        output.mappedResult = nameMap ? PageRank.getMappedResults(output.pi, nameMap) : null;

        // save output
        this.result = output;

        return output
    }

    /**
     * Detect dangling nodes in the adjacency matrix and return them in an array
     * where 0 means the node is non-dangling and 1 means the node is dangling.
     * @param {Array<Array<Number>>} adjacency - Adjacency matrix
     * @return {Array<Number>}
     * */
    static detectDangling(adjacency) {
        let dangling = new Array(adjacency[0].length).fill(0)
        adjacency.forEach((row, i) => {
            if (row.reduce((a, b) => a + b, 0) === 0) {
                dangling[i] = 1
            }
        })
        return dangling
    }

    /**
     * Map the results of a pi vector to the names in a nameMap.
     * @param {Array<Number>} pi - Results of PageRank
     * @param {Object<string, Number>} nameMap - Keys are name of node, values are index in pi
     * @return {Object<string, Number>} keys are name of node, values are ranking
     * */
    static getMappedResults(pi, nameMap) {
        let mappedResults = {}
        Object.entries(nameMap).forEach(([k, v], _) => {
            mappedResults[k] = pi[v]
        })
        return mappedResults;
    }

    /**
     * Create PageRank instance from Edge List.
     * Edge List ist array of arrays of length two where each inner array defines an edge between two nodes.
     * e.g. [[0, 1], []]
     * @param {Array<Array<Number>>} edgeList: Edge List from which to build the adjacency matrix
     * @param {Array<Number> | null} v: Distribution vector (if not specified, uniform over the nodes)
     * @param {Number} tol: The tolerance threshold for convergence.
     * @param {Number} d: Damping factor. Probability of transitioning to an adjacent node.
     * @param {Number} maxIt: Maximum iteration in case the algorithm doesn't converge.
     * */
    static fromEdgeList(edgeList, v=null, d=0.85, tol=0.01, maxIt=1000) {

        // check whether this is a valid edge list
        if (!Array.isArray(edgeList)) {
            throw new Error('Invalid edgeList: Must be an array.')
        }
        if (!edgeList.length) {
            throw new Error('Invalid edgeList: Array cannot be empty.')
        }
        for (let edge of edgeList) {
            if (!Array.isArray(edge)) {
                throw new Error('Invalid edgeList: Edges must be of type Array.')
            }
            if (edge.length !== 2) {
                throw new Error('Invalid edgeList: Edge must be of length 2.')
            }
            if (!Number.isInteger(edge[0]) || !Number.isInteger(edge[1])) {
                throw new Error('Invalid edgeList: Edge must be an array of two integers.')
            }
        }

        // get number of nodes (equals maximum index found in elements of edgeList + 1
        const numNodes = edgeList.reduce((a, b) => Math.max(b[0], b[1]) > a ? Math.max(b[0], b[1]) : a, 0) + 1

        // create empty adjacency matrix
        const adjacency = new Array(numNodes).fill(0)
            .map(_ => new Array(numNodes).fill(0));

        // insert edges into adjacency
        for (let edge of edgeList) {
            adjacency[edge[0]][edge[1]] = 1;
        }

        return new PageRank(adjacency, v, d, tol, maxIt)
    }

    /**
     * Create PageRank instance from Adjacency List.
     * * @param {Array<Array<Number>>} adjacencyList: Adjacency List.
     * @param {Array<Number> | null} v: Distribution vector (if not specified, uniform over the nodes)
     * @param {Number} tol: The tolerance threshold for convergence.
     * @param {Number} d: Damping factor. Probability of transitioning to an adjacent node.
     * @param {Number} maxIt: Maximum iteration in case the algorithm doesn't converge.
     * */
    static fromAdjacencyList(adjacencyList, v=null, d=0.85, tol=0.01, maxIt=1000) {

        // check whether this is a valid adjacency list
        if (!Array.isArray(adjacencyList)) {
            throw new Error('Invalid adjacencyList: Must be an array.')
        }
        if (adjacencyList.length === 0) {
            throw new Error('Invalid adjacencyList: Array cannot be empty.')
        }

        for (let adjacencies of adjacencyList) {
            if (!Array.isArray(adjacencies)) {
                throw new Error('Invalid adjacencyList: Adjacencies must be of type Array.')
            }
            for (let adjacency of adjacencies) {
                if (!Number.isInteger(adjacency)) {
                    throw new Error('Invalid adjacencyList: Adjacencies must be an integer.')
                }
            }
        }

        // create empty adjacency matrix
        const adjacency = new Array(adjacencyList.length).fill(0)
            .map(_ => new Array(adjacencyList.length).fill(0));

        for (let i=0; i<adjacencyList.length; i++) {
            const adjacencies = adjacencyList[i]
            for (let j=0; j<adjacencies.length; j++) {
                adjacency[i][adjacencies[j]] = 1;
            }
        }

        // return new PageRank instance with the adjacency matrix.
        return new PageRank(adjacency, v, d, tol, maxIt)
    }

    /**
     * Create PageRank instance from Adjacency Matrix (same as constructor).
     * @param {Array<Array<Number>>} adjacency: Adjacency matrix.
     * @param {Array<Number> | null} v: Distribution vector (if not specified, uniform over the nodes)
     * @param {Number} tol: The tolerance threshold for convergence.
     * @param {Number} d: Damping factor. Probability of transitioning to an adjacent node.
     * @param {Number} maxIt: Maximum iteration in case the algorithm doesn't converge.
     * */
    static fromAdjacencyMatrix(adjacency, v=null, d=0.85, tol=0.01, maxIt=1000) {
        return new PageRank(adjacency, v, d, tol, maxIt)
    }
}

module.exports = PageRank