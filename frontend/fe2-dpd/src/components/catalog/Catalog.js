import React, { useState, useEffect } from 'react';
import './Catalog.css';
import axios from 'axios';
import DetailsCard1 from '../detailsCard/DeatilsCard1';
import Pagination from '../../AllCorrectPages/Pagination/Pagination';
let backendURL = process.env.REACT_APP_backend_url;
function Catalog() {
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({
    Type: '',
    Department: '',
    Year: ''
  });
  const [departments, setDepartments] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(25);

  const mtechDepartments = [
    'CE-SE', 'CE-HE', 'CE-GTE', 'EE-PE', 'EE-PS', 'ME-CC', 'ME-AMS', 'EE-ES', 'EE-VLSI', 'CSE-SE', 'CSE-CNIS', 'EIE', 'CSE'
  ];

  const btechDepartments = [
    'IT', 'CSE', 'ECE', 'ME', 'EIE', 'CE', 'EEE', 'AIML'
  ];

  useEffect(() => {
    if (filters.Type === 'MTech-Major') {
      setDepartments(mtechDepartments);
    } else if (filters.Type === 'BTech-Major') {
      setDepartments(btechDepartments);
    } else {
      setDepartments([]);
    }
  }, [filters.Type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchPerformed(true);
    setCurrentPage(1);
    searchProjects(filters);
  };

  async function searchProjects(query) {
    try {
      const res = await axios.post(`${backendURL}/filter`, { query: query }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(res.data);
      setFilteredProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setFilteredProjects([]);
    }
  }

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="catalog-container">
        <div className="catalog-card text-bg-dark">
          {/* <div className="catalog-background-image"></div> */}
          <div className="catalog-overlay"></div>
          <div className="card-img-overlay">
            <h1 className='p2'>CATALOG PROJECTS</h1>
            <p>Find, Learn, and Inspire with College Projects</p>
            <div className="container-fluid">
              <form className="filters" onSubmit={handleSubmit}>
                <div className="dropdown">
                  <select name="Type" value={filters.Type} onChange={handleChange} className="btn dropdown-button text-black bg-white">
                    <option value="">Select Type</option>
                    <option value="BTech-Major">BTech-Major</option>
                    <option value="MTech-Major">MTech-Major</option>
                  </select>
                </div>
                {filters.Type && (
                  <div className="dropdown ">
                    <select name="Department" value={filters.Department} onChange={handleChange} className="btn dropdown-button text-black bg-white">
                      <option value="">Select Department</option>
                      {departments.map((dept, index) => (
                        <option key={index} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="dropdown ">
                  <select name="Year" value={filters.Year} onChange={handleChange} className="btn dropdown-button text-black bg-white">
                    <option value="">Select Year</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-danger">Filter</button>
              </form>
              {searchPerformed && (
                <div className="selected-filters">
                  <h5 className='text-center pb-4'>Selected Filters</h5>
                  <ul className='text-center'>
                    {filters.Type && <li>Type: {filters.Type}</li>}
                    {filters.Department && <li>Department: {filters.Department}</li>}
                    {filters.Year && <li>Year: {filters.Year}</li>}
                  </ul>
                </div>
              )}
              {searchPerformed && filteredProjects.length === 0 ? (
                <div className="no-projects">The Data Will Update Soon</div>
              ) : (
                searchPerformed && (
                  <>
                    <Pagination
                      projectsPerPage={projectsPerPage}
                      totalProjects={filteredProjects.length}
                      paginate={paginate}
                      currentPage={currentPage}
                    />
                    <div className="project-list">
                      {currentProjects.map((project, index) => (
                        <DetailsCard1
                          key={index}
                          data={project}
                        />
                      ))}
                    </div>
                    <Pagination
                      projectsPerPage={projectsPerPage}
                      totalProjects={filteredProjects.length}
                      paginate={paginate}
                      currentPage={currentPage}
                    />
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catalog;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Filter, Search, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
// import DetailsCard1 from '../detailsCard/DeatilsCard1';

// const Catalog = () => {
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [filters, setFilters] = useState({
//     Type: '',
//     Department: '',
//     Year: ''
//   });
//   const [departments, setDepartments] = useState([]);
//   const [searchPerformed, setSearchPerformed] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const projectsPerPage = 25;

//   const mtechDepartments = [
//     'CE-SE', 'CE-HE', 'CE-GTE', 'EE-PE', 'EE-PS', 'ME-CC', 'ME-AMS', 
//     'EE-ES', 'EE-VLSI', 'CSE-SE', 'CSE-CNIS', 'EIE', 'CSE'
//   ];

//   const btechDepartments = [
//     'IT', 'CSE', 'ECE', 'ME', 'EIE', 'CE', 'EEE', 'AIML'
//   ];

//   useEffect(() => {
//     setDepartments(filters.Type === 'MTech-Major' ? mtechDepartments : 
//                   filters.Type === 'BTech-Major' ? btechDepartments : []);
//   }, [filters.Type]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (name === 'Type') {
//       setFilters(prev => ({ ...prev, Department: '' }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSearchPerformed(true);
//     setCurrentPage(1);
//     setLoading(true);
//     setError('');

//     try {
//       const response = await axios.post('http://10.45.8.73:5000/filter', 
//         { query: filters },
//         { headers: { 'Content-Type': 'application/json' }}
//       );
//       setFilteredProjects(Array.isArray(response.data) ? response.data : []);
//     } catch (err) {
//       setError('Failed to fetch projects. Please try again.');
//       setFilteredProjects([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const indexOfLastProject = currentPage * projectsPerPage;
//   const indexOfFirstProject = indexOfLastProject - projectsPerPage;
//   const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
//   const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

//   const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//     return (
//       <div className="flex items-center justify-center gap-2 mt-8">
//         <button
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <ChevronLeft className="w-5 h-5" />
//         </button>
        
//         <div className="flex gap-1">
//           {[...Array(totalPages)].map((_, i) => (
//             <button
//               key={i + 1}
//               onClick={() => onPageChange(i + 1)}
//               className={`w-8 h-8 rounded-lg ${
//                 currentPage === i + 1
//                   ? 'bg-blue-500 text-white'
//                   : 'hover:bg-gray-100'
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>

//         <button
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <ChevronRight className="w-5 h-5" />
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="relative bg-blue-600 text-white px-8 py-16">
//             <div className="relative z-10">
//               <div className="flex items-center justify-center gap-3 mb-4">
//                 <BookOpen className="w-8 h-8" />
//                 <h1 className="text-4xl font-bold">Project Catalog</h1>
//               </div>
//               <p className="text-center text-blue-100 mb-8">
//                 Discover and explore innovative college projects
//               </p>

//               <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <select
//                     name="Type"
//                     value={filters.Type}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm
//                       border border-white/20 text-white placeholder-white/60
//                       focus:outline-none focus:ring-2 focus:ring-white/50"
//                   >
//                     <option value="" className="text-gray-900">Select Type</option>
//                     <option value="BTech-Major" className="text-gray-900">BTech-Major</option>
//                     <option value="MTech-Major" className="text-gray-900">MTech-Major</option>
//                   </select>

//                   <select
//                     name="Department"
//                     value={filters.Department}
//                     onChange={handleChange}
//                     disabled={!filters.Type}
//                     className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm
//                       border border-white/20 text-white placeholder-white/60
//                       focus:outline-none focus:ring-2 focus:ring-white/50
//                       disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <option value="" className="text-gray-900">Select Department</option>
//                     {departments.map((dept) => (
//                       <option key={dept} value={dept} className="text-gray-900">
//                         {dept}
//                       </option>
//                     ))}
//                   </select>

//                   <select
//                     name="Year"
//                     value={filters.Year}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm
//                       border border-white/20 text-white placeholder-white/60
//                       focus:outline-none focus:ring-2 focus:ring-white/50"
//                   >
//                     <option value="" className="text-gray-900">Select Year</option>
//                     {[2020, 2021, 2022, 2023, 2024].map((year) => (
//                       <option key={year} value={year} className="text-gray-900">
//                         {year}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="mt-6 w-full md:w-auto px-8 py-3 bg-white text-blue-600 rounded-lg
//                     font-semibold flex items-center justify-center gap-2 hover:bg-blue-50
//                     focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50
//                     disabled:cursor-not-allowed transition-colors duration-200"
//                 >
//                   <Filter className="w-5 h-5" />
//                   {loading ? 'Searching...' : 'Apply Filters'}
//                 </button>
//               </form>
//             </div>
//           </div>

//           <div className="p-8">
//             {error && (
//               <div className="flex items-center justify-center gap-2 text-red-500 mb-6">
//                 <AlertCircle className="w-5 h-5" />
//                 <p>{error}</p>
//               </div>
//             )}

//             {searchPerformed && (
//               <div className="mb-8">
//                 <h2 className="text-xl font-semibold mb-4">Active Filters</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {Object.entries(filters).map(([key, value]) => 
//                     value && (
//                       <div key={key} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
//                         {key}: {value}
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>
//             )}

//             {searchPerformed && filteredProjects.length === 0 && !loading && !error ? (
//               <div className="text-center py-12">
//                 <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500">No projects found matching your criteria</p>
//               </div>
//             ) : (
//               searchPerformed && (
//                 <>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {currentProjects.map((project, index) => (
//                       <DetailsCard1 key={index} data={project} />
//                     ))}
//                   </div>
                  
//                   {totalPages > 1 && (
//                     <Pagination
//                       currentPage={currentPage}
//                       totalPages={totalPages}
//                       onPageChange={setCurrentPage}
//                     />
//                   )}
//                 </>
//               )
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Catalog;