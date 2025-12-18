import { useState } from 'react';
import Login from './pages/Login';
import Patients from './pages/Patients';
import Schedules from './pages/Schedules';
import SmsLogs from './pages/SmsLogs';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <>
      <Patients />
      <Schedules />
      <SmsLogs />
    </>
  );
}
