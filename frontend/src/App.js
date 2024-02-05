import React from 'react';
import './App.css';
import HomePage from './Pages/HomePage';
import ChatPage from './Pages/ChatPage';
import { Routes, Route } from 'react-router-dom';
// In your App.js or a similar top-level component
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css/animate.compat.css';

function App() {
  return (
    <div className='App'>
      <ReactNotifications />

      <Routes>

        <Route path='/' element={<HomePage />} />
        <Route path='/chat' element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
