import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to our App!</h1>
      <div className="auth-links">
        <Link to="/login" className="btn">Login</Link>
        <Link to="/signup" className="btn">Sign Up</Link>
      </div>
    </div>
  );
}

export default Home;