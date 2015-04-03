var getDataset = require('./get.js').construct

exports.rest = function(app, controller) {
  app.route('/dataset')
    .get(getDataset(controller))
}
