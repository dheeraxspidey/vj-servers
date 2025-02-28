import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Home from './components/Home/Home';
import RootLayout from './RootLayout';
import Login from './components/Login/Login';
import ComplaintForm from './components/ComplaintForm/ComplaintForm';
import AdminPage from './components/AdminPage/AdminPage';
import LandingPage from './components/LandingPage/LandingPage';
import ComplaintsDetails from './components/ComplaintsDetails/ComplaintsDetails';
import UserDashboard from './components/UserDashboard/UserDashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import AdminAnalysis from './components/AdminAnalysis/AdminAnalysis';

function App() {
  let router = createBrowserRouter([
    {
      path: '',
      element: <RootLayout />,
      children: [
        { path: 'home', element: <Home /> },
        { path: 'complaint-website', element: <LandingPage /> },
        { path: 'login', element: <Login /> },
        { path: 'complaint-form', element: <ComplaintForm /> },
        { path: 'adminpage', element: <AdminPage /> },
        {path:'admin-analysis',element:<AdminAnalysis/>},
        {path:'user-dashboard',element:<UserDashboard/>},
        {
          path: 'complaints-details/:complaint_id', // ✅ Moved outside AdminPage
          element: <ComplaintsDetails />
        },
        { path: '', element: <Navigate to='complaint-website' /> }
      ]
    }
  ]);
  

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
