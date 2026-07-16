const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkAnswers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ssc-practice');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Find questions where answer is 'option1', 'option2', etc.
    const questions = await db.collection('questions').find({
      answer: { $regex: /^option[1-4]$/i }
    }).toArray();

    console.log(`Found ${questions.length} questions where 'answer' is 'optionX'`);
    if (questions.length > 0) {
      console.log('Example question:', JSON.stringify(questions[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkAnswers();
