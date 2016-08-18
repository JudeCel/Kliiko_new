"use strict";
module.exports = function(req, res, next) {
  if (req.url.toString().includes("/.well-known/acme-challenge")) {
    res.send("u1k0RRUoGZw_MWzISIaMQC8ga6TRCDEjG4RNtTsQeLg.OSqph6KpmkAF_8iylHsAxTwTg6l841nm7r6cspPsEb8");
  }else {
    next();
  }
}
