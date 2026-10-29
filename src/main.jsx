import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 👈 নতুন স্টাইলশিটের পাথগুলো এখানে আপডেট করা হলো
import './styles/index.css'; 
import './styles/auth.css';  

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);