import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Features from './pages/Features';
import WorkspaceEditor from './pages/WorkspaceEditor';
import Navbar from './components/Navbar';
import Background3D from './components/Background3D';
import './App.css';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = !!localStorage.getItem('collabryx_token');
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = !!localStorage.getItem('collabryx_token');
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-transparent relative">
        <Background3D />
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          <Navbar />
          <div className="flex-1 flex flex-col min-h-0">
            <Routes>
              <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
              <Route path="/features" element={<Features />} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/workspace/:id" element={<ProtectedRoute><WorkspaceEditor /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
