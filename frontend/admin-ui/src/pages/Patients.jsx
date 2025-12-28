import { useEffect, useState } from 'react';
import client from '../api/client';

// useEffect = A React Hook that lets you perform side effects in functional components.
// What are "side effects"?
// // Fetching data from API
// // Setting up subscriptions
// // Manually changing the DOM
// // Timers (setTimeout, setInterval)
// // Anything that "reaches outside" React
// Syntax:
// useEffect(() => {
//   // Side effect code here
// }, [dependencies]);
//
// ### **Component Lifecycle with useEffect**
// Component mounts (first render)
//    ↓
// Render JSX (with initial state)
//    ↓
// Browser paints screen
//    ↓
// useEffect runs (after paint!) ← KEY DIFFERENCE FROM NORMAL CODE
//    ↓
// State updates from API call
//    ↓
// Component re-renders
//    ↓
// Browser updates screen
//
// // This runs EVERY render!
//   client.get('/admin/patients').then(res => setPatients(res.data));
//   //                                         ↑
//   //                            This triggers re-render
//   //                                         ↓
//   //                              Component renders again
//   //                                         ↓
//   //                              API call runs again
//   //                                         ↓
//   //                            State updates (re-render)
//   //                                         ↓
//   //                              INFINITE LOOP! 🔥

export default function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    client.get('/admin/patients').then(res => setPatients(res.data)); //res.data contains the actual patient array
  }, []);

  return (
    <>
      <h2>Patients</h2>
      <ul>
        {patients.map(p => (
          <li key={p.id}> 
          {/* Why key is required:
React uses keys to track which items changed, were added, or removed. */}
            {p.child_name} — {p.parent_name} ({p.parent_phone})
          </li>
        ))}
      </ul>
    </>
  );
}
