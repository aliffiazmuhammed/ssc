const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixAnswers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ssc-practice');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const questionsCollection = db.collection('questions');
    
    // Find questions where answer is 'option1', 'option2', etc.
    const questions = await questionsCollection.find({
      answer: { $regex: /^option[1-4]$/i }
    }).toArray();

    console.log(`Found ${questions.length} questions to fix.`);

    let updatedCount = 0;
    for (const q of questions) {
      // The answer field holds something like 'option3'
      const optionKey = q.answer.toLowerCase();
      
      // Get the actual text of that option (e.g., q['option3'])
      const actualAnswerText = q[optionKey];
      
      if (actualAnswerText) {
        await questionsCollection.updateOne(
          { _id: q._id },
          { $set: { answer: actualAnswerText } }
        );
        updatedCount++;
      } else {
        console.warn(`Warning: optionKey '${optionKey}' not found for question ID ${q._id}`);
      }
    }

    console.log(`Successfully updated ${updatedCount} questions.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixAnswers();
