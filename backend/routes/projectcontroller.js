const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const user=require('../models/User')
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const {logError}=require("../middleware/logger");


// Create a new project
router.post('/create_project', fetchuser, async (req, res) => {
  try {
    const { name, description, members, deadline } = req.body;
    const createdBy = req.user.id;

    

    const userdata = await user.findById(req.user.id);    
    
    if (!userdata) {
      return res
        .status(400)
        .json({ error: "Invalid Credentials, user doesn't exist" });
    }

    if (userdata.role !== 'admin') {
      return res.status(403).json({ error: "You are not authorized to create projects." });
    }

    const project = new Project({ name, description, members:members||[], deadline, createdBy });
    const savedProject = await project.save();

    res.status(201).json(savedProject);
  } catch (error) {
    logerror("Error in creating new project", error);
    res.status(500).json({ error: error.message });
  }
});

// Update an existing project
router.post('/update_project', fetchuser, async (req, res) => {
  try {
    const { id, name, description, members, deadline, status, tasks } = req.body;

    // Check if the project exists and is owned by the user
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this project" });
    }

    // Remove all existing tasks related to this project
    await Task.deleteMany({ project: id });

    // Insert the new tasks and get their IDs
    const newTasks = tasks.map((task) => ({
      ...task,
      project: id,
      createdBy: req.user.id,
    }));
    const insertedTasks = await Task.insertMany(newTasks);
    const taskIds = insertedTasks.map((task) => task._id);

    // Update the project fields and associate the new tasks
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { name, description, members, deadline, status, tasks: taskIds },
      { new: true }
    );

    res.status(200).json({ project: updatedProject, tasks: insertedTasks });
  } catch (error) {
    logError("Error in updating project");
    res.status(500).json({ error: error.message });
  }
});


// Get all projects created by the authenticated user
// router.get('/get_projects', fetchuser, async (req, res) => {
//   try {
//     const projects = await Project.find({ createdBy: req.user.id }).populate('members').populate('tasks');
//     res.status(200).json(projects);
//   } catch (error) {
//     logerror("Error in getting all projects", error);
//     res.status(500).json({ error: error.message });
//   }
// });

router.get('/get_projects', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch projects created by the user
    const createdProjects = await Project.find({ createdBy: userId }).populate('members').populate('tasks')
              // Populate all fields of tasks
    // Fetch tasks assigned to the user
    const tasks = await Task.find({ assignedTo: userId }).select('project');

    // Extract unique project IDs from tasks
    const projectIdsFromTasks = [...new Set(tasks.map(task => task.project.toString()))];

    // Fetch projects that have tasks assigned to the user
    const assignedProjects = await Project.find({ _id: { $in: projectIdsFromTasks } }).populate('members').populate('tasks')
                // Populate all fields of tasks

    // Merge and remove duplicate projects (if any)
    const allProjects = [...createdProjects, ...assignedProjects];
    const uniqueProjects = allProjects.filter(
      (project, index, self) => index === self.findIndex(p => p.id === project.id)
    );

    // Return the projects
    res.status(200).json({ success: true, data: uniqueProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a project
router.post('/delete_project', fetchuser, async (req, res) => {
  try {
    const { id } = req.body;

    // Find the project by ID
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Ensure the authenticated user is the owner
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this project" });
    }

    // Delete all associated tasks
    await Task.deleteMany({ project: id });

    // Delete the project
    await Project.findByIdAndDelete(id);

    res.status(200).json({ message: "Project and associated tasks deleted successfully" });
  } catch (error) {
    logError("Error in deleting project", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
