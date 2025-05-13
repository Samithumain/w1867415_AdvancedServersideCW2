import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import { Login, Logout } from './pages/login';
import Signup from './pages/signup';
import AddBlog from './pages/addblog';
import ViewBlog from './pages/Viewblog';
import AuthorProfile from './pages/author';
import "./App.css";
import "./responsive.css";

import { Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
    
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-logo">CW2Blog</h1>
          <ul className="nav-links">
            {user ? (
              <>
                <li><Link to="/add">Add Blog</Link></li>
                <li><Link to="/browse">Browse</Link></li>
                <li>
                  <Logout />
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Sign up</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Logout />} />
        <Route path="/login" element={user ? <Navigate to="/browse" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/browse" /> : <Signup />} />
<Route path="/" element={user ? <Navigate to="/browse" /> : <Navigate to="/login" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/add" element={<AddBlog />} />
          <Route path="/browse" element={<ViewBlog />} />
          <Route path="/authors/:authorId/:username" element={<AuthorProfile />} />
        </Route>
        <Route path="*" element={user ? <Navigate to="/browse" /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
