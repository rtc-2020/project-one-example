function all(req, res, next) {
  res.sendFile('abc.old.json', {root: './var/'});
}

function latest(req, res, next) {
  res.sendFile('abc.latest.json', {root: './var/'});
}

module.exports = {
  all,
  latest
}
