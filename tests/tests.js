const mocha = require('mocha');
const chai = require('chai');
const chaiAlmost = require('chai-almost');
const PageRank = require("../lib/index");

const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiAlmost(0.01));

const adjacencyMatrix = [
    [0, 1, 1],
    [1, 0, 0],
    [0, 1, 0]
]

const adjacencyList = [
    [1, 2],
    [0],
    [1]
]

const edgeList = [
    [0, 1], [0, 2],
    [1, 0],
    [2, 1]
]

describe("PageRank instantiation successful", function() {
    it("should create a PageRank instance from the constructor", function () {
        const pageRank = new PageRank(adjacencyMatrix);
        assert.instanceOf(pageRank, PageRank);
        expect(pageRank.A).to.eql(adjacencyMatrix);
    });
    it("should create a PageRank instance from an adjacency matrix", function () {
        const pageRank = PageRank.fromAdjacencyMatrix(adjacencyMatrix);
        assert.instanceOf(pageRank, PageRank);
        expect(pageRank.A).to.eql(adjacencyMatrix);
    });
    it("should create a PageRank instance from an adjacency list", function () {
        const pageRank = PageRank.fromAdjacencyList(adjacencyList);
        assert.instanceOf(pageRank, PageRank);
        expect(pageRank.A).to.eql(adjacencyMatrix);
    });
    it("should create a PageRank instance from an edge list", function () {
        const pageRank = PageRank.fromEdgeList(edgeList);
        assert.instanceOf(pageRank, PageRank);
        expect(pageRank.A).to.eql(adjacencyMatrix);
    });
});

describe("PageRank instantiation unsuccessful", function() {
    it("should not create a PageRank instance from non array", function () {
        const foo1 = () => PageRank.fromEdgeList('hello');
        const foo2 = () => PageRank.fromAdjacencyList('hello');
        expect(foo1).to.throw(Error, /Invalid/);
        expect(foo2).to.throw(Error, /Invalid/);
    });
    it("should not create a PageRank instance from empty array", function () {
        const foo1 = () => PageRank.fromEdgeList([]);
        const foo2 = () => PageRank.fromAdjacencyList([]);
        expect(foo1).to.throw(Error, /Invalid/);
        expect(foo2).to.throw(Error, /Invalid/);
    });
    it("should not create a PageRank instance from invalid input", function () {
        const foo1 = () => PageRank.fromEdgeList(['a', 'b']);
        const foo2 = () => PageRank.fromEdgeList([[1], [1]]);
        const foo3 = () => PageRank.fromEdgeList([['a', 'b'], [1, 2]]);
        const foo4 = () => PageRank.fromAdjacencyList(['a', 'b']);
        const foo5 = () => PageRank.fromAdjacencyList([['a', 'b'], [1, 2]]);
        expect(foo1).to.throw(Error, /Invalid/);
        expect(foo2).to.throw(Error, /Invalid/);
        expect(foo3).to.throw(Error, /Invalid/);
        expect(foo4).to.throw(Error, /Invalid/);
        expect(foo5).to.throw(Error, /Invalid/);
    });
});

describe("PageRank returns expected ranking", function() {
    it("should create a PageRank instance from the constructor", function () {
        const pageRank = new PageRank(adjacencyMatrix);
        pageRank.iterate();
        console.log(pageRank.result);
        expect(pageRank.result.pi[0]).to.almost.equal(0.38);
        expect(pageRank.result.pi[1]).to.almost.equal(0.39);
        expect(pageRank.result.pi[2]).to.almost.equal(0.21);
    });
});

describe("PageRank detectDangling", function() {
    it("should detect dangling nodes", function () {

        const adjacency = [
            [0, 1, 1],
            [0, 0, 0],
            [1, 0, 0]
        ]

        const dangling = PageRank.detectDangling(adjacency)
        expect(dangling).to.eql([0, 1, 0])
    });
});

describe("PageRank makeMatrixH", function() {
    it("should make expected hyperlink matrix", function () {

        const adjacency = [
            [0, 1, 1],
            [0, 0, 0],
            [1, 0, 0]
        ]

        const hyperlinkMatrix = PageRank.makeMatrixH(adjacency)
        expect(hyperlinkMatrix).to.eql([[0, 0.5, 0.5], [0, 0, 0], [1, 0, 0]])
    });
});

describe("PageRank mapped results", function() {
    it("should return expected results with mapped names", function () {

        const pageRank = new PageRank(adjacencyMatrix)
        const nameMap = {'A': 0, 'B': 1, 'C': 2}
        pageRank.iterate(nameMap)
        const expected = {A: 0.38, B: 0.39, C: 0.21}
        expect(pageRank.result.mappedResult).to.almost.eql(expected)
    });
});
