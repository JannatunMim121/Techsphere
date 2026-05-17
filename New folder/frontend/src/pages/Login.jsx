import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { login, clearError } from '../redux/slices/authSlice';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth || {});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#fff',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '48px 40px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          textAlign: 'center',
        }}>
          {/* Logo */}
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #7c4dff 0%, #651fff 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              color: '#fff',
              fontSize: '32px',
              fontWeight: '500',
              fontFamily: 'Roboto, sans-serif',
            }}>T</span>
          </div>

          <h1 style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '24px',
            fontWeight: 400,
            color: '#202124',
            marginBottom: '8px',
          }}>
            Sign in
          </h1>

          <p style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px',
            color: '#5f6368',
            marginBottom: '32px',
          }}>
            Use your TeachSphere account
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontFamily: 'Roboto, sans-serif',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#7c4dff'}
                onBlur={(e) => e.target.style.borderColor = '#dadce0'}
              />
            </div>

            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontFamily: 'Roboto, sans-serif',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#7c4dff'}
                onBlur={(e) => e.target.style.borderColor = '#dadce0'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                color: '#5f6368',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  style={{ marginRight: '8px' }}
                />
                Show password
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link
                to="/register"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '14px',
                  color: '#7c4dff',
                  textDecoration: 'none',
                }}
              >
                Create account
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>

        <div style={{
          marginTop: '24px',
          fontFamily: 'Roboto, sans-serif',
          fontSize: '12px',
          color: '#5f6368',
          textAlign: 'center',
        }}>
          <span>TeachSphere - Routine Management System</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;