import React, { use, useEffect } from 'react'
import Navbar from './components/Navbar';

import {Navigate, Route, Routes} from 'react-router-dom';
import HomePage from './Pages/HomePage';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Profile from './Pages/Profile';
import Setting from './Pages/Setting';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import {Loader} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const {authUser,checkAuth,isCheckingAuth} = useAuthStore();
  const {theme} = useThemeStore();

  useEffect(() => {
    checkAuth();
  },[checkAuth]);

  console.log({authUser});

  if(isCheckingAuth && !authUser)return (
    <div className='flex justify-center items-center h-screen'>
      <Loader className='size-10 animate-spin'/>
    </div>
  )

  return (
    <div data-theme={theme}>

      <Navbar />

      <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <Login/>} />
        <Route path='/signup' element={!authUser ? <Signup/> : <Navigate to="/"/>} />
        <Route path='/login' element={!authUser ? <Login/> : <Navigate to="/"/>} />
        <Route path='/setting' element={<Setting/>} />
        <Route path='/profile' element={authUser ? <Profile/> : <Login/>} />
      </Routes>

      <Toaster />

    </div>
    
  );
};

export default App;