import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';
import { API_URL } from '../../services/api';
interface SignupFormProps {
  onSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNo: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.phoneNo && formData.phoneNo.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userData = {
        name: formData.username,
        username: formData.username,
        email: formData.email,
        phoneNo: formData.phoneNo,
        password: formData.password,
        role: 'user',
        status: 'Active'
      };

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.user) {
        signup(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Welcome ' + data.user.name + '! Your account is ready.');
        onSuccess();
      } else if (data._id) {
        signup(data);
        localStorage.setItem('user', JSON.stringify(data));
        alert('Welcome ' + data.name + '! Your account is ready.');
        onSuccess();
      }

    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to the server. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Create Your Account</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Username *</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required />
      </div>

      <div className="form-group">
        <label>Email *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input type="tel" name="phoneNo" value={formData.phoneNo} onChange={handleChange} placeholder="10-digit mobile number" />
      </div>

      <div className="form-group">
        <label>Password *</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required minLength={6} />
      </div>

      <div className="form-group">
        <label>Confirm Password *</label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" required minLength={6} />
      </div>

      <div className="form-buttons">
        <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</button>
        <button type="button" className="cancel-btn" onClick={onSuccess}>Cancel</button>
      </div>
    </form>
  );
};

export default SignupForm;