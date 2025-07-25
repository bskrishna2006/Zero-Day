/**
 * Skill Exchange Module Seeder
 */
const mongoose = require('mongoose');
const User = require('../models/User');
const PeerTeacher = require('../models/PeerTeacher');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Sample skills by category
const skills = {
  programming: [
    'JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 
    'React', 'Node.js', 'Angular', 'Vue.js', 'Django', 
    'Spring Boot', 'Express.js', 'MongoDB', 'SQL'
  ],
  design: [
    'UI/UX Design', 'Figma', 'Adobe Photoshop', 'Illustrator',
    'Web Design', 'Graphic Design', 'Motion Graphics',
    'Wireframing', 'Prototyping'
  ],
  languages: [
    'English', 'Spanish', 'French', 'German', 'Chinese',
    'Japanese', 'Korean', 'Russian', 'Arabic', 'Portuguese',
    'Italian'
  ],
  academics: [
    'Calculus', 'Statistics', 'Physics', 'Chemistry', 'Biology',
    'Linear Algebra', 'Discrete Mathematics', 'Organic Chemistry',
    'Quantum Mechanics', 'Data Structures', 'Algorithms'
  ],
  business: [
    'Marketing', 'Finance', 'Accounting', 'Business Strategy',
    'Project Management', 'Public Speaking', 'Entrepreneurship',
    'Digital Marketing', 'SEO', 'Business Analytics'
  ],
  music: [
    'Piano', 'Guitar', 'Violin', 'Drums', 'Singing',
    'Music Theory', 'Music Production', 'Composition',
    'Flute', 'Saxophone', 'Bass Guitar'
  ],
  arts: [
    'Painting', 'Drawing', 'Sculpture', 'Photography', 
    'Digital Art', 'Animation', '3D Modeling', 'Pottery',
    'Calligraphy', 'Film Making', 'Video Editing'
  ]
};

// Sample availability slots
const availabilitySlots = [
  'Monday 9:00-11:00', 'Monday 14:00-16:00', 'Monday 18:00-20:00',
  'Tuesday 9:00-11:00', 'Tuesday 14:00-16:00', 'Tuesday 18:00-20:00',
  'Wednesday 9:00-11:00', 'Wednesday 14:00-16:00', 'Wednesday 18:00-20:00',
  'Thursday 9:00-11:00', 'Thursday 14:00-16:00', 'Thursday 18:00-20:00',
  'Friday 9:00-11:00', 'Friday 14:00-16:00', 'Friday 18:00-20:00',
  'Saturday 10:00-12:00', 'Saturday 14:00-16:00',
  'Sunday 10:00-12:00', 'Sunday 14:00-16:00'
];

// Sample teacher profiles
const teacherProfiles = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '123-456-7890',
    linkedinUrl: 'https://linkedin.com/in/alexjohnson',
    type: 'peer',
    bio: 'Computer Science senior with experience in web development and machine learning. Love to teach programming concepts in an interactive way.',
    skillsCategory: 'programming'
  },
  {
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    phone: '234-567-8901',
    linkedinUrl: 'https://linkedin.com/in/mariarodriguez',
    type: 'senior',
    bio: 'UX/UI designer with 3+ years of industry experience. Passionate about teaching design principles and usability.',
    skillsCategory: 'design'
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '345-678-9012',
    linkedinUrl: 'https://linkedin.com/in/davidkim',
    type: 'peer',
    bio: 'Multilingual student fluent in Korean, English, and Spanish. Enjoy teaching languages through conversation and cultural immersion.',
    skillsCategory: 'languages'
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '456-789-0123',
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    type: 'peer',
    bio: 'Physics major with experience tutoring in STEM subjects. Specialize in breaking down complex concepts with clear explanations.',
    skillsCategory: 'academics'
  },
  {
    name: 'Michael Patel',
    email: 'michael.patel@example.com',
    phone: '567-890-1234',
    linkedinUrl: 'https://linkedin.com/in/michaelpatel',
    type: 'senior',
    bio: 'Business major with internship experience at major consulting firms. Can help with case studies, finance, and presentation skills.',
    skillsCategory: 'business'
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    phone: '678-901-2345',
    linkedinUrl: 'https://linkedin.com/in/emmawilson',
    type: 'peer',
    bio: 'Music performance major with 10+ years of piano experience. Love teaching music theory and piano to beginners and intermediate students.',
    skillsCategory: 'music'
  },
  {
    name: 'James Turner',
    email: 'james.turner@example.com',
    phone: '789-012-3456',
    linkedinUrl: 'https://linkedin.com/in/jamesturner',
    type: 'peer',
    bio: 'Fine arts student specializing in digital art and traditional painting. Enjoy teaching techniques for various mediums.',
    skillsCategory: 'arts'
  }
];

// Function to randomly select n items from an array
const getRandomItems = (array, n) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    
    // Delete existing peer teachers
    await PeerTeacher.deleteMany({});
    console.log('Cleared existing peer teachers');
    
    // Create peer teachers
    for (const profile of teacherProfiles) {
      // Get 3-5 random skills from the appropriate category
      const profileSkills = getRandomItems(
        skills[profile.skillsCategory], 
        Math.floor(Math.random() * 3) + 3
      );
      
      // Get 2-4 random availability slots
      const profileAvailability = getRandomItems(
        availabilitySlots, 
        Math.floor(Math.random() * 3) + 2
      );
      
      // Create teacher
      const teacher = new PeerTeacher({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        linkedinUrl: profile.linkedinUrl,
        skills: profileSkills,
        type: profile.type,
        availability: profileAvailability,
        bio: profile.bio,
        addedBy: admin._id,
        isVerified: true,
        verifiedBy: admin._id,
        verifiedAt: new Date(),
        rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
        totalRatings: Math.floor(Math.random() * 20) + 1 // Random number of ratings
      });
      
      await teacher.save();
      console.log(`Created teacher: ${profile.name}`);
    }
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
