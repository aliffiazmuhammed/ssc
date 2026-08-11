import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { AuthGate } from './components/layout/AuthGate';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/layout/AdminLayout';
import AdminUpload from './pages/AdminUpload';
import AdminUsers from './pages/AdminUsers';
import History from './pages/History';
import SessionReview from './pages/SessionReview';
import Analytics from './pages/Analytics';

import { QuizProvider } from './store/QuizContext';
import { ThemeProvider } from './store/ThemeContext';
import StudentHome from './pages/StudentHome';
import QuizSession from './pages/QuizSession';
import MathPractice from './pages/MathPractice';
import CustomPractice from './pages/CustomPractice';
import Bookmarks from './pages/Bookmarks';
import QuestionBank from './pages/QuestionBank';

import VocabHome from './pages/VocabHome';
import VocabBrowser from './pages/VocabBrowser';
import VocabQuiz from './pages/VocabQuiz';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route element={<AuthGate requiredRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminUpload />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
            </Route>

            {/* Student Routes */}
            <Route element={<AuthGate requiredRole="student" />}>
              <Route path="/math-practice" element={<MathPractice />} />
              <Route element={<QuizProvider><Outlet /></QuizProvider>}>
                <Route path="/" element={<StudentHome />} />
                <Route path="/custom-practice" element={<CustomPractice />} />
                <Route path="/quiz" element={<QuizSession />} />
                <Route path="/history" element={<History />} />
                <Route path="/history/:id" element={<SessionReview />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/question-bank" element={<QuestionBank />} />
                <Route path="/vocab" element={<VocabHome />} />
                <Route path="/vocab/:vocabType" element={<VocabBrowser />} />
                <Route path="/vocab/:vocabType/quiz" element={<VocabQuiz />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
