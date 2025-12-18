import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Schedules() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    client.get('/admin/schedules/upcoming?days=7').then(res => setRows(res.data));
  }, []);

  return (
    <>
      <h2>Upcoming Vaccines</h2>
      <ul>
        {rows.map(r => (
          <li key={r.scheduled_dose_id}>
            {r.child_name}: {r.vaccine_name} (dose {r.dose_number}) on {new Date(r.scheduled_date).toLocaleDateString('en-IN')}
          </li>
        ))}
      </ul>
    </>
  );
}
