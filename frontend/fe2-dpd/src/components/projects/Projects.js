import React, { useState, useEffect } from 'react';
import './Project.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import DetailsCard1 from '../detailsCard/DetailsCard';
let backendURL = process.env.REACT_APP_backend_url;
function Projects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('query');
    if (query) {
      setSearchQuery(query);
      searchProjects(query);
    }
  }, [location.search]);

  async function searchProjects(query) {
    setLoading(true);
    try {
      const res = await axios.post(`${backendURL}/search`, { query: query }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(res.data);
      setFilteredProjects(
        Array.isArray(res.data)
          ? res.data.map((item) => item.passage) // Extract only "passage" from each object
          : []
      );
      
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  }
  console.log(filteredProjects)
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    searchProjects(query);
  };

  return (
    <div className="projects-container">
      <div className="container-fluid">
        <div className='box1 p-2 text-dark'>
          <h1 className="text-center">PROJECTS</h1>
          <p className="text-center">Find, Learn, and Inspire</p>
        </div>
        <hr className='hrr' />
        <form className="form d-flex justify-content-center" role="search" onSubmit={e => e.preventDefault()}>
          <input
            className="form-control me-2 shadow"
            type="search"
            placeholder="Enter Title"
            aria-label="Search"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="btn btn-success shadow" type="submit">Search</button>
        </form>
        <div className="project-list">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <DetailsCard1
                key={index}
                data={project.passage}
                score={Math.round(project.score * 100) / 100}
              />
            ))
          ) : (
            <p>No projects found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Projects;
