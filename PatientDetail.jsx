import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import VitalChart from "../components/VitalChart";

const VITAL_TYPES = [
  { value: "blood_pressure", label: "Blood Pressure", unit: "mmHg" },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm" },
  { value: "glucose", label: "Blood Glucose", unit: "mg/dL" },
  { value: "weight", label: "Weight", unit: "kg" },
  { value: "temperature", label: "Temperature", unit: "°C" },
  { value: "oxygen_saturation", label: "Oxygen Saturation", unit: "%" },
];

const PatientDetail = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [vitalType, setVitalType] = useState("blood_pressure");
  const [vitals, setVitals] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [medForm, setMedForm] = useState({ name: "", dosage: "", frequency: "", instructions: "" });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    const [p, v, s, m, n] = await Promise.all([
      api.get(`/users/${patientId}`),
      api.get(`/vitals/patient/${patientId}?type=${vitalType}`),
      api.get(`/symptoms/patient/${patientId}`),
      api.get(`/medications/patient/${patientId}`),
      api.get(`/notes/patient/${patientId}`),
    ]);
    setPatient(p.data);
    setVitals(v.data);
    setSymptoms(s.data);
    setMedications(m.data);
    setNotes(n.data);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  useEffect(() => {
    api.get(`/vitals/patient/${patientId}?type=${vitalType}`).then((res) => setVitals(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vitalType]);

  const currentTypeConfig = VITAL_TYPES.find((t) => t.value === vitalType);

  const submitNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await api.post("/notes", { patient: patientId, content: noteText });
      setNoteText("");
      const res = await api.get(`/notes/patient/${patientId}`);
      setNotes(res.data);
    } finally {
      setSaving(false);
    }
  };

  const submitMedication = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/medications", { patient: patientId, ...medForm });
      setMedForm({ name: "", dosage: "", frequency: "", instructions: "" });
      const res = await api.get(`/medications/patient/${patientId}`);
      setMedications(res.data);
    } finally {
      setSaving(false);
    }
  };

  const toggleMedActive = async (med) => {
    await api.patch(`/medications/${med._id}`, { active: !med.active });
    const res = await api.get(`/medications/patient/${patientId}`);
    setMedications(res.data);
  };

  if (!patient) return <div className="max-w-5xl mx-auto px-4 py-8 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/doctor" className="text-sm text-brand-600 hover:underline">
        ← Back to patients
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-1">{patient.name}</h1>
      <p className="text-gray-500 mb-6">{patient.email}</p>

      {/* Vitals */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">Vitals</h3>
          <select
            value={vitalType}
            onChange={(e) => setVitalType(e.target.value)}
            className="text-sm rounded-lg border border-gray-300 px-2 py-1"
          >
            {VITAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <VitalChart data={vitals} unit={currentTypeConfig.unit} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Symptoms */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Recent symptoms</h3>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {symptoms.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">None reported.</p>}
            {symptoms.map((s) => (
              <div key={s._id} className="py-2">
                <p className="text-sm text-gray-700">
                  {s.description}{" "}
                  <span className="text-xs text-gray-400">
                    ({s.severity}
                    {s.resolved ? ", resolved" : ""})
                  </span>
                </p>
                <p className="text-xs text-gray-400">{new Date(s.date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Medications</h3>
          <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto mb-4">
            {medications.length === 0 && <p className="text-sm text-gray-400 py-2">None prescribed yet.</p>}
            {medications.map((m) => (
              <div key={m._id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{m.name}</p>
                  <p className="text-xs text-gray-500">
                    {m.dosage} — {m.frequency}
                  </p>
                </div>
                <button
                  onClick={() => toggleMedActive(m)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {m.active ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={submitMedication} className="space-y-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500">Prescribe new medication</p>
            <input
              required
              placeholder="Medication name"
              value={medForm.name}
              onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <div className="flex gap-2">
              <input
                required
                placeholder="Dosage (e.g. 500mg)"
                value={medForm.dosage}
                onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                className="w-1/2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                required
                placeholder="Frequency (e.g. 2x/day)"
                value={medForm.frequency}
                onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                className="w-1/2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <input
              placeholder="Instructions (optional)"
              value={medForm.instructions}
              onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Prescribe
            </button>
          </form>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-6">
        <h3 className="font-semibold text-gray-700 mb-3">Clinical notes</h3>
        <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto mb-4">
          {notes.length === 0 && <p className="text-sm text-gray-400 py-2">No notes yet.</p>}
          {notes.map((n) => (
            <div key={n._id} className="py-2">
              <p className="text-sm text-gray-700">{n.content}</p>
              <p className="text-xs text-gray-400">
                {n.doctor?.name} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={submitNote} className="flex gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a clinical note..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientDetail;
