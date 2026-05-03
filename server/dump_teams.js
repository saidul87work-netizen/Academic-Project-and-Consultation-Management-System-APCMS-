import mongoose from 'mongoose';
import Team from './models/Team.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apcms';

async function dumpTeams() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const teams = await Team.find({});
    console.log(`Found ${teams.length} teams:`);

    teams.forEach(t => {
      console.log(`Team: ${t.teamName} (${t._id})`);
      console.log(`  ProjectID: ${t.projectId}`);
      console.log(`  Feedback Count: ${t.supervisorFeedback.length}`);
      t.supervisorFeedback.forEach((f, i) => {
        console.log(`    ${i+1}. [${f.stage}] ${f.supervisorName}: ${f.message.substring(0, 30)}...`);
      });
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

dumpTeams();
