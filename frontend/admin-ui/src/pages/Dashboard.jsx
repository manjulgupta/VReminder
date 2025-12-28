import { useEffect, useState } from 'react'; //importing react hooks
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


  // Three async functions called in parallel!
  // **What happens:
  // Component mounts
  //   ↓
  // useEffect runs
  //   ↓
  // loadPatients() starts  ──┐
  // loadUpcoming() starts  ──┼─→ All three run SIMULTANEOUSLY
  // loadSmsLogs() starts   ──┘    (don't wait for each other)
  //   ↓
  // Each resolves independently:
  //   ├─ patients data arrives → setPatients() → re-render
  //   ├─ upcoming data arrives → setUpcoming() → re-render  
  //   └─ smsLogs data arrives  → setSmsLogs()  → re-render
  // This is better than sequential (waiting)
  useEffect(() => {
    loadPatients();
    loadUpcoming();
    loadSmsLogs();
  }, []);

  //this pattern help to handle multiple input fields in a form
  function handleChange(e) {
                      // dynamic key- value pair
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  // Why copy? React needs a new object reference to detect changes!
  // javascript// ❌ WRONG - Mutating state directly:
  // form.parent_name = 'New Name';
  // setForm(form);  // React won't re-render! Same object reference
  // // ✅ CORRECT - New object:
  // setForm({ ...form, parent_name: 'New Name' });
  // // Different object reference → React re-renders

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
      // If you forget in catch, button stays disabled forever!
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

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #f3e5f5 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 16px',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      padding: '24px',
      marginBottom: '32px',
      border: '1px solid #f3f4f6',
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    accentBar: {
      width: '6px',
      height: '24px',
      borderRadius: '4px',
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.2s',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    messageBox: {
      padding: '16px',
      borderRadius: '8px',
      marginTop: '16px',
    },
    successBox: {
      backgroundColor: '#ecfdf5',
      border: '1px solid #a7f3d0',
      color: '#065f46',
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#991b1b',
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      fontWeight: '600',
      color: '#374151',
      borderBottom: '2px solid #e5e7eb',
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '15px',
      color: '#1f2937',
    },
    tr: {
      transition: 'background-color 0.2s',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
    },
    badgeGreen: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    badgeYellow: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    deleteButton: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    emptyState: {
      textAlign: 'center',
      padding: '32px',
      color: '#6b7280',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard: SRCCC</h1>
          <p style={styles.subtitle}>Vaccination Reminder System</p>
        </div>

        {/* Add Patient Form */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            <span style={{...styles.accentBar, backgroundColor: '#3b82f6'}}></span>
            Add New Patient
          </h3>
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Parent Name *</label>
              <input
                name="parent_name"
                placeholder="Enter parent's full name"
                value={form.parent_name}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => e.target.style.border = '2px solid #3b82f6'}
                onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                name="parent_phone"
                placeholder="+91 XXXXX XXXXX"
                value={form.parent_phone}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => e.target.style.border = '2px solid #3b82f6'}
                onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Child Name</label>
              <input
                name="child_name"
                placeholder="Enter child's full name"
                value={form.child_name}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => e.target.style.border = '2px solid #3b82f6'}
                onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date of Birth *</label>
              <input
                type="date"
                name="child_dob"
                value={form.child_dob}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => e.target.style.border = '2px solid #3b82f6'}
                onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
              />
            </div>

            <button
              onClick={addPatient}
              disabled={loading}
              style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loading ? 'Adding...' : 'Add Patient'}
            </button>
          </div>

          {message && <div style={{...styles.messageBox, ...styles.successBox}}>{message}</div>}
          {error && <div style={{...styles.messageBox, ...styles.errorBox}}>{error}</div>}
        </div>

        {/* Patients Table */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            <span style={{...styles.accentBar, backgroundColor: '#a855f7'}}></span>
            All Patients
          </h3>
          {patients.length === 0 ? (
            <p style={styles.emptyState}>No patients registered yet.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{...styles.th, maxWidth: '150px'}}>Child</th>
                    <th style={{...styles.th, maxWidth: '150px'}}>Parent</th>
                    <th style={{...styles.th, maxWidth: '140px'}}>Phone</th>
                    <th style={{...styles.th, maxWidth: '120px'}}>DOB</th>
                    <th style={{...styles.th, maxWidth: '120px'}}>Status</th>
                    <th style={{...styles.th, maxWidth: '100px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr 
                      key={p.id} 
                      style={styles.tr}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{...styles.td, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{p.child_name || '-'}</td>
                      <td style={{...styles.td, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{p.parent_name}</td>
                      <td style={{...styles.td, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px'}}>{p.parent_phone}</td>
                      <td style={{...styles.td, maxWidth: '120px'}}>{new Date(p.child_dob).toLocaleDateString('en-GB')}</td>
                      <td style={{...styles.td, maxWidth: '120px'}}>
                        <span style={{...styles.badge, ...(p.status === 'active' ? styles.badgeGreen : styles.badgeYellow)}}>
                          {p.status === 'queued' ? 'Pending' : p.status}
                        </span>
                      </td>
                      <td style={{...styles.td, maxWidth: '100px'}}>
                        <button
                          onClick={() => deletePatient(p.id)}
                          style={styles.deleteButton}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Vaccinations */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            <span style={{...styles.accentBar, backgroundColor: '#22c55e'}}></span>
            Upcoming Vaccinations (Next 7 Days)
          </h3>
          {upcoming.length === 0 ? (
            <p style={styles.emptyState}>No upcoming vaccinations scheduled.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{...styles.th, maxWidth: '150px'}}>Child</th>
                    <th style={{...styles.th, maxWidth: '120px'}}>Vaccine</th>
                    <th style={{...styles.th, maxWidth: '80px'}}>Dose</th>
                    <th style={{...styles.th, maxWidth: '140px'}}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(u => (
                    <tr 
                      key={u.scheduled_dose_id}
                      style={styles.tr}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{...styles.td, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{u.child_name || '-'}</td>
                      <td style={{...styles.td, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500', color: '#2563eb'}}>{u.vaccine_name}</td>
                      <td style={{...styles.td, maxWidth: '80px'}}>{u.dose_number}</td>
                      <td style={{...styles.td, maxWidth: '140px'}}>{new Date(u.scheduled_date).toDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SMS Logs */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            <span style={{...styles.accentBar, backgroundColor: '#f97316'}}></span>
            SMS Activity Logs
          </h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{...styles.th, maxWidth: '140px'}}>Phone</th>
                  <th style={{...styles.th, maxWidth: '200px'}}>Message</th>
                  <th style={{...styles.th, maxWidth: '100px'}}>Status</th>
                  <th style={{...styles.th, maxWidth: '80px'}}>Attempts</th>
                  <th style={{...styles.th, maxWidth: '160px'}}>Time</th>
                </tr>
              </thead>
              <tbody>
                {smsLogs.map(log => (
                  <tr 
                    key={log.id}
                    style={styles.tr}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{...styles.td, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px'}}>{log.to_phone}</td>
                    <td style={{...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px'}}>{log.message}</td>
                    <td style={{...styles.td, maxWidth: '100px'}}>
                      <span style={{...styles.badge, ...(log.status === 'sent' ? styles.badgeGreen : styles.badgeYellow)}}>
                        {log.status === 'queued' ? 'Pending' : log.status}
                      </span>
                    </td>
                    <td style={{...styles.td, maxWidth: '80px', textAlign: 'center'}}>{log.attempts}</td>
                    <td style={{...styles.td, maxWidth: '160px', fontSize: '14px'}}>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  //     <div className="max-w-6xl mx-auto px-4 py-8">
  //       {/* Header */}
  //       <div className="mb-8">
  //         <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
  //         <p className="text-gray-600">Vaccination Management System</p>
  //       </div>

  //       {/* Add Patient Form */}
  //       <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
  //         <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
  //           <span className="bg-blue-500 w-1.5 h-6 rounded-full"></span>
  //           Add New Patient
  //         </h3>
  //         <div className="space-y-4">
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Parent Name *
  //             </label>
  //             <input
  //               name="parent_name"
  //               placeholder="Enter parent's full name"
  //               value={form.parent_name}
  //               onChange={handleChange}
  //               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
  //             />
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Phone Number *
  //             </label>
  //             <input
  //               name="parent_phone"
  //               placeholder="+91 XXXXX XXXXX"
  //               value={form.parent_phone}
  //               onChange={handleChange}
  //               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
  //             />
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Child Name
  //             </label>
  //             <input
  //               name="child_name"
  //               placeholder="Enter child's full name"
  //               value={form.child_name}
  //               onChange={handleChange}
  //               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
  //             />
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Date of Birth *
  //             </label>
  //             <input
  //               type="date"
  //               name="child_dob"
  //               value={form.child_dob}
  //               onChange={handleChange}
  //               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
  //             />
  //           </div>

  //           <button
  //             onClick={addPatient}
  //             disabled={loading}
  //             className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
  //           >
  //             {loading ? 'Adding...' : 'Add Patient'}
  //           </button>
  //         </div>

  //         {message && (
  //           <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
  //             {message}
  //           </div>
  //         )}
  //         {error && (
  //           <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
  //             {error}
  //           </div>
  //         )}
  //       </div>

  //       {/* Patients Table */}
  //       <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
  //         <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
  //           <span className="bg-purple-500 w-1.5 h-6 rounded-full"></span>
  //           All Patients
  //         </h3>
  //         {patients.length === 0 ? (
  //           <p className="text-gray-500 text-center py-8">No patients registered yet.</p>
  //         ) : (
  //           <div className="overflow-x-auto">
  //             <table className="w-full">
  //               <thead>
  //                 <tr className="border-b-2 border-gray-200">
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '150px' }}>Child</th>
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '150px' }}>Parent</th>
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '140px' }}>Phone</th>
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '120px' }}>DOB</th>
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '120px' }}>Status</th>
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '100px' }}>Action</th>
  //                 </tr>
  //               </thead>
  //               <tbody>
  //                 {patients.map((p) => (
  //                   <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
  //                     <td className="py-3 px-4 truncate" style={{ maxWidth: '150px' }}>{p.child_name || '-'}</td>
  //                     <td className="py-3 px-4 truncate" style={{ maxWidth: '150px' }}>{p.parent_name}</td>
  //                     <td className="py-3 px-4 truncate text-sm" style={{ maxWidth: '140px' }}>{p.parent_phone}</td>
  //                     <td className="py-3 px-4" style={{ maxWidth: '120px' }}>{new Date(p.child_dob).toLocaleDateString('en-GB')}</td>
  //                     <td className="py-3 px-4" style={{ maxWidth: '120px' }}>
  //                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
  //                         p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  //                       }`}>
  //                         {p.status === 'queued' ? 'Pending' : p.status}
  //                       </span>
  //                     </td>
  //                     <td className="py-3 px-4" style={{ maxWidth: '100px' }}>
  //                       <button
  //                         onClick={() => deletePatient(p.id)}
  //                         className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
  //                       >
  //                         Delete
  //                       </button>
  //                     </td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </div>
  //         )}
  //       </div>

  //       {/* Upcoming Vaccinations */}
  //       <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
  //         <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
  //           <span className="bg-green-500 w-1.5 h-6 rounded-full"></span>
  //           Upcoming Vaccinations (Next 7 Days)
  //         </h3>
  //         {upcoming.length === 0 ? (
  //           <p className="text-gray-500 text-center py-8">No upcoming vaccinations scheduled.</p>
  //         ) : (
  //           <div className="overflow-x-auto">
  //             <table className="w-full">
  //               <thead>
  //                 <tr className="border-b-2 border-gray-200">
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '150px' }}>Child</th>
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '120px' }}>Vaccine</th>
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '80px' }}>Dose</th>
  //                   <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '140px' }}>Date</th>
  //                 </tr>
  //               </thead>
  //               <tbody>
  //                 {upcoming.map(u => (
  //                   <tr key={u.scheduled_dose_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
  //                     <td className="py-3 px-4 truncate" style={{ maxWidth: '150px' }}>{u.child_name || '-'}</td>
  //                     <td className="py-3 px-4 truncate font-medium text-blue-600" style={{ maxWidth: '120px' }}>{u.vaccine_name}</td>
  //                     <td className="py-3 px-4" style={{ maxWidth: '80px' }}>{u.dose_number}</td>
  //                     <td className="py-3 px-4" style={{ maxWidth: '140px' }}>{new Date(u.scheduled_date).toDateString()}</td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </div>
  //         )}
  //       </div>

  //       {/* SMS Logs */}
  //       <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
  //         <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
  //           <span className="bg-orange-500 w-1.5 h-6 rounded-full"></span>
  //           SMS Activity Logs
  //         </h3>
  //         <div className="overflow-x-auto">
  //           <table className="w-full">
  //             <thead>
  //               <tr className="border-b-2 border-gray-200">
  //                 <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '140px' }}>Phone</th>
  //                 <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '200px' }}>Message</th>
  //                 <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '100px' }}>Status</th>
  //                 <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '80px' }}>Attempts</th>
  //                 <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ maxWidth: '160px' }}>Time</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {smsLogs.map(log => (
  //                 <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
  //                   <td className="py-3 px-4 truncate text-sm" style={{ maxWidth: '140px' }}>{log.to_phone}</td>
  //                   <td className="py-3 px-4 truncate text-sm" style={{ maxWidth: '200px' }}>{log.message}</td>
  //                   <td className="py-3 px-4" style={{ maxWidth: '100px' }}>
  //                     <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
  //                       log.status === 'sent' ? 'bg-green-100 text-green-800' : 
  //                       log.status === 'queued' ? 'bg-yellow-100 text-yellow-800' : 
  //                       'bg-red-100 text-red-800'
  //                     }`}>
  //                       {log.status === 'queued' ? 'Pending' : log.status}
  //                     </span>
  //                   </td>
  //                   <td className="py-3 px-4 text-center" style={{ maxWidth: '80px' }}>{log.attempts}</td>
  //                   <td className="py-3 px-4 text-sm" style={{ maxWidth: '160px' }}>{new Date(log.created_at).toLocaleString()}</td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  // return (
  //   <div style={{ padding: 20 }}>
  //     <h1>Admin Dashboard</h1>
  //     <hr />

  //     {/* Add patient form */}
  //     <h3>Add Patient</h3>
  //     <form onSubmit={addPatient}>
  //       <input name="parent_name" placeholder="Parent Name" value={form.parent_name} onChange={handleChange} required />{' '} <input name="parent_phone" placeholder="Phone" value={form.parent_phone} onChange={handleChange} required />{' '} <input name="child_name" placeholder="Child Name" value={form.child_name} onChange={handleChange} />{' '} <input type="date" name="child_dob" value={form.child_dob} onChange={handleChange} required />{' '} <button disabled={loading}> {loading ? 'Adding...' : 'Add'} </button> </form> {message && <p style={{ color: 'green' }}>{message}</p>} {error && <p style={{ color: 'red' }}>{error}</p>
  //     }
  //     <hr />
  //     {/* Patients table */}
  //     <h3>Patients</h3>
  //     {patients.length === 0 ? (
  //       <p>No patients yet.</p>
  //     ) : (
  //       <table border="1" cellPadding="6">
  //         <thead>
  //           <tr>
  //             <th>Child</th>
  //             <th>Parent</th>
  //             <th>Phone</th>
  //             <th>DOB</th>
  //             <th>Status</th>
  //             <th>Action</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {patients.map((p) => (
  //             <tr key={p.id}>
  //               <td>{p.child_name || '-'}</td>
  //               <td>{p.parent_name}</td>
  //               <td>{p.parent_phone}</td>
  //               <td>{new Date(p.child_dob).toLocaleDateString('en-GB')}</td>
  //               <td>
  //                 {p.status === 'queued' ? 'Queued (DLT pending)' : p.status}
  //               </td>
  //               {/* <td>{JSON.stringify(p)}</td> */}

  //               <td>
  //                 <button onClick={() => deletePatient(p.id)}>
  //                   Delete
  //                 </button>
  //               </td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     )}
  //     {message && <p style={{ color: 'green' }}>{message}</p>}
  //     {error && <p style={{ color: 'red' }}>{error}</p>}
  //     <hr />
  //     {/* Upcoming vaccinations table */}
  //     <h3>Upcoming Vaccinations (next 7 days)</h3>
  //     {upcoming.length === 0 ? (
  //       <p>No upcoming vaccinations.</p>
  //     ) : (
  //       <table border="1" cellPadding="6">
  //         <thead>
  //           <tr>
  //             <th>Child</th>
  //             <th>Vaccine</th>
  //             <th>Dose</th>
  //             <th>Date</th>
  //             {/* <th>Status</th> */}
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {upcoming.map(u => (
  //             <tr key={u.scheduled_dose_id}>
  //               <td>{u.child_name || '-'}</td>
  //               <td>{u.vaccine_name}</td>
  //               <td>{u.dose_number}</td>
  //               <td>{new Date(u.scheduled_date).toDateString()}</td>
  //               {/* <td>
  //                 {u.status === 'queued' ? 'Queued (DLT pending)' : u.status}
  //               </td> */}
  //               {/* <td>{JSON.stringify(u)}</td> */}

  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     )}
  //     <hr />
  //     {/* (Your JSX below is fine, no changes needed) */}

  //     <h3>SMS Logs</h3>
  //     <table border="1" cellPadding="6">
  //       <thead>
  //         <tr>
  //           <th>Phone</th>
  //           <th>Message</th>
  //           <th>Status</th>
  //           <th>Attempts</th>
  //           <th>Time</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {smsLogs.map(log => (
  //           <tr key={log.id}>
  //             <td>{log.to_phone}</td>
  //             <td>{log.message}</td>
  //             <td>
  //               {log.status === 'queued'
  //                 ? 'Queued (DLT pending)'
  //                 : log.status}
  //             </td>
  //             <td>{log.attempts}</td>
  //             <td>{new Date(log.created_at).toLocaleString()}</td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>


  //   </div>
  // );


}
