import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainPage from './components/MainPage';
import './App.css';
import Form from './components/Form';
import Failure from './components/Failure';

function App() {
  const BrowserRouter = createBrowserRouter([
    {
      path: '/',
      element: <MainPage />,
    },
    {
      path:'/login',
      element:<Form/>
    },
    {
      path:'/failure',
      element:<Failure/>
    }
  ]);

  return <RouterProvider router={BrowserRouter} />;
}

export default App;
