const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const {logError}=require("../middleware/logger");


/**
 * Create a new task
 * Endpoint: /create_task
 */
router.post('/create_task', fetchuser, async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, deadline } = req.body;

      // Check if the project exists and was created by the user
      const projectData = await Project.findById(project);
      if (!projectData) {
        return res.status(404).json({ error: "Project not found." });
      }

       
      if (!projectData.createdBy.equals(req.user.id)) {
        return res.status(403).json({ error: "Not authorized to create tasks for this project." });
      }

    const task = new Task({
      title,
      description,
      project,
      assignedTo:assignedTo||req.user.id,
      priority,
      deadline,
      createdBy: req.user.id, // fetched from middleware
    });

    const savedTask = await task.save();

   

    

    // Add the task ID to the associated project
    await Project.findByIdAndUpdate(project, { $push: { tasks: savedTask._id } });

    res.status(201).json(savedTask);
  } catch (error) {
    logError("Error creating task", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update an existing task
 * Endpoint: /update_task
 */
router.post('/update_task', fetchuser, async (req, res) => {
  try {
    const { id, title, description, project, assignedTo, status, priority, deadline } = req.body;

    // Find the task by ID and ensure it's created by the logged-in user
    const task = await Task.findOne({ _id: id, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, project, assignedTo, status, priority, deadline },
      { new: true }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    logError("Error updating task", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all tasks of the logged-in user
 * Endpoint: /get_tasks
 */
router.get('/get_tasks', fetchuser, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id })
      .populate('project', 'name') // Populate project with its name
      .populate('assignedTo', 'name email') // Populate assignedTo with name and email
      .populate('createdBy', 'name email'); // Populate createdBy with name and email

    res.status(200).json(tasks);
  } catch (error) {
    logError("Error fetching task", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a task
 * Endpoint: /delete_task
 */
router.post('/delete_task', fetchuser, async (req, res) => {
  try {
    const { id } = req.body;

    // Find the task by ID and ensure it's created by the logged-in user
    const task = await Task.findOne({ _id: id, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Remove the task ID from the associated project
    await Project.findByIdAndUpdate(task.project, { $pull: { tasks: id } });

    // Delete the task
    await Task.findByIdAndDelete(id);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    logError("Error deleting task", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
