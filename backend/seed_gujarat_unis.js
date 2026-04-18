const mongoose = require('mongoose');
const University = require('./models/University');

const universities = [
  {
    name: 'IIT Gandhinagar',
    location: 'Gandhinagar, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/IIT_Gandhinagar_Logo.svg/240px-IIT_Gandhinagar_Logo.svg.png',
    courses: [
      { name: 'B.Tech in Computer Science', fee: '₹2.5L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in Electrical Engineering', fee: '₹2.5L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Nirma University',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Nirma_University_Logo.svg/240px-Nirma_University_Logo.svg.png',
    courses: [
      { name: 'B.Tech (CSE)', fee: '₹2.2L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech (IT)', fee: '₹2.2L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'DA-IICT',
    location: 'Gandhinagar, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/DA-IICT_Logo.svg/240px-DA-IICT_Logo.svg.png',
    courses: [
      { name: 'B.Tech (ICT)', fee: '₹2.0L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech (ICT with Hons. in CS)', fee: '₹2.0L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Pandit Deendayal Energy University (PDEU)',
    location: 'Gandhinagar, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/0/0e/Pandit_Deendayal_Petroleum_University_Logo.png',
    courses: [
      { name: 'B.Tech in Petroleum Engineering', fee: '₹2.4L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in Computer Engineering', fee: '₹2.4L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Dharmsinh Desai University (DDU)',
    location: 'Nadiad, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/DDU_Logo.png/220px-DDU_Logo.png',
    courses: [
      { name: 'B.Tech in Computer Engineering', fee: '₹1.6L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in IT', fee: '₹1.6L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Charotar University of Science and Technology (CHARUSAT)',
    location: 'Changa, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/CHARUSAT_logo.png/220px-CHARUSAT_logo.png',
    courses: [
      { name: 'B.Tech in CSE', fee: '₹1.4L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in IT', fee: '₹1.4L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'MS University of Baroda',
    location: 'Vadodara, India',
    country: 'India',
    logo: 'https://ui-avatars.com/api/?name=MSU&background=random&color=fff&size=200',
    courses: [
      { name: 'B.E. in Computer Science & Engineering', fee: '₹0.5L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' },
      { name: 'B.E. in Electrical Engineering', fee: '₹0.5L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Marwadi University',
    location: 'Rajkot, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Marwadi_University_logo.png/220px-Marwadi_University_logo.png',
    courses: [
      { name: 'B.Tech in CSE', fee: '₹1.8L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Ganpat University',
    location: 'Mehsana, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Ganpat_University_Logo.png/220px-Ganpat_University_Logo.png',
    courses: [
      { name: 'B.Tech in Computer Engineering', fee: '₹1.3L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Ahmedabad University',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Ahmedabad_University_Logo.svg/1200px-Ahmedabad_University_Logo.svg.png',
    courses: [
      { name: 'B.Tech in Computer Science', fee: '₹3.5L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Parul University',
    location: 'Vadodara, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/75/Parul_University_Logo.png/220px-Parul_University_Logo.png',
    courses: [
      { name: 'B.Tech in CSE', fee: '₹1.1L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Silver Oak University',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Silver_Oak_University_logo.png/220px-Silver_Oak_University_logo.png',
    courses: [
      { name: 'B.Tech in IT', fee: '₹0.8L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Indus University',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Indus_University_Logo.png/220px-Indus_University_Logo.png',
    courses: [
      { name: 'B.Tech in Computer Engineering', fee: '₹1.0L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'L.D. College of Engineering',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/LDCE_Logo.png/220px-LDCE_Logo.png',
    courses: [
      { name: 'B.E. in Computer Science', fee: '₹1,500/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Vishwakarma Government Engineering College (VGEC)',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/VGEC_Logo.png/220px-VGEC_Logo.png',
    courses: [
      { name: 'B.E. in Information Technology', fee: '₹1,500/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mec_uafms');
    console.log('Connected to MongoDB');
    
    // Clear existing unis to avoid duplicates (since name is unique)
    // await University.deleteMany({});
    
    for (const uniData of universities) {
      const existing = await University.findOne({ name: uniData.name });
      if (!existing) {
        await University.create(uniData);
        console.log(`Created: ${uniData.name}`);
      } else {
        console.log(`Skipped (exists): ${uniData.name}`);
      }
    }
    
    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
