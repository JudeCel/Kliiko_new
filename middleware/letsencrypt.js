"use strict";
module.exports = function(req, res, next) {
  if (req.url.toString().includes("/.well-known/acme-challenge")) {
    res.send(process.env.LETSENCRYPT);
  }else {
    next();
  }
}
