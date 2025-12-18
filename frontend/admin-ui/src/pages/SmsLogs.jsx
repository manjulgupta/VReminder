import { useEffect, useState } from 'react';
import client from '../api/client';

export default function SmsLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    client.get('/admin/sms-logs').then(res => setLogs(res.data));
  }, []);

  return (
    <>
      <h2>SMS Logs</h2>
      <ul>
        {logs.map(l => (
          <li key={l.id}>
            {l.to_phone} — {l.status} — {l.created_at}
          </li>
        ))}
      </ul>
    </>
  );
}
