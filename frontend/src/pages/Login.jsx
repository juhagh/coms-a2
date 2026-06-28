import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      login(response.data);
      const role = response.data.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'kitchen') navigate('/kitchen/queue');
      else navigate('/staff/dashboard');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
      <div className="max-w-md mx-auto mt-20">
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
          <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
          <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mb-4 p-2 border rounded"
          />
          <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full mb-4 p-2 border rounded"
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Login
          </button>
          <p className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{' '}
            <span
                onClick={() => navigate('/register')}
                className="text-blue-600 cursor-pointer hover:underline">
            Register
          </span>
          </p>
        </form>
      </div>
  );
};

export default Login;