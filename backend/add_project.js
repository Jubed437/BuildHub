const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');

async function addMockProject() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/campus_collab');
    console.log('Connected to DB');

    const primaryUser = await User.findOne().sort({ createdAt: 1 });
    if (!primaryUser) {
      console.log('No user found to assign project to.');
      process.exit(1);
    }

    const newProject = new Project({
      title: "Decentralized Credential Verifier",
      description: "A blockchain-based system to securely issue, verify, and store academic credentials for the university.",
      requiredSkills: ["Solidity", "Next.js", "Cryptography"],
      teamSize: 4,
      creator: primaryUser._id,
      status: "in-progress",
      teamMembers: [
        { user: primaryUser._id, role: "Lead Engineer", projectScore: 40 }
      ],
      milestones: [
        { title: "Smart Contract Architecture", status: "completed" },
        { title: "Testnet Deployment", status: "pending" },
        { title: "Frontend Dashboard Integration", status: "pending" }
      ]
    });

    await newProject.save();

    // Give them some teammates
    const otherUsers = await User.find({ _id: { $ne: primaryUser._id } }).limit(2);
    if (otherUsers.length > 0) {
        newProject.teamMembers.push({ user: otherUsers[0]._id, role: "Frontend Dev", projectScore: 10 });
        if(otherUsers[1]) newProject.teamMembers.push({ user: otherUsers[1]._id, role: "Smart Contract QA", projectScore: 0 });
        await newProject.save();
    }

    // Add some mock tasks
    const Task = require('./models/Task');
    await Task.insertMany([
      { title: "Configure Hardhat environment", status: "done", project: newProject._id, assignedTo: primaryUser._id, tag: "DevOps" },
      { title: "Write ERC-721 implementation", status: "in-progress", project: newProject._id, assignedTo: primaryUser._id, tag: "Web3" },
      { title: "Design Figma landing page", status: "todo", project: newProject._id, assignedTo: otherUsers[0]?._id, tag: "Design" }
    ]);

    console.log('Successfully injected the second workspace project!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addMockProject();
