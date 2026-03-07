import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Upload, CheckCircle, XCircle, Clock, ArrowLeft, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DOCUMENT_TYPES = [
  { value: '10th_marksheet', label: '10th Marksheet' },
  { value: '12th_marksheet', label: '12th Marksheet' },
  { value: 'aadhar', label: 'Aadhar Card' },
  { value: 'income_certificate', label: 'Income Certificate' },
  { value: 'caste_certificate', label: 'Caste Certificate' }
];

function Documents({ user, onLogout }) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API}/documents/${user.id}`);
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedType || !selectedFile) {
      setError('Please select document type and file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('document_type', selectedType);
      formData.append('file', selectedFile);

      const response = await axios.post(`${API}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Document uploaded successfully!');
        setSelectedType('');
        setSelectedFile(null);
        // Reset file input
        document.getElementById('file-input').value = '';
        // Refresh documents
        fetchDocuments();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (documentId) => {
    setVerifying(documentId);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API}/documents/verify/${documentId}`);

      if (response.data.success) {
        setSuccess(
          response.data.is_verified
            ? 'Document verified successfully!'
            : 'Document verification failed. Please re-upload.'
        );
        // Refresh documents
        fetchDocuments();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500" data-testid="status-verified"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive" data-testid="status-rejected"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary" data-testid="status-pending"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getDocumentLabel = (type) => {
    return DOCUMENT_TYPES.find(d => d.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-testid="documents-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} data-testid="back-to-dashboard-button">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" data-testid="documents-title">Document Management</h1>
                <p className="text-sm text-gray-500" data-testid="documents-subtitle">Upload and verify your documents</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card data-testid="upload-document-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                Upload New Document
              </CardTitle>
              <CardDescription>Upload your documents for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                {error && (
                  <Alert variant="destructive" data-testid="upload-error-alert">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 border-green-200" data-testid="upload-success-alert">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="document-type" data-testid="document-type-label">Document Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger data-testid="document-type-select">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} data-testid={`document-type-${type.value}`}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-input" data-testid="file-input-label">Select File</Label>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    data-testid="file-input"
                  />
                  <p className="text-xs text-gray-500">Max file size: 5MB (PDF, JPG, PNG)</p>
                  {selectedFile && (
                    <p className="text-sm text-green-600" data-testid="selected-file-name">Selected: {selectedFile.name}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={uploading || !selectedType || !selectedFile}
                  data-testid="upload-button"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card data-testid="documents-list-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Your Documents
              </CardTitle>
              <CardDescription>Manage your uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500" data-testid="no-documents-message">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      data-testid={`document-item-${doc.document_type}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900" data-testid={`document-label-${doc.document_type}`}>
                            {getDocumentLabel(doc.document_type)}
                          </h4>
                          <p className="text-sm text-gray-500" data-testid={`document-filename-${doc.document_type}`}>{doc.file_name}</p>
                        </div>
                        {getStatusBadge(doc.verification_status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                        {doc.verification_status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleVerify(doc.id)}
                            disabled={verifying === doc.id}
                            data-testid={`verify-button-${doc.document_type}`}
                          >
                            {verifying === doc.id ? 'Verifying...' : 'Verify with DigiLocker'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200" data-testid="info-card">
          <CardHeader>
            <CardTitle className="text-blue-900">Document Verification Process</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p>✓ Upload your documents (10th, 12th marksheets, certificates)</p>
            <p>✓ Click "Verify with DigiLocker" to authenticate (mock verification for demo)</p>
            <p>✓ Once verified, browse scholarships matching your profile</p>
            <p className="text-sm text-blue-600 mt-4">Note: This is a demo using mock DigiLocker verification</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Documents;
