'use client';
import { getTheme } from '@/providers/themeContext';
import React from 'react';
import { ToastContainer } from 'react-toastify';

function Toast() {
  const theme = getTheme();

  return (
    <ToastContainer
      className=' text-'
      position='bottom-right'
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
}

export default Toast;
