import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Scholarships({ user, onLogout }) {
  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [eduFilter, setEduFilter] = useState("");
  const [commFilter, setCommFilter] = useState("");

  const [percentage, setPercentage] = useState(null);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  /* ================= AGE CALCULATION ================= */
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userAge = calculateAge(user?.dob);

  /* ================= LOAD SCHOLARSHIPS ================= */
  useEffect(() => {
    loadScholarships();
  }, []);

  const loadScholarships = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/scholarships`);
      if (res.data.success) {
        setScholarships(res.data.scholarships);
        setFilteredScholarships(res.data.scholarships);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  /* ================= FILTERS ================= */
  useEffect(() => {
    let result = [...scholarships];

    if (searchQuery) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (eduFilter) {
      result = result.filter((s) =>
        s.education_qualifications?.includes(eduFilter)
      );
    }

    if (commFilter) {
      result = result.filter((s) =>
        s.communities?.includes(commFilter)
      );
    }

    setFilteredScholarships(result);
  }, [searchQuery, eduFilter, commFilter, scholarships]);

  /* ================= OCR ================= */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingOCR(true);

    try {
      let extractedText = "";

      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async function () {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            extractedText += pageText + " ";
          }

          processOCRText(extractedText);
          setLoadingOCR(false);
        };

        reader.readAsArrayBuffer(file);
      }

      else if (file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        const result = await Tesseract.recognize(imageUrl, "eng");
        extractedText = result.data.text;
        processOCRText(extractedText);
        URL.revokeObjectURL(imageUrl);
        setLoadingOCR(false);
      }

    } catch (err) {
      console.error(err);
      setLoadingOCR(false);
    }
  };

  const processOCRText = (text) => {
    const lower = text.toLowerCase();
    let percentageValue = null;

    let percentMatch = lower.match(/(\d{2,3}\.\d+|\d{2,3})\s?%/);
    if (percentMatch) {
      percentageValue = parseFloat(percentMatch[1]);
    }

    if (!percentageValue) {
      const decimals = lower.match(/\b\d{2,3}\.\d{1,2}\b/g);
      if (decimals) {
        for (let num of decimals) {
          const value = parseFloat(num);
          if (value >= 35 && value <= 100) {
            percentageValue = value;
            break;
          }
        }
      }
    }

    if (!percentageValue) {
      const numbers = lower.match(/\b\d{2,4}\b/g);
      if (numbers && numbers.length >= 2) {
        for (let i = 0; i < numbers.length - 1; i++) {
          const total = parseInt(numbers[i]);
          const obtained = parseInt(numbers[i + 1]);
          if (total >= 100 && obtained <= total) {
            const calc = (obtained / total) * 100;
            if (calc >= 35 && calc <= 100) {
              percentageValue = calc;
              break;
            }
          }
        }
      }
    }

    if (percentageValue) {
      setPercentage(Math.round(percentageValue));
    } else {
      alert("Could not detect percentage.");
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold">
            Scholarships ({filteredScholarships.length})
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* OCR */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-3">
            Upload Marksheet for Merit Eligibility
          </h2>

          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={handleFileUpload}
          />

          {loadingOCR && <p>Scanning...</p>}

          {percentage !== null && (
            <p className="mt-2 font-semibold text-blue-600">
              Detected Percentage: {percentage}%
            </p>
          )}
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search scholarships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={eduFilter}
              onChange={(e) => setEduFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Education Levels</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Doctorate">Doctorate</option>
            </select>

            <select
              value={commFilter}
              onChange={(e) => setCommFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Communities</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC/ST">SC/ST</option>
              <option value="Minority">Minority</option>
            </select>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredScholarships.map((s) => (
              <div key={s._id} className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold mb-2">{s.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{s.description}</p>

                <button
                  onClick={() => setSelectedScholarship(s)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg"
                >
                  View Information
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[650px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">

            <button
              onClick={() => setSelectedScholarship(null)}
              className="absolute top-3 right-3 text-gray-500 text-lg"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {selectedScholarship.name}
            </h2>

            <div className="space-y-2 text-sm mb-6">
              <p><strong>Type:</strong> {selectedScholarship.type}</p>
              <p><strong>Education:</strong> {selectedScholarship.education_qualifications?.join(", ")}</p>
              <p><strong>Communities:</strong> {selectedScholarship.communities?.join(", ")}</p>
              {selectedScholarship.minPercentage && (
                <p><strong>Minimum %:</strong> {selectedScholarship.minPercentage}%</p>
              )}
              {selectedScholarship.deadline && (
                <p><strong>Deadline:</strong> {new Date(selectedScholarship.deadline).toLocaleDateString()}</p>
              )}
            </div>

            {isDeadlinePassed(selectedScholarship.deadline) ? (

  <p className="text-red-600 font-semibold">
    Scholarship Closed ❌
  </p>

) : selectedScholarship.minPercentage ? (

  percentage !== null ? (

    percentage >= selectedScholarship.minPercentage ? (

      <div>
        <p className="text-green-600 font-semibold mb-2">
          Eligible ✅
        </p>

        <a
          href={selectedScholarship.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="w-full py-2 bg-green-600 text-white rounded-lg">
            Apply Now
          </button>
        </a>
      </div>

    ) : (

      <p className="text-red-600 font-semibold">
        Not Eligible ❌ (Requires {selectedScholarship.minPercentage}%)
      </p>

    )

  ) : (

    <p className="text-gray-500">
      Upload marksheet to check eligibility
    </p>

  )

) : (

  <a
    href={selectedScholarship.link}
    target="_blank"
    rel="noopener noreferrer"
  >
    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg">
      Apply Now
    </button>
  </a>

)}

          </div>
        </div>
      )}

    </div>
  );
}

export default Scholarships;