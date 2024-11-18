const mongoose = require('mongoose');
const { Schema } = mongoose;


const RoleSchema = new Schema({
    role: {
      type: String,
      enum: ['admin', 'project_manager', 'team_member'],
      required: true,
    },
    permissions: {
      type: Array,
      default: [],
    },
  });
  
  module.exports = mongoose.model('Role', RoleSchema);
  