// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHandPaper, faSignOutAlt, faHouse, faClipboardCheck  } from '@fortawesome/free-solid-svg-icons';
// import { faThList, faBook, faFolderOpen, faArchive, faFileAlt } from '@fortawesome/free-solid-svg-icons';
// import './Navigation1.css';
// import a from '../../AllCorrectPages/images/duplica.png';
// import { useSelector } from 'react-redux';
// import Userslice from '../../REACT/SLICES/Userslice';
// import { resetState } from '../../REACT/SLICES/Userslice';
// import { resetState1 } from '../../REACT/SLICES/PRCslice';
// import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import '../../index.css'
// // npx tailwindcss -i ./src/index.css -o ./src/output.css --watch
// function Navigation1() {

//   const dispatch=useDispatch()
//   const navigate = useNavigate();
//   let [username, setUsername] = useState('');
//   const data=useSelector((state)=>state.User)
//   const data1=useSelector((state)=>state.PRC)
//   console.log(data.currentUser)
//   if(data.currentUser.name)
//   {
//     username=data.currentUser.name
//   }
//   else{
//     username=data1.currentUser.department
//   }
//   const handleLogout = () => {
//     dispatch(resetState())
//     dispatch(resetState1())
//     navigate('/login')
//   };
//   const Navigate=useNavigate()
//   useEffect(()=>{
//     if(data.loginStatus)
//     {
//       if(data.currentUser.role==='faculty')
//       {
       
//       }
//       else if(data.currentUser.role==='student')
//       {
//         Navigate('/')
//       }
//     }
//   },[])
//   let [display,setDisplay]=useState(false)
//   let [offdisplay,setOffDisplay]=useState(true)

//   return (
// <div class=" bg-dark bg-gradient navigation">
//   <div class="max-w-screen-xxl  flex-wrap  w-100 p-2 " style={{justifyContent:'space-between' ,display:'flex'}}>
//   <li className='title text-white '>
//           <div className='logoo d-flex justify-content-start gap-2 '> 
//           <img src={a} className='img11' alt='Logo' />
//           <p className='pt-1'>DuplicaXpert</p>
//           </div>
          
//         </li>
//         <div className='d-flex'>
//           <li className='nav-item'>
//             <Link className='nav-link zoom-effect' to='/'> 
//             <FontAwesomeIcon icon={faHouse} />
//             </Link>
//           </li>
//           <li className='nav-item'>
//             <Link className='nav-link zoom-effect' to='/catalog'>
//             <FontAwesomeIcon icon={faThList} />
//             </Link>
//           </li>
          
//           {offdisplay &&
//     <button data-collapse-toggle="navbar-hamburger" type="button" class="zoom-effect nav-link inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400  dark:focus:ring-gray-600" aria-controls="navbar-hamburger" aria-expanded="false"
//     onClick={()=>{setDisplay(true);setOffDisplay(false)}}
//     >
//       <span class="sr-only">Open main menu</span>
//       <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
//           <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
//       </svg>
//     </button>}
//     {
//       display &&
//       <button class="zoom-effect text-gray-500  focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg p-2  nav-link"
//       onClick={()=>{setDisplay(false);setOffDisplay(true)}}
//       >
//   <svg class={`w-6 h-6 cross ${display ? 'rotated':''} `}fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
//   </svg>
// </button>
//     }
//         </div>
   
     
//     </div>
//     {!display &&

   
//     <div class="display d-flex justify-content-end " id="">
//       <ul class="flex text-end  flex-col font-medium  rounded-lg  dark:bg-gray-800 dark:border-gray-700 w-25 ">
//         {/* <li>
//           <a href="#" class="block py-2 px-3 text-white bg-blue-700    dark:bg-blue-600" aria-current="page" onClick={()=>{setOffDisplay(true);setDisplay(false)}}>Home</a>
//         </li> */}
//         <li className='nav-item' class="block py-2 px-3  " aria-current="page" onClick={()=>{setOffDisplay(true);setDisplay(false)}}>
//                <Link className='nav-links text-black ' to='/login'>Login</Link>
//               </li>
//               <li className='nav-item' class="block py-2 px-3  " aria-current="page" onClick={()=>{setOffDisplay(true);setDisplay(false)}}>
//                <Link className='nav-links text-black' to='/register'>Register</Link> 
//               </li>
//                </ul>
//     </div>}
  
 
// </div>

  
//   );
// }

// export default Navigation1;
