import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/my-patients")
      .then((res) => setPatients(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Patients</h1>
      <p className="text-gray-500 mb-6">Patients currently assigned to you.</p>

      {loading && <p className="text-gray-400">Loading...</p>}

      {!loading && patients.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          No patients assigned to you yet. An admin can assign patients from the admin dashboard.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => (
          <Link
            key={p._id}
            to={`/doctor/patient/${p._id}`}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold mb-3">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold text-gray-800">{p.name}</p>
            <p className="text-sm text-gray-500">{p.email}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
