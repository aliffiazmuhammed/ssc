import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { AuthGate } from './components/layout/AuthGate';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminUpload from './pages/AdminUpload';
import History from './pages/History';
import SessionReview from './pages/SessionReview';
import Analytics from './pages/Analytics';

import { QuizProvider } from './store/QuizContext';
import StudentHome from './pages/StudentHome';
import QuizSession from './pages/QuizSession';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route element={<AuthGate requiredRole="admin" />}>
            <Route path="/admin" element={<AdminUpload />} />
          </Route>

          {/* Student Routes */}
          <Route element={<AuthGate requiredRole="student" />}>
            <Route element={<QuizProvider><Outlet /></QuizProvider>}>
              <Route path="/" element={<StudentHome />} />
              <Route path="/quiz" element={<QuizSession />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:id" element={<SessionReview />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
