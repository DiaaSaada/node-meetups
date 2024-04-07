const mongoose = require('mongoose')


module.exports.connection = async dsn => mongoose.connect(dsn, {});