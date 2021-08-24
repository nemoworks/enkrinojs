const _ = require("lodash");
const successors = (graph, id) => {
  let result = new Set();
  graph.edges.forEach((element) => {
    if (element.from === id) {
      result.add(element.to);
    }
  });
  return Array.from(result);
};

const reachableNodes = (graph, id) => {
  let adj = {};
  graph.edges.forEach((element) => {
    if (!adj[element.from]) {
      adj[element.from] = [];
    }
    adj[element.from].push(element.to);
  });
  if (!adj[id]) {
    return [];
  }
  let queue = [id];
  let visited = new Set();
  visited.add(id);
  let res = new Set();
  while (queue.length > 0) {
    v = queue.pop();
    if (!adj[v]) {
      continue;
    }
    adj[v].forEach((element) => {
      if (!visited.has(element)) {
        visited.add(element);
        queue.push(element);
        res.add(element);
      }
    });
  }
  return Array.from(res);
};

const fromString = (strlist) => {
  let graph = {
    nodes: [],
    edges: [],
  };
  let adj = {};
  strlist.forEach((str) => {
    [from, to] = str.split("->");
    if (!adj[from]) {
      adj[from] = [];
      graph.nodes.push({
        id: from,
        name: `node-${from}`,
      });
    }
    if (!adj[to]) {
      adj[to] = [];
      graph.nodes.push({
        id: to,
        name: `node-${to}`,
      });
    }
    graph.edges.push({
      from: from,
      to: to,
    });
  });
  return graph;
};

module.exports = {
  /**
    @param graph {nodes:[],edges[]}
    @param id String
     */
  start: (enkrino) => {
    let newenkrino = {
      ...enkrino,
      status: "running",
      current: enkrino.start,
      graph: {
        ...enkrino.graph,
        edges: enkrino.graph.edges.filter((e) => e.spec.temporary === false),
      },
      mirror: {
        nodes: enkrino.graph.nodes,
        edges: [],
      },
    };
    return newenkrino;
  },

  next: (enkrino, nid) => {
    let sus = successors(enkrino.graph, enkrino.current);
    let newenkrino = {};
    if (sus.includes(nid)) {
      //forward
      let eset = enkrino.mirror.edges;
      eset.push({
        from: nid,
        to: enkrino.current,
      });
      newenkrino = {
        ...enkrino,
        current: nid,
        mirror: {
          ...enkrino.mirror,
          edges: _.uniqWith(eset, (A, B) => A.from === B.from && A.to === B.to),
        },
      };
    } else if (enkrino.current === nid) {
      return enkrino;
    } else {
      let eset = enkrino.graph.edges;
      eset.push({
        from: nid,
        to: enkrino.current,
        spec: {
          temporary: true,
        },
      });
      newenkrino = {
        ...enkrino,
        current: nid,
        graph: {
          ...enkrino.graph,
          edges: _.uniqWith(
            eset,
            (A, B) =>
              A.from === B.from &&
              A.to === B.to &&
              A.spec.temporary === B.spec.temporary
          ),
        },
      };
    }
    return newenkrino;
  },
  nexts: (enkrino) => {
    let current = enkrino.current ? enkrino.current : enkrino.start;
    let forwards = successors(enkrino.graph, current);
    let backwards = [];
    switch (enkrino.graph.nodes.find((e) => e.id === current).backward) {
      case 0:
        break;
      case 1:
        backwards = successors(enkrino.mirror, current);
        break;
      default:
        backwards = reachableNodes(enkrino.mirror, current);
    }
    return {
      forwards: forwards,
      backwards: backwards,
    };
  },
  finish: (enkrino) => {
    let newenkrino = {
      ...enkrino,
      status: "finished",
    };
    return newenkrino;
  },
};
