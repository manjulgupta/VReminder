import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    client.get('/admin/patients').then(res => setPatients(res.data));
  }, []);

  return (
    <>
      <h2>Patients</h2>
      <ul>
        {patients.map(p => (
          <li key={p.id}>
            {p.child_name} — {p.parent_name} ({p.parent_phone})
          </li>
        ))}
      </ul>
    </>
  );
}
