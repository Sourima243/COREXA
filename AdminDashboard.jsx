import React, { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = async (role) => {
    const res = await api.get(`/users${role ? `?role=${role}` : ""}`);
    setUsers(res.data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadUsers(roleFilter), api.get("/users/doctors").then((r) => setDoctors(r.data))]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const assignDoctor = async (patientId, doctorId) => {
    await api.patch(`/users/${patientId}/assign-doctor`, { doctorId: doctorId || null });
    loadUsers(roleFilter);
  };

  const toggleActive = async (u) => {
    await api.patch(`/users/${u._id}/status`, { isActive: !u.isActive });
    loadUsers(roleFilter);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Panel</h1>
      <p className="text-gray-500 mb-6">Manage users and doctor-patient assignments.</p>

      <div className="flex gap-2 mb-4">
        {["", "patient", "doctor", "admin"].map((r) => (
          <button
            key={r || "all"}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              roleFilter === r ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {r || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Assigned Doctor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-gray-700">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "patient" ? (
                      <select
                        value={u.assignedDoctor || ""}
                        onChange={(e) => assignDoctor(u._id, e.target.value)}
                        className="text-sm rounded-lg border border-gray-300 px-2 py-1"
                      >
                        <option value="">Unassigned</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name} {d.specialization ? `(${d.specialization})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className="text-xs text-gray-500 hover:text-brand-600 hover:underline"
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
