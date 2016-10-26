'use strict';

module.exports = {
  render: render
};

function render(req, res, next) {
  if (req.query.icsdata) {
    res.setHeader('Content-disposition', 'attachment; filename=event.ics');
    res.setHeader('Content-Type', 'text/calendar');
    let content = new Buffer(req.query.icsdata, 'base64').toString('ascii');
    res.send(content);
    res.end();
  } else {
    res.send("Invalid request");
  }

}
