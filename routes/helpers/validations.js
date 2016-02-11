module.exports = {
  params: params,
  body: body
};

function params(res, value, message) {
  if (!value) { res.send({ error: message }); return }
}

function body(res, value, message, type) {
  if (!value) { res.send({ error: message }); return }
}
