import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, Copy, Info } from 'lucide-react';
import api from '../services/api';

const SUBJECTS = [
  'Quantitative Aptitude',
  'Reasoning',
  'English',
  'General Awareness',
];

const sampleQuestionJson = `[
  {
    "question": "What is the capital of France?",
    "option1": "London",
    "option2": "Paris",
    "option3": "Berlin",
    "option4": "Madrid",
    "answer": "option2",
    "topic": "Geography",
    "sub topic": "Capitals",
    "examYearAndType": "SSC CGL 2023"
  }
]`;

const sampleOwsJson = `[
  {
    "word": "Agnostic",
    "meaning": "One who is not sure about God's existence",
    "exampleSentence": "He is an agnostic.",
    "isTop200": true
  }
]`;

const sampleSynonymsJson = `[
  {
    "word": "Abundant",
    "meaning": "Present in great quantity",
    "synonyms": ["plentiful", "copious", "ample"],
    "antonyms": ["scarce", "sparse"],
    "isTop200": true
  }
]`;

const sampleIdiomsJson = `[
  {
    "idiom": "A blessing in disguise",
    "meaning": "A good thing that seemed bad at first",
    "exampleSentence": "Losing that job turned out to be a blessing in disguise.",
    "isTop200": false
  }
]`;

const AdminUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [stats, setStats] = useState<{ total: number; inserted: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vocab upload state
  const [vocabFile, setVocabFile] = useState<File | null>(null);
  const [vocabType, setVocabType] = useState<string>('ows');
  const [vocabStatus, setVocabStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [vocabMessage, setVocabMessage] = useState<string>('');
  const [vocabStats, setVocabStats] = useState<{ total: number; inserted: number; skipped: number } | null>(null);
  const vocabFileInputRef = useRef<HTMLInputElement>(null);

  const [copiedText, setCopiedText] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
      setStats(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus('error');
      setMessage('Please select a JSON file to upload.');
      return;
    }

    setStatus('uploading');
    setMessage('');
    setStats(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);

    try {
      const response = await api.post('/questions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setStatus('success');
      setStats({
        total: response.data.data.totalInFile,
        inserted: response.data.data.inserted,
        skipped: response.data.data.skippedDuplicates,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to upload questions.');
    }
  };

  const handleVocabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVocabFile(e.target.files[0]);
      setVocabStatus('idle');
      setVocabMessage('');
      setVocabStats(null);
    }
  };

  const handleVocabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabFile) {
      setVocabStatus('error');
      setVocabMessage('Please select a JSON file to upload.');
      return;
    }

    setVocabStatus('uploading');
    setVocabMessage('');
    setVocabStats(null);

    const formData = new FormData();
    formData.append('file', vocabFile);
    formData.append('vocabType', vocabType);

    try {
      const response = await api.post('/vocab/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setVocabStatus('success');
      setVocabStats({
        total: response.data.data.totalInFile,
        inserted: response.data.data.inserted,
        skipped: response.data.data.skippedDuplicates,
      });
      setVocabFile(null);
      if (vocabFileInputRef.current) vocabFileInputRef.current.value = '';
    } catch (error: any) {
      setVocabStatus('error');
      setVocabMessage(error.response?.data?.message || 'Failed to upload vocabulary.');
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-500 to-blue-600 p-8 sm:p-10 shadow-lg shadow-cyan-500/20">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Data Upload Center
            </h1>
            <p className="text-white/90 font-medium">
              Upload JSON files to populate the database with questions and vocabulary.
            </p>
          </div>
        </div>
        
        {/* JSON Templates Section */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-[2rem] shadow-sm border border-divider-light dark:border-divider-dark p-8">
          <h2 className="text-xl font-semibold text-primary-light dark:text-primary-dark mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-cyan-500" />
            Sample JSON Formats
          </h2>
          <p className="text-sm text-secondary-light dark:text-secondary-dark mb-6">
            Ensure your JSON files follow these exact structures before uploading. The system expects a JSON array of objects.
          </p>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-primary-light dark:text-primary-dark">Questions Format</h3>
                <button onClick={() => handleCopy(sampleQuestionJson, 'questions')} className="text-xs font-bold flex items-center gap-1 text-cyan-500 hover:text-cyan-600 bg-cyan-500/10 px-2 py-1 rounded transition-colors">
                  {copiedText === 'questions' ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy JSON</>}
                </button>
              </div>
              <pre className="text-xs bg-base-light dark:bg-base-dark p-4 rounded-xl overflow-x-auto border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark font-mono">
                {sampleQuestionJson}
              </pre>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-primary-light dark:text-primary-dark">One Word Subs</h3>
                  <button onClick={() => handleCopy(sampleOwsJson, 'ows')} className="text-xs font-bold flex items-center gap-1 text-cyan-500 hover:text-cyan-600 bg-cyan-500/10 px-2 py-1 rounded transition-colors">
                    {copiedText === 'ows' ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
                <pre className="text-xs bg-base-light dark:bg-base-dark p-4 rounded-xl overflow-x-auto border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark font-mono">
                  {sampleOwsJson}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-primary-light dark:text-primary-dark">Synonyms & Antonyms</h3>
                  <button onClick={() => handleCopy(sampleSynonymsJson, 'synonyms')} className="text-xs font-bold flex items-center gap-1 text-cyan-500 hover:text-cyan-600 bg-cyan-500/10 px-2 py-1 rounded transition-colors">
                    {copiedText === 'synonyms' ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
                <pre className="text-xs bg-base-light dark:bg-base-dark p-4 rounded-xl overflow-x-auto border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark font-mono">
                  {sampleSynonymsJson}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-primary-light dark:text-primary-dark">Idioms & Phrases</h3>
                  <button onClick={() => handleCopy(sampleIdiomsJson, 'idioms')} className="text-xs font-bold flex items-center gap-1 text-cyan-500 hover:text-cyan-600 bg-cyan-500/10 px-2 py-1 rounded transition-colors">
                    {copiedText === 'idioms' ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
                <pre className="text-xs bg-base-light dark:bg-base-dark p-4 rounded-xl overflow-x-auto border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark font-mono">
                  {sampleIdiomsJson}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Question Upload Section */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-[2rem] shadow-sm border border-divider-light dark:border-divider-dark p-8">
          <h2 className="text-xl font-semibold text-primary-light dark:text-primary-dark mb-6">Upload Questions</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-2">
                Select Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-divider-light dark:border-divider-dark bg-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow text-primary-light dark:text-primary-dark font-medium"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub} className="bg-surface-light dark:bg-surface-dark">
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-2">
                JSON File
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  file ? 'border-cyan-500 bg-cyan-500/5' : 'border-divider-light dark:border-divider-dark hover:border-cyan-500/50'
                }`}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className={`h-10 w-10 ${file ? 'text-cyan-500' : 'text-secondary-light dark:text-secondary-dark'}`} />
                  <span className="text-primary-light dark:text-primary-dark font-medium">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-sm text-secondary-light dark:text-secondary-dark">
                    Only .json files are supported
                  </span>
                </label>
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-center space-x-2 bg-error-tint text-error p-4 rounded-xl">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {status === 'success' && stats && (
              <div className="bg-success-tint text-success-DEFAULT p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium text-sm">Upload Successful!</p>
                </div>
                <div className="pl-7 text-sm space-y-1">
                  <p>Total questions in file: <strong>{stats.total}</strong></p>
                  <p>Successfully inserted: <strong>{stats.inserted}</strong></p>
                  <p>Skipped duplicates: <strong>{stats.skipped}</strong></p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'uploading' || !file}
              className="w-full flex justify-center py-3 px-4 rounded-2xl text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all font-bold text-lg disabled:opacity-70 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {status === 'uploading' ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                'Upload Questions'
              )}
            </button>
          </form>
        </div>

          {/* Vocabulary Upload Section */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-[2rem] shadow-sm border border-divider-light dark:border-divider-dark p-8">
          <h2 className="text-xl font-semibold text-primary-light dark:text-primary-dark mb-6">Upload Vocabulary</h2>
          
          <form onSubmit={handleVocabSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-2">
                Select Vocab Type
              </label>
              <select
                value={vocabType}
                onChange={(e) => setVocabType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-divider-light dark:border-divider-dark bg-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow text-primary-light dark:text-primary-dark font-medium"
              >
                <option value="ows" className="bg-surface-light dark:bg-surface-dark">One Word Substitutions</option>
                <option value="synonyms-antonyms" className="bg-surface-light dark:bg-surface-dark">Synonyms & Antonyms</option>
                <option value="idioms-phrases" className="bg-surface-light dark:bg-surface-dark">Idioms & Phrases</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-2">
                JSON File
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  vocabFile ? 'border-cyan-500 bg-cyan-500/5' : 'border-divider-light dark:border-divider-dark hover:border-cyan-500/50'
                }`}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleVocabFileChange}
                  ref={vocabFileInputRef}
                  className="hidden"
                  id="vocab-file-upload"
                />
                <label
                  htmlFor="vocab-file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className={`h-10 w-10 ${vocabFile ? 'text-cyan-500' : 'text-secondary-light dark:text-secondary-dark'}`} />
                  <span className="text-primary-light dark:text-primary-dark font-medium">
                    {vocabFile ? vocabFile.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-sm text-secondary-light dark:text-secondary-dark">
                    Only .json files are supported
                  </span>
                </label>
              </div>
            </div>

            {vocabStatus === 'error' && (
              <div className="flex items-center space-x-2 bg-error-tint text-error p-4 rounded-xl">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{vocabMessage}</p>
              </div>
            )}

            {vocabStatus === 'success' && vocabStats && (
              <div className="bg-success-tint text-success-DEFAULT p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium text-sm">Upload Successful!</p>
                </div>
                <div className="pl-7 text-sm space-y-1">
                  <p>Total words in file: <strong>{vocabStats.total}</strong></p>
                  <p>Successfully inserted: <strong>{vocabStats.inserted}</strong></p>
                  <p>Skipped duplicates: <strong>{vocabStats.skipped}</strong></p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={vocabStatus === 'uploading' || !vocabFile}
              className="w-full flex justify-center py-3 px-4 rounded-2xl text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all font-bold text-lg disabled:opacity-70 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {vocabStatus === 'uploading' ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                'Upload Vocabulary'
              )}
            </button>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;
