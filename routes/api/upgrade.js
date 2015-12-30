function upgradePost(req, res, next) {
  res.send(req.body);
}

module.exports = {
    upgradePost: upgradePost
};
