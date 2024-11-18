const mongoose = require('mongoose');
const { Schema } = mongoose;



const ProjectSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      deadline: {
        type: Date,
        required: true,
      },
      tasks: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Task',
        },
      ],
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started',
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Project', ProjectSchema);
  