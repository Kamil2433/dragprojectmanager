const mongoose = require('mongoose');
const { Schema } = mongoose;


const TaskSchema = new Schema(
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['todo', 'in_progress', 'done'],
        default: 'todo',
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      deadline: {
        type: Date,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Task', TaskSchema);
  