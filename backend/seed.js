const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Models
const User = require('./models/User');
const University = require('./models/University');
const Application = require('./models/Application');
const Document = require('./models/Document');
const Counsellor = require('./models/Counsellor');
const Invoice = require('./models/Invoice');
const Escalation = require('./models/Escalation');
const ConsentLog = require('./models/ConsentLog');
const VerificationCode = require('./models/VerificationCode');

function getLevel(courseName) {
  if (courseName.includes('MBA') || courseName.includes('PG') || courseName.includes('M.Tech')) return 'masters';
  if (courseName.includes('Ph.D')) return 'phd';
  return 'bachelors';
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      University.deleteMany({}),
      Application.deleteMany({}),
      Document.deleteMany({}),
      Counsellor.deleteMany({}),
      Invoice.deleteMany({}),
      Escalation.deleteMany({}),
      ConsentLog.deleteMany({}),
      VerificationCode.deleteMany({}),
    ]);
    console.log('🗑️  Cleared all collections');

    // ─── Create Users ─────────────────────────────────────────

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'MEC',
      email: 'admin@mec.com',
      password: 'password123',
      role: 'admin',
      phone: '9999999999',
      twoFactorEnabled: true,
    });

    console.log('👤 Created default admin user');

    // ─── Create Universities ─────────────────────────────────────────

    const collegeData = {
      'Sinhgad Institutes': { loc: 'Pune, Maharashtra', courses: ['Engineering', 'Management', 'Pharmacy', 'Computer Science', 'Polytechnic', 'Architecture', 'MCA', 'MBA'] },
      'Mahindra University': { loc: 'Hyderabad, Telangana', courses: ['Engineering', 'Management', 'Law', 'Digital Media', 'Design', 'Innovation Programs'] },
      'Karnavati University': { loc: 'Gandhinagar, Gujarat', courses: ['Design', 'Law', 'Management', 'Liberal Arts', 'Commerce', 'Computer Applications'] },
      'ICFAI University Jaipur': { loc: 'Jaipur, Rajasthan', courses: ['BBA', 'B.Com', 'BA', 'BCA', 'B.Tech', 'B.Sc', 'BA LLB', 'BBA LLB', 'LLB', 'B.Pharm', 'MBA', 'MCA', 'M.Tech', 'M.Sc', 'Ph.D'] },
      'Swarrnim Startup & Innovation': { loc: 'Gandhinagar, Gujarat', courses: ['Engineering', 'Management', 'Pharmacy', 'Agriculture', 'Design', 'Computer Science', 'Paramedical', 'Law'] },
      'Amity University': { loc: 'Noida, UP', courses: ['BBA', 'MBA', 'B.Tech', 'BCA', 'Law', 'Journalism', 'Psychology', 'Design'] },
      'Institute of Company Secretaries': { loc: 'New Delhi', courses: ['CS Executive Entrance Test', 'CS Executive Program', 'CS Professional Program'] },
      'Symbiosis Institute of Tech': { loc: 'Pune, Maharashtra', courses: ['B.Tech Computer Science', 'Artificial Intelligence', 'Machine Learning', 'Cloud Computing', 'Data Analytics'] },
      'ICFAI Foundation': { loc: 'Hyderabad, Telangana', courses: ['B.Tech', 'B.Arch', 'BBA', 'BCA', 'Law', 'MBA', 'MCA'] },
      'Jaipur National University': { loc: 'Jaipur, Rajasthan', courses: ['Arts', 'Commerce', 'Engineering', 'Management', 'Hotel Management', 'Nursing', 'Pharmacy', 'Media', 'Fine Arts'] },
      'Ramaiah University': { loc: 'Bengaluru, Karnataka', courses: ['Engineering', 'Dental', 'Pharmacy', 'Management', 'Design', 'Hospitality', 'Aviation'] },
      'Sri Balaji University': { loc: 'Pune, Maharashtra', courses: ['MBA', 'PGDM', 'Management', 'Marketing', 'HR', 'Finance', 'International Business'] },
      'Asia Pacific Institute': { loc: 'New Delhi', courses: ['MBA', 'BBA', 'PGDM', 'Business Analytics', 'Finance', 'Marketing'] },
      'Pandit Deendayal Energy Univ': { loc: 'Gandhinagar, Gujarat', courses: ['Liberal Studies', 'BA', 'B.Sc', 'MA', 'Public Policy', 'International Relations', 'Psychology'] },
      'Symbiosis International Dubai': { loc: 'Dubai, UAE', courses: ['Psychology', 'Counseling', 'Management', 'Business Administration'] },
      'Indus University': { loc: 'Ahmedabad, Gujarat', courses: ['Ph.D', 'Management', 'Science', 'English', 'Computer Applications', 'Engineering', 'Cyber Security'] },
      'SRM University': { loc: 'Chennai, Tamil Nadu', courses: ['BBA', 'B.Com', 'BA', 'BCA', 'B.Tech', 'B.Sc', 'Law', 'MBA', 'MCA', 'M.Tech', 'M.Sc', 'Diploma', 'Ph.D'] },
      'Sinhgad Management': { loc: 'Pune, Maharashtra', courses: ['MBA', 'PGDM', 'Management', 'HR', 'Marketing', 'Finance'] },
      'SKIPS University': { loc: 'Ahmedabad, Gujarat', courses: ['BBA', 'MBA', 'BCA', 'Commerce', 'IT', 'E-Gaming'] },
      'GLS University': { loc: 'Ahmedabad, Gujarat', courses: ['BBA', 'MBA', 'Law', 'Commerce', 'Design', 'Computer Applications', 'Media'] },
      'Alliance University': { loc: 'Bengaluru, Karnataka', courses: ['Engineering', 'Management', 'Law', 'Commerce', 'Liberal Arts'] },
      'Manipal Academy': { loc: 'Manipal, Karnataka', courses: ['Engineering', 'Medicine', 'Management', 'Design', 'Hotel Management', 'Media', 'Computer Applications'] },
      'Ahmedabad Institute of Mgmt': { loc: 'Ahmedabad, Gujarat', courses: ['MBA', 'PGDM', 'BBA', 'Business Management', 'Finance', 'Marketing'] },
      'SRM Institute of Science': { loc: 'Chennai, Tamil Nadu', courses: ['Artificial Intelligence', 'Data Science', 'Cyber Security', 'Computer Engineering', 'Biomedical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'B.Com', 'BBA'] }
    };

    const parsedUniversities = Object.entries(collegeData).map(([name, data], idx) => {
      const coursesMap = data.courses.map(courseName => ({
        name: courseName,
        level: getLevel(courseName),
        duration: getLevel(courseName) === 'masters' ? "2 Years" : "3-4 Years",
        intake: "Fall 2024",
        fee: "₹" + (Math.floor(Math.random() * 20) + 5) + ",00,000",
        matchScore: Math.floor(Math.random() * 25) + 75,
        requirements: ["High School / Bachelors", "Entrance Exam Based"]
      }));

      return {
        name,
        location: data.loc,
        about: "A premier institution known for excellence in education and holistic development.",
        ranking: idx + 10,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.split(' ')[0])}&background=random&color=fff&size=200`,
        courses: coursesMap
      };
    });

    const universities = await University.insertMany(parsedUniversities);
    console.log(`🎓 Created ${universities.length} Universities`);

    // ─── Create Master Invite Codes ──────────────────────────
    await VerificationCode.create({
      code: 'MEC-ADMIN-2024',
      type: 'admin_registration',
      createdBy: admin._id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });
    
    await VerificationCode.create({
      code: 'MEC-PARTNER-2024',
      type: 'university_partner',
      createdBy: admin._id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });

    console.log('🔑 Created Master Invite Codes: MEC-ADMIN-2024, MEC-PARTNER-2024');

    console.log('\n✅ Production Database initialized successfully!');
    console.log('\n📌 Important credentials:');
    console.log('   Admin:    admin@mec.com / password123 (2FA enabled)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
} else {
  console.log('Seed file imported. Run directly to seed database.');
}
