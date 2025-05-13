import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('email');
    const id = localStorage.getItem('userid');

    if (token && email && id) {
      setUser({ token, email,id });
    }
  }, []);

  const login = (token, user) => {
    var email = user.email;
    var id = user.id;
    localStorage.setItem('authToken', token);
    localStorage.setItem('email', email);
    localStorage.setItem('userid', id);
    setUser({ token, email,id });
    console.log('User logged in:', { token, email });
    navigate('/browse ');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
    localStorage.removeItem('userid');

    setUser(null);
    // navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
// 