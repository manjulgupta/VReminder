import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [smsLogs, setSmsLogs] = useState([]);


  const [form, setForm] = useState({
    parent_name: '',
    parent_phone: '',
    child_name: '',
    child_dob: '',
  });

  async function loadSmsLogs() {
  try {
    const res = await api.get('/admin/sms-logs');
    setSmsLogs(res.data);
  } catch {
    setError('Failed to load SMS logs');
  }
}


  async function loadPatients() {
    try {
      const res = await api.get('/admin/patients');
      setPatients(res.data);
    } catch {
      setError('Failed to load patients');
    }
  }

  async function loadUpcoming() {
    try {
      const res = await api.get('/admin/upcoming-reminders');
      setUpcoming(res.data);
    } catch {
      setError('Failed to load upcoming reminders');
    }
  }

  useEffect(() => {
    loadPatients();
    loadUpcoming();
    loadSmsLogs();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function addPatient(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/admin/patients', form);
      setMessage('Patient added successfully');
      setForm({
        parent_name: '',
        parent_phone: '',
        child_name: '',
        child_dob: '',
      });
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  }

  async function deletePatient(id) {
    if (!window.confirm('Delete this patient?')) return;

    try {
      await api.delete(`/admin/patients/${id}`);
      setMessage('Patient deleted');
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete patient');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {/* Add patient form */}
      <h3>Add Patient</h3>
      <form onSubmit={addPatient}>
        <input name="parent_name" placeholder="Parent Name" value={form.parent_name} onChange={handleChange} required />{' '} <input name="parent_phone" placeholder="Phone" value={form.parent_phone} onChange={handleChange} required />{' '} <input name="child_name" placeholder="Child Name" value={form.child_name} onChange={handleChange} />{' '} <input type="date" name="child_dob" value={form.child_dob} onChange={handleChange} required />{' '} <button disabled={loading}> {loading ? 'Adding...' : 'Add'} </button> </form> {message && <p style={{ color: 'green' }}>{message}</p>} {error && <p style={{ color: 'red' }}>{error}</p>
      }
      <hr />
      {/* Patients table */}
      <h3>Patients</h3>
      {patients.length === 0 ? (
        <p>No patients yet.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Child</th>
              <th>Parent</th>
              <th>Phone</th>
              <th>DOB</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.child_name || '-'}</td>
                <td>{p.parent_name}</td>
                <td>{p.parent_phone}</td>
                <td>{new Date(p.child_dob).toLocaleDateString('en-GB')}</td>
                <td>
                  {p.status === 'queued' ? 'Queued (DLT pending)' : p.status}
                </td>
                {/* <td>{JSON.stringify(p)}</td> */}

                <td>
                  <button onClick={() => deletePatient(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <hr />
      {/* Upcoming vaccinations table */}
      <h3>Upcoming Vaccinations (next 7 days)</h3>
      {upcoming.length === 0 ? (
        <p>No upcoming vaccinations.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Child</th>
              <th>Vaccine</th>
              <th>Dose</th>
              <th>Date</th>
              {/* <th>Status</th> */}
            </tr>
          </thead>
          <tbody>
            {upcoming.map(u => (
              <tr key={u.scheduled_dose_id}>
                <td>{u.child_name || '-'}</td>
                <td>{u.vaccine_name}</td>
                <td>{u.dose_number}</td>
                <td>{new Date(u.scheduled_date).toDateString()}</td>
                {/* <td>
                  {u.status === 'queued' ? 'Queued (DLT pending)' : u.status}
                </td> */}
                {/* <td>{JSON.stringify(u)}</td> */}

              </tr>
            ))}
          </tbody>
        </table>
      )}
      <hr />
      {/* (Your JSX below is fine, no changes needed) */}

      <h3>SMS Logs</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Phone</th>
            <th>Message</th>
            <th>Status</th>
            <th>Attempts</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {smsLogs.map(log => (
            <tr key={log.id}>
              <td>{log.to_phone}</td>
              <td>{log.message}</td>
              <td>
                {log.status === 'queued'
                  ? 'Queued (DLT pending)'
                  : log.status}
              </td>
              <td>{log.attempts}</td>
              <td>{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
}
