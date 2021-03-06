![test workflow](https://github.com/leo-pfeiffer/pagerank.js/actions/workflows/tests.yml/badge.svg)

# PageRank implementation in JavaScript

JavaScript implementation of the PageRank Algorithm that was originally invented by Sergej Brin and Larry Page,
the founders of Google, and built the original basis for their world famous search engine.

This implementation uses the power method to determine the rankings.


## Usage

Install via npm:

`npm install js-pagerank`

Require and use the package:

```javascript
const PageRank = require('js-pagerank');

const adjacencyMatrix = [
    [0, 1, 1],
    [1, 0, 0],
    [0, 1, 0]
]

const pr = new PageRank(adjacencyMatrix)
pr.iterate()

// log the result
console.log(pr.result)
```

```
{
  iterations: 8,
  converged: true,
  pi: [ 0.38686228375569653, 0.3963085691243489, 0.21682914711995438 ],
  mappedResult: null
}
```

## Background

You can read more about PageRank in the original paper by Brin and Page,

>Brin, S., Page, L., 1998. The Anatomy of a Large-Scale Hypertextual Web Search Engine. The Seventh International World Wide Web Conference, 14.-18. April 1998, S. 107-117

or the brilliant and extensive book by Langville and Meyer,

> Langville, Amy N., and Carl D. Meyer. Google's PageRank and Beyond: The Science of Search Engine Rankings. Princeton University Press, 2006.
