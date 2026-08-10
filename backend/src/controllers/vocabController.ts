import { Response } from 'express';
import mongoose from 'mongoose';
import VocabWord from '../models/VocabWord';
import VocabProgress from '../models/VocabProgress';
import VocabQuizSession from '../models/VocabQuizSession';
import VocabBookmark from '../models/VocabBookmark';
import { AuthRequest } from '../middlewares/authMiddleware';

export const uploadVocab = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vocabType } = req.body;
    
    if (!['ows', 'synonyms-antonyms', 'idioms-phrases'].includes(vocabType)) {
      res.status(400).json({ status: 'error', message: 'Invalid vocabType' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No file uploaded' });
      return;
    }

    const fileBuffer = req.file.buffer.toString('utf-8');
    let parsedData: any[];
    try {
      parsedData = JSON.parse(fileBuffer);
    } catch (err) {
      res.status(400).json({ status: 'error', message: 'Invalid JSON file format' });
      return;
    }

    if (!Array.isArray(parsedData)) {
      res.status(400).json({ status: 'error', message: 'JSON file must contain an array of items' });
      return;
    }

    const wordsToInsert = [];
    
    for (const item of parsedData) {
      const isTop200 = item.isTop200 || false;
      let word, meaning, exampleSentence, synonyms, antonyms;

      if (vocabType === 'ows') {
        word = item.word;
        meaning = item.meaning;
        exampleSentence = item.exampleSentence;
      } else if (vocabType === 'synonyms-antonyms') {
        word = item.word;
        meaning = item.meaning;
        synonyms = item.synonyms;
        antonyms = item.antonyms;
      } else if (vocabType === 'idioms-phrases') {
        word = item.idiom;
        meaning = item.meaning;
        exampleSentence = item.exampleSentence;
      }

      if (!word || !meaning) continue;

      wordsToInsert.push({
        vocabType,
        word,
        meaning,
        isTop200,
        exampleSentence,
        synonyms,
        antonyms,
        uploadedBy: req.user?._id
      });
    }

    const uniqueWords = [];
    const seenWords = new Set();
    for (const w of wordsToInsert) {
      const key = w.word.toLowerCase();
      if (!seenWords.has(key)) {
        seenWords.add(key);
        uniqueWords.push(w);
      }
    }

    const existingWords = await VocabWord.find({
      vocabType,
      word: { $in: uniqueWords.map(w => w.word) }
    }).select('word').lean();
    
    const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));

    const newWordsToInsert = uniqueWords.filter(w => !existingWordSet.has(w.word.toLowerCase()));

    if (newWordsToInsert.length > 0) {
      await VocabWord.insertMany(newWordsToInsert);
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalInFile: parsedData.length,
        inserted: newWordsToInsert.length,
        skippedDuplicates: parsedData.length - newWordsToInsert.length
      }
    });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error during upload' });
  }
};

export const getWords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vocabType = req.query.vocabType as string;
    const tier = req.query.tier as string;
    const search = req.query.search as string;
    const letter = req.query.letter as string;
    const studied = req.query.studied as string;
    const page = (req.query.page as string) || '1';
    const limit = (req.query.limit as string) || '50';
    const sort = req.query.sort as string;

    if (!vocabType) {
      res.status(400).json({ status: 'error', message: 'vocabType is required' });
      return;
    }

    const query: any = { vocabType };

    if (tier === 'top200') {
      query.isTop200 = true;
    }

    if (search) {
      query.word = { $regex: search, $options: 'i' };
    } else if (letter) {
      query.word = { $regex: `^${letter}`, $options: 'i' };
    }

    // Handle studied filter by getting user's studied words
    let studiedWordIds: mongoose.Types.ObjectId[] = [];
    if (req.user) {
      const progress = await VocabProgress.find({ userId: req.user._id, isStudied: true }).select('wordId').lean();
      studiedWordIds = progress.map(p => p.wordId);
    }

    if (studied === 'studied') {
      query._id = { $in: studiedWordIds };
    } else if (studied === 'unstudied') {
      query._id = { $nin: studiedWordIds };
    }

    let sortOption: any = {};
    if (sort === 'az') sortOption.word = 1;
    else if (sort === 'za') sortOption.word = -1;
    else if (sort === 'recent') sortOption.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [words, totalCount, totalForType] = await Promise.all([
      VocabWord.find(query).sort(sortOption).skip(skip).limit(Number(limit)).lean(),
      VocabWord.countDocuments(query),
      VocabWord.countDocuments({ vocabType } as any)
    ]);

    // Attach isStudied
    const wordsWithStudied = words.map(word => ({
      ...word,
      isStudied: studiedWordIds.some(id => id.toString() === word._id.toString())
    }));

    const studiedCount = await VocabProgress.countDocuments({ 
      userId: req.user?._id, 
      isStudied: true, 
      wordId: { $in: await VocabWord.find({ vocabType } as any).distinct('_id') } 
    });

    res.status(200).json({
      status: 'success',
      data: {
        words: wordsWithStudied,
        pagination: {
          total: totalCount,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalCount / Number(limit))
        },
        stats: {
          total: totalForType,
          studied: studiedCount,
          percentage: totalForType > 0 ? Math.round((studiedCount / totalForType) * 100) : 0
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const getWordById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wordId = req.params.id as string;
    const word = await VocabWord.findById(wordId).lean();
    if (!word) {
      res.status(404).json({ status: 'error', message: 'Word not found' });
      return;
    }

    let isStudied = false;
    if (req.user) {
      const progress = await VocabProgress.findOne({ userId: req.user._id, wordId: word._id }).lean();
      isStudied = !!progress?.isStudied;
    }

    res.status(200).json({
      status: 'success',
      data: { ...word, isStudied }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const toggleStudy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wordId = new mongoose.Types.ObjectId(req.params.id as string);
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const word = await VocabWord.findById(wordId);
    if (!word) {
      res.status(404).json({ status: 'error', message: 'Word not found' });
      return;
    }

    let progress = await VocabProgress.findOne({ userId, wordId });

    if (progress) {
      progress.isStudied = !progress.isStudied;
      progress.studiedAt = new Date();
      await progress.save();
    } else {
      progress = await VocabProgress.create({
        userId,
        wordId,
        isStudied: true
      });
    }

    res.status(200).json({
      status: 'success',
      data: { isStudied: progress.isStudied }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const types = ['ows', 'synonyms-antonyms', 'idioms-phrases'];
    
    const progressData = [];

    for (const type of types) {
      const typeWordIds = await VocabWord.find({ vocabType: type } as any).distinct('_id');
      const totalWords = typeWordIds.length;
      
      const studiedCount = await VocabProgress.countDocuments({
        userId,
        wordId: { $in: typeWordIds },
        isStudied: true
      });

      progressData.push({
        vocabType: type,
        total: totalWords,
        studied: studiedCount,
        percentage: totalWords > 0 ? Math.round((studiedCount / totalWords) * 100) : 0
      });
    }

    res.status(200).json({
      status: 'success',
      data: progressData
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

// Deterministic random based on seed
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function shuffleArray(array: any[], seed: number) {
  let m = array.length, t, i;
  let currentSeed = seed;
  while (m) {
    i = Math.floor(seededRandom(currentSeed++) * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

export const getDailyWords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const str = dateStr + userId.toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    const seed = Math.abs(hash);

    const types = ['ows', 'synonyms-antonyms', 'idioms-phrases'];
    const result: any = {};

    for (const type of types) {
      const allWords = await VocabWord.find({ vocabType: type } as any).lean();
      const progress = await VocabProgress.find({ userId, isStudied: true }).lean();
      const studiedIds = new Set(progress.map(p => p.wordId.toString()));

      let unstudied = allWords.filter(w => !studiedIds.has(w._id.toString()));
      let studied = allWords.filter(w => studiedIds.has(w._id.toString()));

      unstudied = shuffleArray(unstudied, seed);
      
      let daily = unstudied.slice(0, 5);
      if (daily.length < 5) {
        studied = shuffleArray(studied, seed + 1);
        daily = [...daily, ...studied.slice(0, 5 - daily.length)];
      }

      const key = type === 'synonyms-antonyms' ? 'synonymsAntonyms' : type === 'idioms-phrases' ? 'idiomsAndPhrases' : type;
      result[key] = daily.map(w => ({ ...w, isStudied: studiedIds.has(w._id.toString()) }));
    }

    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const generateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const vocabType = req.body.vocabType as string;
    const count = Number(req.body.count || 10);
    const source = req.body.source as string || 'all';

    if (!vocabType) {
      res.status(400).json({ status: 'error', message: 'vocabType is required' });
      return;
    }

    let query: any = { vocabType };

    if (source === 'top200') {
      query.isTop200 = true;
    } else if (source === 'studied') {
      const progress = await VocabProgress.find({ userId, isStudied: true }).select('wordId').lean();
      const studiedWordIds = progress.map(p => p.wordId);
      query._id = { $in: studiedWordIds };
    } else if (source === 'unstudied') {
      const progress = await VocabProgress.find({ userId, isStudied: true }).select('wordId').lean();
      const studiedWordIds = progress.map(p => p.wordId);
      query._id = { $nin: studiedWordIds };
    }

    const words = await VocabWord.aggregate([
      { $match: query },
      { $sample: { size: count } }
    ]);

    if (words.length === 0) {
      res.status(400).json({ status: 'error', message: 'Not enough words to generate quiz' });
      return;
    }

    const allTypeWords = await VocabWord.find({ vocabType } as any).lean();

    const questions = words.map((word, index) => {
      let questionText = '';
      let correctAnswer = '';
      let distractors: string[] = [];

      if (vocabType === 'ows') {
        questionText = word.meaning;
        correctAnswer = word.word;
        distractors = allTypeWords.filter(w => w._id.toString() !== word._id.toString()).map(w => w.word);
      } else if (vocabType === 'synonyms-antonyms') {
        const isSynonym = Math.random() > 0.5;
        const hasSynonyms = word.synonyms && word.synonyms.length > 0;
        const hasAntonyms = word.antonyms && word.antonyms.length > 0;

        if (isSynonym && hasSynonyms || (!hasAntonyms && hasSynonyms)) {
          questionText = `Synonym of ${word.word}?`;
          correctAnswer = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
        } else if (hasAntonyms) {
          questionText = `Antonym of ${word.word}?`;
          correctAnswer = word.antonyms[Math.floor(Math.random() * word.antonyms.length)];
        } else {
           questionText = `Meaning of ${word.word}?`;
           correctAnswer = word.meaning;
        }

        distractors = allTypeWords.filter(w => w._id.toString() !== word._id.toString()).map(w => w.word); // Fallback distractors
      } else if (vocabType === 'idioms-phrases') {
        questionText = word.word;
        correctAnswer = word.meaning;
        distractors = allTypeWords.filter(w => w._id.toString() !== word._id.toString()).map(w => w.meaning);
      }

      // Shuffle distractors and pick 3
      distractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

      return {
        wordId: word._id,
        question: questionText,
        options,
        correctAnswer,
      };
    });

    res.status(200).json({
      status: 'success',
      data: questions
    });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { vocabType, answers } = req.body;

    if (!vocabType || !answers || !Array.isArray(answers)) {
      res.status(400).json({ status: 'error', message: 'Invalid payload' });
      return;
    }

    let correctCount = 0;
    let incorrectCount = 0;

    const processedAnswers = answers.map((ans: any) => {
      const isCorrect = ans.selectedOption === ans.correctAnswer;
      if (isCorrect) correctCount++;
      else incorrectCount++;

      return {
        wordId: ans.wordId,
        selectedOption: ans.selectedOption,
        correctAnswer: ans.correctAnswer,
        isCorrect
      };
    });

    const session = await VocabQuizSession.create({
      userId,
      vocabType,
      totalQuestions: answers.length,
      correctCount,
      incorrectCount,
      score: correctCount,
      answers: processedAnswers,
    });

    res.status(201).json({
      status: 'success',
      data: session
    });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const getQuizHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = '1', limit = '10' } = req.query;
    
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [history, totalCount] = await Promise.all([
      VocabQuizSession.find({ userId }).sort({ completedAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      VocabQuizSession.countDocuments({ userId })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        history,
        pagination: {
          total: totalCount,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const toggleVocabBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id: wordId } = req.params;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const existing = await VocabBookmark.findOne({ userId, wordId });

    if (existing) {
      await VocabBookmark.deleteOne({ _id: existing._id });
      res.status(200).json({ status: 'success', data: { isBookmarked: false } });
    } else {
      await VocabBookmark.create({ userId, wordId });
      res.status(200).json({ status: 'success', data: { isBookmarked: true } });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const getVocabBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const bookmarks = await VocabBookmark.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('wordId')
      .lean();

    const totalCount = await VocabBookmark.countDocuments({ userId });

    const words = bookmarks.map(b => ({
      ...((b.wordId as any) || {}),
      isBookmarked: true,
      bookmarkedAt: b.createdAt
    })).filter(w => w._id);

    res.status(200).json({
      status: 'success',
      data: {
        words,
        pagination: {
          total: totalCount,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

export const getVocabBookmarkIds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const bookmarks = await VocabBookmark.find({ userId }).select('wordId').lean();
    const bookmarkedIds = bookmarks.map(b => b.wordId.toString());

    res.status(200).json({
      status: 'success',
      data: { bookmarkedIds }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};
