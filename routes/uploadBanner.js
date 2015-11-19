var TemplateBanner = require('./../models').TemplateBanner;
var uploadBanner = require('../repositories/uploadBanner');
var multer = require('multer')

function views_path(action) {
  return "dashboard/" + action;
}

function find_all_banners(params, callback) {
  TemplateBanner.findAll()
  .then(function (result) {
    var json = map_json(result);
    params['banners'] = json;
    callback(params);
  })
  .catch(function (err) {
    console.log("some error", err);
  });
}

function upload_fields() {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/banners')
    },
    filename: function (req, file, cb) {
      var re = /(?:\.([^.]+))?$/;
      var extension = '.' + re.exec(file.originalname)[1];
      file.originalname = file.fieldname + extension;
      cb(null, file.fieldname + '_temp' + extension);
    }
  })
  var upload = multer({ storage: storage, limits: { fieldSize: 5*1024*1024} })

  return upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'sessions', maxCount: 1 },
    { name: 'resources', maxCount: 1 }
  ]);
}

function map_json(array) {
  var json = {};
  for(var index in array) {
    var entry = array[index];
    json[entry.dataValues.page] = entry.dataValues.filepath;
  };

  return json;
}

function simple_params(user, error, message) {
  return { title: 'Upload banner', user: user, error: error, message: message, banners: {} };
}

exports.get = function(req, res) {
  var params = simple_params(req.user, {}, '');
  find_all_banners(params, function (updated_params) {
    res.render(views_path('uploadBanner'), updated_params);
  });
};

exports.post = function(req, res) {
  uploadBanner.write(req, function(error, message) {
    var params = simple_params(req.user, error || {}, message);
    find_all_banners(params, function (updated_params) {
      res.render(views_path('uploadBanner'), updated_params);
    });
  });
};

exports.upload_fields = upload_fields();
