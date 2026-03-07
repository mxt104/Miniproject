import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, FileText, BookOpen, LogOut, User, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_scholarships: 0,
    communities: [],
    education_levels: []
  });

  const [documents, setDocuments] = useState([]);

  /* ================= FETCH STATS ================= */
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/scholarships/stats`);
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  /* ================= FETCH DOCUMENTS ================= */
  const fetchDocuments = useCallback(async () => {
    if (!user?._id) return;

    try {
      const response = await axios.get(`${API}/documents/${user._id}`);
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, [user?._id]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchStats();
    fetchDocuments();
  }, [fetchDocuments]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const verifiedDocs = documents.filter(d => d.is_verified).length;
  const pendingDocs = documents.filter(d => d.verification_status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

      {/* ================= HEADER ================= */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">

            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Scholarship Portal
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome, {user?.full_name}!
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Scholarships
              </CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.total_scholarships}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available programs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {verifiedDocs}/{documents.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Verified documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Verification
              </CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {pendingDocs}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Documents pending
              </p>
            </CardContent>
          </Card>

        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Upload Documents */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/documents')}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload your marksheets and certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Manage Documents
              </Button>
            </CardContent>
          </Card>

          {/* Browse Scholarships */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/scholarships')}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Browse Scholarships
              </CardTitle>
              <CardDescription>
                Explore scholarships based on eligibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                View Scholarships
              </Button>
            </CardContent>
          </Card>

          {/* Explore Benefits */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/benefits')}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-indigo-600" />
                Explore Student Benefits
              </CardTitle>
              <CardDescription>
                Discover exclusive student discounts and offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                View Benefits
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* ================= PROFILE COMPLETION ================= */}
        {documents.length === 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <User className="h-5 w-5 mr-2" />
                Complete Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <p className="mb-4">
                Upload your documents to get personalized scholarship recommendations.
              </p>
              <Button
                onClick={() => navigate('/documents')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upload Documents Now
              </Button>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}

export default Dashboard;