const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_collab';

const names = [
    "Aadhya", "Aditya", "Aishwarya", "Anand", "Ananya", 
    "Aravind", "Bhavya", "Chaitanya", "Deepthi", "Divya", 
    "Ganesh", "Karthik", "Kavya", "Keerthi", "Krishna", 
    "Lakshmi", "Madhav", "Manoj", "Nandini", "Naveen"
];

const domains = [
    "Machine Learning", "Sociology", "Data Visualization", "Mechanical Design", 
    "Behavioral Economics", "Cybersecurity", "Public Policy", "Blockchain", 
    "Renewable Energy", "Bio-Ethics", "UI/UX Strategy", "Quantum Computing", 
    "Aerospace", "Philosophy", "Structural Engineering", "Robotics", 
    "Molecular Biology", "Urban Planning"
];

const projectsData = [
    {
        title: "EcoConnect Campus", 
        description: "Building a zero-waste logistics network for campus cafeterias using blockchain tracking.", 
        requiredSkills: ["Blockchain", "UI/UX Strategy", "Renewable Energy"],
        teamSize: 5
    },
    {
        title: "CityFlow AI", 
        description: "Smart traffic management sensors for the downtown university district redevelopment.", 
        requiredSkills: ["Machine Learning", "Urban Planning", "Structural Engineering"],
        teamSize: 4
    },
    {
        title: "Neuro-Tech Empathy Hub", 
        description: "Developing a VR environment to simulate cognitive disabilities for empathy training.", 
        requiredSkills: ["Machine Learning", "Philosophy", "UI/UX Strategy", "Behavioral Economics"],
        teamSize: 6
    },
    {
        title: "Quantum Policy Simulator", 
        description: "Simulating the economic impact of quantum cryptography on local municipal data.", 
        requiredSkills: ["Quantum Computing", "Public Policy", "Cybersecurity"],
        teamSize: 3
    },
    {
        title: "Bio-Materials Synthesizer", 
        description: "Creating biodegradable replacement parts for university lab equipment.", 
        requiredSkills: ["Molecular Biology", "Mechanical Design", "Renewable Energy"],
        teamSize: 5
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing mock data if necessary or just append (we'll assume starting fresh isn't strictly necessary, but better to clear carefully or just insert these 20)
        // We will just insert new data to avoid deleting what might belong to the user
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const createdUsers = [];

        // Determine a varied amount of contributions points between 1000 and 15000
        for (let i = 0; i < 20; i++) {
            // Pick 2 random skills
            const skill1 = domains[Math.floor(Math.random() * domains.length)];
            let skill2 = domains[Math.floor(Math.random() * domains.length)];
            while (skill1 === skill2) {
                skill2 = domains[Math.floor(Math.random() * domains.length)];
            }

            const points = Math.floor(Math.random() * 14000) + 1000;

            const user = new User({
                name: names[i] + ' ' + ["Rao", "Iyer", "Nair", "Reddy", "Menon", "Krishnan", "Kumar", "Raju"][Math.floor(Math.random() * 8)],
                email: `${names[i].toLowerCase()}${i}@campus.edu`,
                password: hashedPassword,
                skills: [skill1, skill2],
                role: 'student',
                contributions: points
            });
            await user.save();
            createdUsers.push(user);
        }
        console.log('20 Users created successfully.');

        // Distribute projects among the first 5 users as creators
        for (let j = 0; j < 5; j++) {
            const proj = new Project({
                ...projectsData[j],
                creator: createdUsers[j]._id,
                status: 'open',
                teamMembers: [
                    { user: createdUsers[j]._id, role: 'Creator' }
                ]
            });
            
            // Add some team members to make it alive
            for(let k = 5; k < 8; k++) {
                if (Math.random() > 0.3) {
                    proj.teamMembers.push({ user: createdUsers[j + k]._id, role: 'Member' });
                }
            }

            await proj.save();
        }
        console.log('5 Projects created successfully.');

        console.log('Database seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};

seedDB();
