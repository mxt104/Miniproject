import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Benefits({ user, onLogout }) {

  const [benefits, setBenefits] = useState([]);
  const [filteredBenefits, setFilteredBenefits] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedBenefit, setSelectedBenefit] = useState(null);

  useEffect(() => {
    loadBenefits();
  }, []);

  const loadBenefits = async () => {
    const res = await axios.get(`${API}/benefits`);
    if (res.data.success) {
      setBenefits(res.data.benefits);
      setFilteredBenefits(res.data.benefits);
    }
  };

  useEffect(() => {
    if (!categoryFilter) {
      setFilteredBenefits(benefits);
    } else {
      setFilteredBenefits(
        benefits.filter(b => b.category === categoryFilter)
      );
    }
  }, [categoryFilter, benefits]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">
            Student Benefits ({filteredBenefits.length})
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* FILTER */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Travel">Travel</option>
            <option value="Education">Education</option>
            <option value="Food">Food</option>
            <option value="Software">Software</option>
          </select>
        </div>

        {/* BENEFITS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBenefits.map((b) => (
            <div key={b._id} className="bg-white rounded-xl shadow p-6">

              {b.logo && (
                <img
                  src={b.logo}
                  alt={b.name}
                  className="h-12 mb-4"
                />
              )}

              <h3 className="text-lg font-bold mb-2">
                {b.name}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                {b.description}
              </p>

              <button
                onClick={() => setSelectedBenefit(b)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg"
              >
                View Benefit
              </button>
            </div>
          ))}
        </div>

      </main>

      {/* POPUP */}
      {selectedBenefit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white w-[600px] rounded-xl shadow-lg p-6 relative">

            <button
              onClick={() => setSelectedBenefit(null)}
              className="absolute top-3 right-3 text-gray-500"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {selectedBenefit.name}
            </h2>

            <p className="mb-2">
              <strong>Category:</strong> {selectedBenefit.category}
            </p>

            <p className="mb-2">
              <strong>Discount:</strong> {selectedBenefit.discount}
            </p>

            <p className="mb-4">
              <strong>Eligibility:</strong> {selectedBenefit.eligibility}
            </p>

            <a
              href={selectedBenefit.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="w-full py-2 bg-green-600 text-white rounded-lg">
                Claim Benefit
              </button>
            </a>

          </div>
        </div>
      )}

    </div>
  );
}

export default Benefits;