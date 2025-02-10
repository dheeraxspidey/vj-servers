import React from 'react'
import { setApplicationsData,setError } from '../slices/ApplicationSlice';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
function Header() {
    const dispatch = useDispatch(); 
      useEffect(() => {
        const fetchApplications = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/public/get-all-applications`);
            const data = await response.json();
            if (data.success) {
              dispatch(setApplicationsData(data.data));
            } else {
              dispatch(setError("Failed to load Applications."));  
            }
          } catch (error) {
            console.error("Error fetching Applications", error);
            dispatch(setError("Failed to load Applications."));
          }
        };
    
        fetchApplications();
      }, [dispatch]);  
  return (
    <div></div>
  )
}

export default Header