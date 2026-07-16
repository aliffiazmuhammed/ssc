const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ssc-practice');
    console.log('Connected to MongoDB');

    const sessions = await mongoose.connection.db.collection('quizsessions').find({}).toArray();
    console.log('Total QuizSessions:', sessions.length);
    console.log('Sessions:', JSON.stringify(sessions, null, 2));

    const attempts = await mongoose.connection.db.collection('questionattempts').find({}).toArray();
    console.log('Total QuestionAttempts:', attempts.length);
    console.log('Attempts:', JSON.stringify(attempts, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkData();
