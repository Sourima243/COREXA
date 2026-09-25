import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import VitalChart from "../components/VitalChart";

const VITAL_TYPES = [
  { value: "blood_pressure", label: "Blood Pressure", unit: "mmHg", hasSecondary: true },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm" },
  { value: "glucose", label: "Blood Glucose", unit: "mg/dL" },
  { value: "weight", label: "Weight", unit: "kg" },
  { value: "temperature", label: "Temperature", unit: "°C" },
  { value: "oxygen_saturation", label: "Oxygen Saturation", unit: "%" },
];

const TABS = ["Vitals", "Symptoms", "Medications", "Doctor Notes"];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Vitals");
  const [activeVitalType, setActiveVitalType] = useState("blood_pressure");
  const [vitals, setVitals] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [vitalForm, setVitalForm] = useState({ value: "", secondaryValue: "", notes: "" });
  const [symptomForm, setSymptomForm] = useState({ description: "", severity: "mild" });

  const currentTypeConfig = VITAL_TYPES.find((t) => t.value === activeVitalType);

  const loadVitals = async (type) => {
    const res = await api.get(`/vitals/patient/${user._id}?type=${type}`);
    setVitals(res.data);
  };

  const loadSymptoms = async () => {
    const res = await api.get(`/symptoms/patient/${user._id}`);
    setSymptoms(res.data);
  };

  const loadMedications = async () => {
    const res = await api.get(`/medications/patient/${user._id}`);
    setMedications(res.data);
  };

  const loadNotes = async () => {
    const res = await api.get(`/notes/patient/${user._id}`);
    setNotes(res.data);
  };

  useEffect(() => {
    if (activeTab === "Vitals") loadVitals(activeVitalType);
    if (activeTab === "Symptoms") loadSymptoms();
    if (activeTab === "Medications") loadMedications();
    if (activeTab === "Doctor Notes") loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeVitalType]);

  const submitVital = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/vitals", {
        type: activeVitalType,
        value: Number(vitalForm.value),
        secondaryValue: vitalForm.secondaryValue ? Number(vitalForm.secondaryValue) : undefined,
        unit: currentTypeConfig.unit,
        notes: vitalForm.notes,
      });
      setVitalForm({ value: "", secondaryValue: "", notes: "" });
      loadVitals(activeVitalType);
    } finally {
      setLoading(false);
    }
  };

  const deleteVital = async (id) => {
    await api.delete(`/vitals/${id}`);
    loadVitals(activeVitalType);
  };

  const submitSymptom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/symptoms", symptomForm);
      setSymptomForm({ description: "", severity: "mild" });
      loadSymptoms();
    } finally {
      setLoading(false);
    }
  };

  const resolveSymptom = async (id) => {
    await api.patch(`/symptoms/${id}/resolve`);
    loadSymptoms();
  };

  const deleteSymptom = async (id) => {
    await api.delete(`/symptoms/${id}`);
    loadSymptoms();
  };

  const severityColor = {
    mild: "bg-yellow-100 text-yellow-700",
    moderate: "bg-orange-100 text-orange-700",
    severe: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Hi, {user.name.split(" ")[0]} 👋</h1>
      <p className="text-gray-500 mb-6">Here's an overview of your health.</p>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Vitals Tab */}
      {activeTab === "Vitals" && (
        <div>
          <div className="flex gap-2 flex-wrap mb-6">
            {VITAL_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveVitalType(t.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeVitalType === t.value
                    ? "bg-brand-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">{currentTypeConfig.label} Trend</h3>
              <VitalChart data={vitals} unit={currentTypeConfig.unit} />

              <div className="mt-4 divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {vitals.map((v) => (
                  <div key={v._id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        {v.value}
                        {v.secondaryValue ? `/${v.secondaryValue}` : ""} {v.unit}
                      </span>
                      <span className="text-gray-400 ml-2">
                        {new Date(v.recordedAt).toLocaleString()}
                      </span>
                      {v.notes && <p className="text-gray-400 text-xs mt-0.5">{v.notes}</p>}
                    </div>
                    <button
                      onClick={() => deleteVital(v._id)}
                      className="text-gray-300 hover:text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-fit">
              <h3 className="font-semibold text-gray-700 mb-3">Log new reading</h3>
              <form onSubmit={submitVital} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {currentTypeConfig.hasSecondary ? "Systolic" : "Value"} ({currentTypeConfig.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={vitalForm.value}
                    onChange={(e) => setVitalForm({ ...vitalForm, value: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                {currentTypeConfig.hasSecondary && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Diastolic (mmHg)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={vitalForm.secondaryValue}
                      onChange={(e) => setVitalForm({ ...vitalForm, secondaryValue: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optional)</label>
                  <input
                    value={vitalForm.notes}
                    onChange={(e) => setVitalForm({ ...vitalForm, notes: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Save reading
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Symptoms Tab */}
      {activeTab === "Symptoms" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3">Logged symptoms</h3>
            <div className="divide-y divide-gray-100">
              {symptoms.length === 0 && <p className="text-sm text-gray-400 py-6 text-center">No symptoms logged.</p>}
              {symptoms.map((s) => (
                <div key={s._id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor[s.severity]}`}>
                        {s.severity}
                      </span>
                      {s.resolved && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{s.description}</p>
                    <p className="text-xs text-gray-400">{new Date(s.date).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!s.resolved && (
                      <button
                        onClick={() => resolveSymptom(s._id)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Resolve
                      </button>
                    )}
                    <button onClick={() => deleteSymptom(s._id)} className="text-xs text-gray-300 hover:text-red-500">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-fit">
            <h3 className="font-semibold text-gray-700 mb-3">Log a symptom</h3>
            <form onSubmit={submitSymptom} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={symptomForm.description}
                  onChange={(e) => setSymptomForm({ ...symptomForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="e.g. Headache, mild dizziness"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Severity</label>
                <select
                  value={symptomForm.severity}
                  onChange={(e) => setSymptomForm({ ...symptomForm, severity: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Log symptom
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Medications Tab (read-only for patient; prescribed by doctor) */}
      {activeTab === "Medications" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Your medications</h3>
          <div className="divide-y divide-gray-100">
            {medications.length === 0 && (
              <p className="text-sm text-gray-400 py-6 text-center">No medications prescribed yet.</p>
            )}
            {medications.map((m) => (
              <div key={m._id} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-700">{m.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      m.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {m.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {m.dosage} — {m.frequency}
                </p>
                {m.instructions && <p className="text-xs text-gray-400 mt-1">{m.instructions}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  Prescribed by {m.prescribedBy?.name || "N/A"} on {new Date(m.startDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Notes Tab (read-only) */}
      {activeTab === "Doctor Notes" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Notes from your doctor</h3>
          <div className="divide-y divide-gray-100">
            {notes.length === 0 && <p className="text-sm text-gray-400 py-6 text-center">No notes yet.</p>}
            {notes.map((n) => (
              <div key={n._id} className="py-3">
                <p className="text-sm text-gray-700">{n.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.doctor?.name} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
