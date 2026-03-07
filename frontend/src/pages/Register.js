import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Phone, Lock, User, Mail, Key } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: User Details, 2: OTP Verification
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    if (!['6', '7', '8', '9'].includes(cleaned[0])) {
      return 'Invalid Indian mobile number. Must start with 6, 7, 8, or 9';
    }
    return null;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate all fields
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/send-otp`, {
        email: formData.email
      });
      
      if (response.data.success) {
        setSuccess(`OTP sent to ${response.data.email_masked}. Please check your email. (Demo: Check backend console logs)`);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First verify OTP
      const verifyResponse = await axios.post(`${API}/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });
      
      if (!verifyResponse.data.success) {
        setError('Invalid OTP');
        setLoading(false);
        return;
      }

      // Then register user
      const registerResponse = await axios.post(`${API}/auth/register`, {
        phone: formData.phone,
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      });
      
      if (registerResponse.data.success) {
        onLogin(registerResponse.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md" data-testid="register-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold" data-testid="register-title">Create Account</CardTitle>
          <CardDescription data-testid="register-description">
            Register to find scholarships
          </CardDescription>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            </div>
          </div>
        </CardHeader>

        {/* Step 1: User Details */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" data-testid="register-error-alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="full_name" data-testid="name-label">
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  data-testid="name-input"
                />
              </div>

                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                />

              <div className="space-y-2">
                <Label htmlFor="email" data-testid="email-label">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  required
                  data-testid="email-input"
                />
                <p className="text-xs text-gray-500">OTP will be sent to this email</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" data-testid="phone-label">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: value });
                  }}
                  required
                  maxLength={10}
                  data-testid="phone-input"
                />
                {formData.phone.length > 0 && formData.phone.length < 10 && (
                  <p className="text-xs text-orange-600">
                    {10 - formData.phone.length} more digits required
                  </p>
                )}
                {formData.phone.length === 10 && !['6', '7', '8', '9'].includes(formData.phone[0]) && (
                  <p className="text-xs text-red-600">
                    Invalid number. Must start with 6, 7, 8, or 9
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" data-testid="password-label">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  data-testid="password-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" data-testid="confirm-password-label">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Confirm Password
                </Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  minLength={6}
                  data-testid="confirm-password-input"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
                data-testid="send-otp-button"
              >
                {loading ? 'Sending OTP...' : 'Send OTP to Email'}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline" data-testid="login-link">
                  Login here
                </Link>
              </p>
            </CardFooter>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndRegister}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" data-testid="otp-error-alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 border-green-200" data-testid="otp-success-alert">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="otp" data-testid="otp-label">
                  <Key className="inline h-4 w-4 mr-2" />
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({ ...formData, otp: value });
                  }}
                  required
                  maxLength={6}
                  data-testid="otp-input"
                />
                <p className="text-xs text-gray-500">
                  OTP sent to {formData.email.substring(0, 3)}****@{formData.email.split('@')[1]}
                </p>
                <p className="text-xs text-blue-600">
                  <strong>Demo Mode:</strong> Check backend console logs for OTP
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || formData.otp.length !== 6}
                data-testid="verify-otp-button"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Register'}
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
                data-testid="back-button"
              >
                Back to Form
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default Register;
