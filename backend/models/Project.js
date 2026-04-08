const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    teamSize: { type: Number, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
    applications: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        roleAppliedFor: { type: String }
    }],
    teamMembers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
        projectScore: { type: Number, default: 0 }
    }],
    milestones: [{
        title: { type: String },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
