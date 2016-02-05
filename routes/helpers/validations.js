function params(res, value, message) {
  if (!value) { res.send({ error: message }); return }
}
module.exports = {
  params: params
}
