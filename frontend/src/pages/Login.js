import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Phone, Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    if (!['6', '7', '8', '9'].includes(cleaned[0])) {
      return 'Invalid Indian mobile number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const phoneError = validatePhone(formData.phone);
  if (phoneError) {
    setError(phoneError);
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post(`${API}/auth/login`, {
      ...formData,
      loginType: "USER"
    });

    if (response.data.success) {

      // ✅ IMPORTANT — SET USER STATE
      onLogin(response.data.user);

      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }

  } catch (err) {
    setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md" data-testid="login-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold" data-testid="login-title">Welcome Back</CardTitle>
          <CardDescription data-testid="login-description">
            Login to access scholarship opportunities
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" data-testid="login-error-alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
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
                  if (error && value.length === 10) {
                    setError('');
                  }
                }}
                required
                maxLength={10}
                data-testid="phone-input"
                className={error && formData.phone.length > 0 ? 'border-red-500' : ''}
              />
              {formData.phone.length > 0 && formData.phone.length < 10 && (
                <p className="text-xs text-orange-600">
                  {10 - formData.phone.length} more digits required
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="password-input"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-sm text-center text-gray-600" data-testid="register-link-text">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline" data-testid="register-link">
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Login;
