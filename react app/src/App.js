import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import AddBlog from './pages/addblog';
import ViewBlog from './pages/Viewblog';
import AuthorProfile from './pages/author';
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />

          
          <Route element={<ProtectedRoute />}>
            <Route path="/add" element={<AddBlog />} />
            <Route path="/browse" element={<ViewBlog />} />
            <Route path="/authors/:authorId" element={<AuthorProfile />} />

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
