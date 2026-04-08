const User = require('../models/User');
const Project = require('../models/Project');

const getActorId = async (req) => {
    if (req.user && req.user.id) return req.user.id;
    const guest = await User.findOne().sort({ createdAt: 1 }).select('_id name skills avatar role contributions links bio');
    return guest ? guest : null;
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await getActorId(req);
        if (!user) return res.status(404).json({ msg: 'No user found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        // Find projects where user is creator or team member
        const activeProjects = await Project.find({
            $or: [
                { creator: req.params.id },
                { 'teamMembers.user': req.params.id }
            ]
        }).populate('creator', 'name').populate('teamMembers.user', 'name');
        
        res.json({
            user,
            activeProjects
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
        res.status(500).send('Server Error');
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { bio, skills, links, avatar } = req.body;
        
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (bio !== undefined) user.bio = bio;
        if (skills !== undefined) {
            // handle string or array of skills
            if (typeof skills === 'string') {
                user.skills = skills.split(',').map(s => s.trim()).filter(s => s);
            } else if (Array.isArray(skills)) {
                user.skills = skills;
            }
        }
        if (links !== undefined) user.links = { ...user.links, ...links };
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { skills: { $elemMatch: { $regex: q, $options: 'i' } } }
            ]
        }).select('name skills contributions role').limit(20);

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        const currentUser = await getActorId(req);
        // Find all other users
        let query = {};
        if (currentUser) query._id = { $ne: currentUser._id };
        const others = await User.find(query).select('_id name skills avatar bio role contributions');

        // Simple ML-like recommendation engine based on tf-idf style intersection
        let mySkills = currentUser ? currentUser.skills.map(s => s.toLowerCase().trim()) : [];
        let myBioWords = currentUser && currentUser.bio ? currentUser.bio.toLowerCase().split(/\s+/) : [];

        let scoredUsers = others.map(u => {
            let score = 0;
            // 1. Skill intersection weight (heavy)
            let userSkills = u.skills.map(s => s.toLowerCase().trim());
            let sharedSkills = userSkills.filter(s => mySkills.includes(s));
            score += sharedSkills.length * 20;

            // 2. Bio text intersection weight (medium)
            let bioWords = u.bio ? u.bio.toLowerCase().split(/\s+/) : [];
            let sharedWords = bioWords.filter(w => w.length > 3 && myBioWords.includes(w));
            score += sharedWords.length * 2;

            // 3. Contribution bonus (light)
            score += (u.contributions || 0) * 0.5;

            // 4. Random variation for serendipity (unique finds)
            score += Math.floor(Math.random() * 15);

            return { ...u.toObject(), matchScore: Math.min(100, Math.floor(score)) };
        });

        // Sort by highest score first
        scoredUsers.sort((a, b) => b.matchScore - a.matchScore);
        
        // Return top 10 recommended
        res.json(scoredUsers.slice(0, 10));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find().select('name skills contributions role').sort({ contributions: -1 }).limit(10);
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
