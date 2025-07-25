const mongoose = require("mongoose");
require('dotenv').config();

// Import models
const User = require("../models/User");
const Announcement = require("../models/Announcement");
const LostFoundItem = require("../models/LostFoundItem");
const TimetableEntry = require("../models/TimetableEntry");
const Complaint = require("../models/Complaint");
const PeerTeacher = require("../models/PeerTeacher");
const ContactRequest = require("../models/ContactRequest");

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI);

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Announcement.deleteMany({});
    await LostFoundItem.deleteMany({});
    await TimetableEntry.deleteMany({});
    await Complaint.deleteMany({});
    await PeerTeacher.deleteMany({});
    await ContactRequest.deleteMany({});

    console.log("🗑️  Cleared existing data");

    // Create users
    const adminUser = new User({
      name: "Admin User",
      email: "admin@university.edu",
      password: "admin123",
      role: "admin",
    });

    const studentUser1 = new User({
      name: "John Doe",
      email: "john.doe@university.edu",
      password: "student123",
      role: "student",
    });

    const studentUser2 = new User({
      name: "Jane Smith",
      email: "jane.smith@university.edu",
      password: "student123",
      role: "student",
    });

    const studentUser3 = new User({
      name: "Alex Kumar",
      email: "alex.kumar@university.edu",
      password: "student123",
      role: "student",
    });

    await Promise.all([
      adminUser.save(),
      studentUser1.save(),
      studentUser2.save(),
      studentUser3.save(),
    ]);

    console.log("👥 Created users");

    // Create announcements
    const announcements = [
      {
        title: "Mid-term Examination Schedule Released",
        description:
          "The mid-term examination schedule for all departments has been released. Please check your respective department notice boards for detailed timings.",
        category: "Exams",
        channel: "exam-notifications",
        createdBy: adminUser._id,
        createdByName: adminUser.name,
        isPinned: true,
        priority: "high",
        views: 1247,
      },
      {
        title: "Annual Sports Meet 2024 - Registration Open!",
        description:
          "Join us for the Annual Sports Meet happening next month. Registration is now open for all events including athletics, basketball, football, cricket, and swimming.",
        category: "Sports",
        channel: "sports-activities",
        createdBy: adminUser._id,
        createdByName: adminUser.name,
        priority: "medium",
        views: 892,
      },
      {
        title: "Library Holiday Hours",
        description:
          "The library will have reduced hours during the upcoming holiday period. Please plan your study schedules accordingly.",
        category: "Holidays",
        channel: "library-updates",
        createdBy: adminUser._id,
        createdByName: adminUser.name,
        priority: "low",
        views: 456,
      },
    ];

    await Announcement.insertMany(announcements);
    console.log("📢 Created announcements");

    // Create lost & found items
    const lostFoundItems = [
      {
        title: "iPhone 13 Pro",
        description:
          "Black iPhone 13 Pro with a blue case. Found near the library entrance.",
        category: "Electronics",
        type: "found",
        location: "Library Entrance",
        reportedBy: studentUser1._id,
        reportedByName: studentUser1.name,
        contactEmail: studentUser1.email,
      },
      {
        title: "Red Backpack",
        description:
          "Lost a red Nike backpack containing textbooks and notebooks. Last seen in cafeteria.",
        category: "Accessories",
        type: "lost",
        location: "Cafeteria",
        reportedBy: studentUser2._id,
        reportedByName: studentUser2.name,
        contactEmail: studentUser2.email,
      },
      {
        title: "Calculus Textbook",
        description:
          "Advanced Calculus textbook, 3rd edition. Found in classroom B-204.",
        category: "Books",
        type: "found",
        location: "Classroom B-204",
        reportedBy: studentUser3._id,
        reportedByName: studentUser3.name,
        contactEmail: studentUser3.email,
      },
    ];

    await LostFoundItem.insertMany(lostFoundItems);
    console.log("🔍 Created lost & found items");

    // Create timetable entries
    const timetableEntries = [
      {
        userId: studentUser1._id,
        subject: "Advanced Mathematics",
        day: "Monday",
        startTime: "09:00",
        endTime: "10:30",
        location: "Room A-101",
        color: "bg-blue-100 border-blue-300 text-blue-800",
        type: "class",
      },
      {
        userId: studentUser1._id,
        subject: "Physics Lab",
        day: "Tuesday",
        startTime: "14:00",
        endTime: "16:00",
        location: "Physics Lab 1",
        color: "bg-green-100 border-green-300 text-green-800",
        type: "lab",
      },
      {
        userId: studentUser2._id,
        subject: "Computer Science",
        day: "Wednesday",
        startTime: "10:00",
        endTime: "11:30",
        location: "Computer Lab",
        color: "bg-purple-100 border-purple-300 text-purple-800",
        type: "class",
      },
    ];

    await TimetableEntry.insertMany(timetableEntries);
    console.log("📅 Created timetable entries");

    // Create complaints
    const complaints = [
      {
        title: "WiFi connectivity issues in Room 302",
        description:
          "Internet connection is very slow and frequently disconnects.",
        category: "Internet",
        status: "in-progress",
        priority: "high",
        submittedBy: studentUser1._id,
        submittedByName: studentUser1.name,
        contactInfo: { email: studentUser1.email },
      },
      {
        title: "Water leakage in bathroom",
        description: "There is a water leak in the common bathroom on floor 2.",
        category: "Water",
        status: "pending",
        priority: "medium",
        submittedBy: studentUser2._id,
        submittedByName: studentUser2.name,
        contactInfo: { email: studentUser2.email },
      },
    ];

    await Complaint.insertMany(complaints);
    console.log("📝 Created complaints");

    // Create peer teachers
    const peerTeacher1 = new PeerTeacher({
      name: "Alex Kumar",
      email: "alex.kumar@university.edu",
      phone: "+91 9876543210",
      linkedinUrl: "https://linkedin.com/in/alexkumar",
      skills: ["React", "JavaScript", "Node.js"],
      type: "peer",
      availability: [
        "Monday 14:00-17:00",
        "Wednesday 14:00-17:00",
        "Friday 14:00-17:00",
      ],
      bio: "Final year CS student with 2+ years of web development experience. Love teaching React and modern JavaScript!",
      rating: 4.8,
      totalSessions: 25,
      addedBy: studentUser3._id,
      isActive: true,
      isVerified: true,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
    });

    const peerTeacher2 = new PeerTeacher({
      name: "Priya Sharma",
      email: "priya.sharma@university.edu",
      skills: ["UI/UX Design", "Figma", "Adobe Creative Suite"],
      type: "senior",
      availability: [
        "Tuesday 9:00-12:00",
        "Thursday 14:00-17:00",
        "Saturday 10:00-13:00",
      ],
      linkedinUrl: "https://linkedin.com/in/priyasharma",
      bio: "Design graduate working at a top tech company. Passionate about helping students break into UX design.",
      rating: 4.9,
      totalSessions: 18,
      addedBy: adminUser._id,
      isActive: true,
      isVerified: true,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
    });

    await Promise.all([peerTeacher1.save(), peerTeacher2.save()]);
    console.log("👨‍🏫 Created peer teachers");

    // Create contact requests
    const contactRequests = [
      {
        teacherId: peerTeacher1._id,
        teacherName: peerTeacher1.name,
        requesterName: studentUser1.name,
        requesterEmail: studentUser1.email,
        requesterId: studentUser1._id,
        skill: "React",
        message:
          "Hi! I would like to learn React basics and build my first project. Can you help me get started?",
        preferredTime: "Monday 14:00-17:00",
        status: "pending",
      },
      {
        teacherId: peerTeacher2._id,
        teacherName: peerTeacher2.name,
        requesterName: studentUser2.name,
        requesterEmail: studentUser2.email,
        requesterId: studentUser2._id,
        skill: "UI/UX Design",
        message:
          "I am interested in learning UI/UX design principles and would love to get guidance on portfolio building.",
        preferredTime: "Flexible",
        status: "accepted",
        responseMessage:
          "Sure! I would be happy to help you with UI/UX design. Let me know your availability.",
        respondedAt: new Date(),
      },
    ];

    await ContactRequest.insertMany(contactRequests);
    console.log("📞 Created contact requests");

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`📢 Announcements: ${await Announcement.countDocuments()}`);
    console.log(
      `🔍 Lost & Found Items: ${await LostFoundItem.countDocuments()}`
    );
    console.log(
      `📅 Timetable Entries: ${await TimetableEntry.countDocuments()}`
    );
    console.log(`📝 Complaints: ${await Complaint.countDocuments()}`);
    console.log(`👨‍🏫 Peer Teachers: ${await PeerTeacher.countDocuments()}`);
    console.log(
      `📞 Contact Requests: ${await ContactRequest.countDocuments()}`
    );

    console.log("\n🔑 Test Credentials:");
    console.log("Admin: admin@university.edu / admin123");
    console.log("Student: john.doe@university.edu / student123");
    console.log("Student: jane.smith@university.edu / student123");
    console.log("Student: alex.kumar@university.edu / student123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedDatabase();