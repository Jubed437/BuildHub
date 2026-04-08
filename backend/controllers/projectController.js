const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Helper: resolve the acting user (from auth middleware OR first DB user as guest)
const getActorId = async (req) => {
    if (req.user && req.user.id) return req.user.id;
    const guest = await User.findOne().sort({ createdAt: 1 }).select('_id');
    return guest ? guest._id.toString() : null;
};

exports.getProjects = async (req, res) => {
    try {
        const { skills, search } = req.query;
        let query = {};
        if (skills) query.requiredSkills = { $in: skills.split(',') };
        if (search) query.title = { $regex: search, $options: 'i' };
        const projects = await Project.find(query).populate('creator', 'name').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMyActiveProjects = async (req, res) => {
    try {
        const actorId = await getActorId(req);
        if (!actorId) return res.status(401).json({ msg: 'Unauthorized' });
        
        const projects = await Project.find({
            $or: [
                { creator: actorId },
                { 'teamMembers.user': actorId }
            ]
        }).select('_id title description creator teamMembers').populate('creator', 'name avatar').populate('teamMembers.user', 'name avatar');
        
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createProject = async (req, res) => {
    try {
        const { title, description, requiredSkills, teamSize, milestones } = req.body;
        const actorId = await getActorId(req);
        const newProject = new Project({
            title, description, requiredSkills, teamSize,
            creator: actorId,
            milestones: milestones || []
        });
        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('creator', 'name skills')
            .populate('teamMembers.user', 'name skills')
            .populate('applications.user', 'name skills');
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Project not found' });
        res.status(500).send('Server Error');
    }
};

exports.applyToProject = async (req, res) => {
    try {
        const actorId = await getActorId(req);
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        if (project.creator.toString() === actorId)
            return res.status(400).json({ msg: 'Creator cannot apply to their own project' });
        const alreadyApplied = project.applications.some(app => app.user.toString() === actorId);
        if (alreadyApplied) return res.status(400).json({ msg: 'Already applied' });

        project.applications.push({ user: actorId });
        await project.save();

        // Notify project creator
        const applicant = await User.findById(actorId).select('name');
        await Notification.create({
            recipient: project.creator,
            type: 'application_received',
            message: `${applicant?.name || 'Someone'} applied to join "${project.title}"`,
            project: project._id,
            sender: actorId
        });

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        const application = project.applications.find(app => app._id.toString() === req.params.appId);
        if (!application) return res.status(404).json({ msg: 'Application not found' });

        application.status = status;

        if (status === 'accepted') {
            const alreadyMember = project.teamMembers.some(m => m.user.toString() === application.user.toString());
            if (!alreadyMember && project.teamMembers.length < project.teamSize) {
                project.teamMembers.push({ user: application.user });
            }
        }
        await project.save();

        // Notify the applicant of the decision
        const notifType = status === 'accepted' ? 'application_accepted' : 'application_rejected';
        const notifMsg = status === 'accepted'
            ? `Your application to "${project.title}" was accepted! 🎉`
            : `Your application to "${project.title}" was not accepted this time.`;
        await Notification.create({
            recipient: application.user,
            type: notifType,
            message: notifMsg,
            project: project._id
        });

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getWorkspace = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('creator', 'name')
            .populate('teamMembers.user', 'name')
            .populate('applications.user', 'name skills');
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        const tasks = await Task.find({ project: project._id }).populate('assignedTo', 'name');
        res.json({ project, tasks });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, tag } = req.body;
        const actorId = await getActorId(req);
        const project = await Project.findById(req.params.id);

        const newTask = new Task({ title, tag, project: req.params.id, assignedTo: actorId });
        await newTask.save();
        await newTask.populate('assignedTo', 'name');

        // Notify all team members (except the creator of the task)
        if (project) {
            const recipients = [
                project.creator,
                ...project.teamMembers.map(m => m.user)
            ].filter(uid => uid.toString() !== actorId.toString());

            const uniqueRecipients = [...new Set(recipients.map(r => r.toString()))];
            const notifPromises = uniqueRecipients.map(uid =>
                Notification.create({
                    recipient: uid,
                    type: 'new_task',
                    message: `New task added to "${project.title}": ${title}`,
                    project: project._id
                })
            );
            await Promise.all(notifPromises);
        }

        res.json(newTask);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.taskId).populate('assignedTo', 'name');
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        
        // If task is completed and wasn't before
        if (status === 'done' && task.status !== 'done') {
            const project = await Project.findById(task.project);
            if (project) {
                // Award points to Global User Contributions
                if (task.assignedTo) {
                    await User.findByIdAndUpdate(task.assignedTo._id, { $inc: { contributions: 10 } });
                    
                    // Award points to specific Project Member Score
                    const memberIndex = project.teamMembers.findIndex(m => m.user.toString() === task.assignedTo._id.toString());
                    if (memberIndex !== -1) {
                        project.teamMembers[memberIndex].projectScore = (project.teamMembers[memberIndex].projectScore || 0) + 10;
                    } else if (project.creator.toString() === task.assignedTo._id.toString()) {
                        // If creator completes it, maybe update creator's score? 
                        // We can add the creator mathematically as a member in the frontend, but here let's just ignore if they aren't in teamMembers array
                    }
                    await project.save();
                }
            }
        }
        
        task.status = status;
        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.toggleMilestoneStatus = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        
        const milestone = project.milestones.id(req.params.milestoneId);
        if (!milestone) return res.status(404).json({ msg: 'Milestone not found' });
        
        milestone.status = milestone.status === 'completed' ? 'pending' : 'completed';
        
        // Award points if completed
        if (milestone.status === 'completed') {
            const actorId = await getActorId(req);
            await User.findByIdAndUpdate(actorId, { $inc: { contributions: 20 } });
            const memberIndex = project.teamMembers.findIndex(m => m.user.toString() === actorId.toString());
            if (memberIndex !== -1) project.teamMembers[memberIndex].projectScore = (project.teamMembers[memberIndex].projectScore || 0) + 20;
        }
        
        await project.save();
        res.json(project.milestones);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
