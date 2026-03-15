import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GraduationCap, LogOut, Trash2, PlusCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // ======================
  // STATES
  // ======================
  const [scholarships, setScholarships] = useState([]);
  const [showEduDropdown, setShowEduDropdown] = useState(false);
const [showCommDropdown, setShowCommDropdown] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "MERIT",
    education_qualifications: [],
    communities: [],
    incomeLimit: "",
    minPercentage: "",
    deadline: "",
    minAge: "",
    maxAge: "",
    benefits: "",
    link: ""
  });

  // ======================
  // FETCH SCHOLARSHIPS
  // ======================
  const fetchScholarships = async () => {
    try {
      const res = await axios.get(`${API}/scholarships`);
      if (res.data.success) {
        setScholarships(res.data.scholarships);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  // ======================
  // ADD SCHOLARSHIP
  // ======================
  const handleAddScholarship = async () => {
  try {
    const payload = {
      ...formData,
      minPercentage: formData.minPercentage
        ? Number(formData.minPercentage)
        : null   // 🔥 If empty → store as null
    };

    await axios.post(`${API}/scholarships`, payload);

    fetchScholarships();

    setFormData({
      name: "",
      description: "",
      type: "MERIT",
      education_qualifications: [],
      communities: [],
      incomeLimit: "",
      minPercentage: "",
      benefits: "",
      link: ""
    });

  } catch (err) {
    console.error(err);
  }
};

  // ======================
  // DELETE
  // ======================
  const handleDelete = async (id) => {
    await axios.delete(`${API}/scholarships/${id}`);
    fetchScholarships();
  };

  const handleLogout = () => {
  if (onLogout) {
    onLogout();
  } else {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  }

  navigate("/login");
};

  if (role !== "ADMIN") {
    return <h2 style={{ padding: "40px" }}>Access Denied 🚫</h2>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex gap-4 mb-6">

  <button
    onClick={() => navigate("/admin/add-scholarship")}
    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
  >
    <PlusCircle size={18}/>
    Add Scholarship
  </button>

  <button
    onClick={() => navigate("/admin/add-benefit")}
    className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
  >
    <PlusCircle size={18}/>
    Add Benefit
  </button>

</div>

        {/* ADD SCHOLARSHIP FORM */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <PlusCircle size={20} /> Add Scholarship
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* NAME */}
            <input
              className="border p-2 rounded"
              placeholder="Scholarship Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <label>Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />

            <label>Minimum Age</label>
            <input
              type="number"
              value={formData.minAge}
              onChange={(e) =>
                setFormData({ ...formData, minAge: e.target.value })
              }
            />

            <label>Maximum Age</label>
            <input
              type="number"
              value={formData.maxAge}
              onChange={(e) =>
                setFormData({ ...formData, maxAge: e.target.value })
              }
            />

            {/* TYPE */}
            <select
              className="border p-2 rounded"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="MERIT">Merit-Based</option>
              <option value="NEED">Need-Based</option>
              <option value="MINORITY">Minority-Specific</option>
              <option value="GIRL_CHILD">Girl Child-Specific</option>
            </select>

            {/* INCOME */}
            <input
              className="border p-2 rounded"
              placeholder="Income Limit"
              value={formData.incomeLimit}
              onChange={(e) =>
                setFormData({ ...formData, incomeLimit: e.target.value })
              }
            />
  
            {/* MIN % */}
            <input
              className="border p-2 rounded"
              placeholder="Minimum Percentage (For Merit)"
              value={formData.minPercentage}
              onChange={(e) =>
                setFormData({ ...formData, minPercentage: e.target.value })
              }
            />

            {/* EDUCATION MULTI SELECT */}
          <div className="relative">
  <label className="block text-sm font-semibold mb-2">
    Education Levels
  </label>

  <div
    className="border rounded-lg p-3 bg-white cursor-pointer"
    onClick={() => setShowEduDropdown(!showEduDropdown)}
  >
    {formData.education_qualifications.length > 0
      ? formData.education_qualifications.join(", ")
      : "Select Education Levels"}
  </div>

  {showEduDropdown && (
    <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg p-3 space-y-2">
      {["Undergraduate", "Postgraduate", "Doctorate"].map((level) => (
        <label key={level} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.education_qualifications.includes(level)}
            onChange={() => {
              const updated = formData.education_qualifications.includes(level)
                ? formData.education_qualifications.filter(l => l !== level)
                : [...formData.education_qualifications, level];

              setFormData({
                ...formData,
                education_qualifications: updated
              });
            }}
          />
          <span>{level}</span>
        </label>
      ))}
    </div>
  )}
</div>

            {/* COMMUNITY MULTI SELECT */}
           <div className="relative mt-4">
  <label className="block text-sm font-semibold mb-2">
    Communities
  </label>

  <div
    className="border rounded-lg p-3 bg-white cursor-pointer"
    onClick={() => setShowCommDropdown(!showCommDropdown)}
  >
    {formData.communities.length > 0
      ? formData.communities.join(", ")
      : "Select Communities"}
  </div>

  {showCommDropdown && (
    <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg p-3 space-y-2">
      {["General", "OBC", "SC/ST", "Minority"].map((community) => (
        <label key={community} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.communities.includes(community)}
            onChange={() => {
              const updated = formData.communities.includes(community)
                ? formData.communities.filter(c => c !== community)
                : [...formData.communities, community];

              setFormData({
                ...formData,
                communities: updated
              });
            }}
          />
          <span>{community}</span>
        </label>
      ))}
    </div>
  )}
</div>

            {/* DESCRIPTION */}
            <textarea
              className="border p-2 rounded md:col-span-2"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            {/* BENEFITS */}
            <textarea
              className="border p-2 rounded md:col-span-2"
              placeholder="Benefits"
              value={formData.benefits}
              onChange={(e) =>
                setFormData({ ...formData, benefits: e.target.value })
              }
            />

            {/* LINK */}
            <input
              className="border p-2 rounded md:col-span-2"
              placeholder="Application Link"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
            />

          </div>

          <button
            onClick={handleAddScholarship}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Scholarship
          </button>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scholarships.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold mb-2">{s.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{s.description}</p>

              <p><strong>Type:</strong> {s.type}</p>
              <p><strong>Education:</strong> {s.education_qualifications?.join(", ")}</p>
              <p><strong>Community:</strong> {s.communities?.join(", ")}</p>
              <p><strong>Income:</strong> {s.incomeLimit}</p>
              <p><strong>Min %:</strong> {s.minPercentage}</p>

              <button
                onClick={() => handleDelete(s._id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;