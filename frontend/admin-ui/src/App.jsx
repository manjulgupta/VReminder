// JSX = JavaScript XML
// It's a syntax extension that lets you write HTML-like code in JavaScript
// .jsx ~ .js 

import { useState } from 'react';//Why curly braces { }?
// Named import - importing a specific export from React
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// useState?
// // A React Hook that lets you add state to functional components
// // State = data that can change over time
// // When state changes → React re-renders the component

export default function App() {
  //Alternatively:
  // const loggedIn = localStorage.getItem('token');
  // {loggedIn ? <Dashboard /> : <Login />}
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem('token')
    //!!?Two NOT operators that convert any value to a boolean
    // if token exists → true; if null → false
    // !"something" => false; !!"something" => true
  );

  // const [loggedIn, setLoggedIn] = useState(initialValue);
  //   //     ↑         ↑              ↑         ↑
  //   //   current   function       hook      initial
  //   //   value     to update                 value

  //// useState returns an array with 2 items:
  // const result = useState(false);
  // const loggedIn = result[0];      // Current value
  // const setLoggedIn = result[1];   // Update function
  // // Destructuring is shorthand for above:
  // const [loggedIn, setLoggedIn] = useState(false);
  //// How to update state:
  // // ❌ NEVER do this (doesn't trigger re-render):
  // loggedIn = true;
  // // ✅ Always use the setter function:
  // setLoggedIn(true);  // React re-renders component!

  return loggedIn ? (
    <Dashboard />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
    //     └──────────────┬───────────────┘
    //              This is a prop
    // Props = data passed from parent to child component

    // // Option A: Arrow function (correct ✅)
    // <Login onLogin={() => setLoggedIn(true)} />
    // Step-by-step:
    // 1.During render, React sees:
    //    onLogin={() => setLoggedIn(true)}
    // 2.React creates a function:
    //    const onLoginFunction = () => setLoggedIn(true);
    // 3.Passes this function as a prop to Login:
    //   // Login receives:
    //   props.onLogin = function() { setLoggedIn(true); }
    // 4.Login can call it later:
    // // Inside Login.jsx, after successful login:
    //   props.onLogin();  // NOW setLoggedIn(true) executes!
    // Component renders
    //   ↓
    // Function is CREATED (not executed)
    //   ↓
    // Function passed to child
    //   ↓
    // Child calls function when ready
    //   ↓
    // setLoggedIn(true) executes

    // // Option B: Direct call (WRONG ❌)
    // <Login onLogin={setLoggedIn(true)} />
    // Step-by-step:
    // 1. During render, React sees:
    // javascript   onLogin={setLoggedIn(true)}
    // 2. JavaScript IMMEDIATELY executes setLoggedIn(true):
    // javascript   // This happens RIGHT NOW during render!
    //   setLoggedIn(true);  // ← Executes!
    //   // setLoggedIn returns undefined
    //   const result = undefined;
    // 3. Passes undefined as prop:
    // javascript   // Login receives:
    //   props.onLogin = undefined  // Not a function!
    //4. Login tries to call it:
    // javascript   props.onLogin();  // ERROR! Cannot call undefined 💥
    // **Timeline:**
    // Component renders
    //   ↓
    // setLoggedIn(true) executes IMMEDIATELY
    //   ↓
    // undefined passed to child
    //   ↓
    // Child tries to call undefined → CRASH!

    // Pass function ✅
    // callback={() => doSomething()}
    // callback={doSomething}

    // // Call function ❌
    // callback={doSomething()}
  );
}

// Problem: Checks if token EXISTS, not if it's VALID!
// Scenarios:
// // Token expired → Still shows Dashboard
// // Token tampered with → Still shows Dashboard
// // User deleted from database → Still shows Dashboard
// const response = await fetch('http://localhost:4000/api/admin/verify', {
// headers: { 'Authorization': `Bearer ${token}` }

// Issue 2: No Logout Functionality
// How would user logout?
// Dashboard probably has a logout button that needs to:
// Remove token from localStorage
// Tell App.jsx to update state