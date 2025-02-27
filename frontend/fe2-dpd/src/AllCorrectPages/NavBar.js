// import React, { useState } from "react";
// import a from "../AllCorrectPages/images/duplica.png";
// import "./NavBar.css";
// import { Link } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { resetState } from "../REACT/SLICES/Userslice";
// import { resetState1 } from "../REACT/SLICES/PRCslice";
// import { useNavigate } from "react-router-dom";

// function NavBar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const NormalUser = useSelector((state) => state.User);
//   const Prc_User = useSelector((state) => state.PRC);

//   const isLoggedIn = NormalUser.loginStatus || Prc_User.loginStatus;

//   const handleLogout = () => {
//     dispatch(resetState());
//     dispatch(resetState1());
//     navigate("/login");
//   };

//   return (
//     <div className="bg-dark bg-gradient relative">
//       {/* Navbar Container */}
//       <div className="flex flex-wrap w-full p-2 justify-between items-center">
//         {/* Logo Section */}
//         <div className="flex items-center gap-1">
//           <img src={a} className="img11" alt="Logo" height="35px" width="35px" />
//           <p className="text-white font-semibold">DuplicaXpert</p>
//         </div>

//         {/* Hamburger Menu (Mobile) */}
//         <div className="md:hidden">
//           <button
//             className="relative w-8 h-8 flex flex-col justify-between items-center"
//             onClick={() => setIsOpen(!isOpen)}
//           >
//             {/* Top Line */}
//             <span
//               className={`block w-7 h-1 bg-white transition-transform origin-center duration-300 ${
//                 isOpen ? "rotate-45 translate-y-[14px]" : ""
//               }`}
//             ></span>
//             {/* Middle Line (Hidden when open) */}
//             <span
//               className={`block w-7 h-1 bg-white transition-opacity duration-300 ${
//                 isOpen ? "opacity-0" : "opacity-100"
//               }`}
//             ></span>
//             {/* Bottom Line */}
//             <span
//               className={`block w-7 h-1 bg-white transition-transform origin-center duration-300 ${
//                 isOpen ? "-rotate-45 -translate-y-[14px]" : ""
//               }`}
//             ></span>
//           </button>
//         </div>

//         {/* Desktop Navigation */}
//         <div className="hidden md:flex items-center gap-5">
//           <ul className="flex gap-5">
//             {["Home", "Catalog", "Contact"].map((item, index) => (
//               <li key={index} className="relative group">
//                 <a className="text-white p-0.5" href="/">
//                   {item}
//                 </a>
//                 <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
//               </li>
//             ))}
//           </ul>

//           {/* Conditional Rendering: Login/Register or Logout */}
//           {isLoggedIn ? (
//             <button
//               onClick={handleLogout}
//               className="text-white px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition"
//             >
//               Logout
//             </button>
//           ) : (
//             <div className="flex gap-3">
//               <Link
//                 to="/login"
//                 className="text-white px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="text-white px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 transition"
//               >
//                 Register
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile Dropdown Menu with Sliding Animation */}
//       <div
//         className={`absolute top-12 -right-1/4 w-40 h-screen bg-white p-5 transform transition-transform duration-300 ${
//           isOpen ? "translate-x-[-115px] z-50" : "translate-x-0 hidden"
//         }`}
//       >
//         <ul className="flex flex-col gap-5 text-center">
//           {["Home", "Catalog", "Contact"].map((item, index) => (
//             <li key={index} className="relative group">
//               <a className="text-lg" href="/">
//                 {item}
//               </a>
//               <span className="absolute left-1/2 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-1/2"></span>
//             </li>
//           ))}
//         </ul>

//         {/* Conditional Rendering: Login/Register or Logout (Mobile) */}
//         <div className="text-center mt-5">
//           {isLoggedIn ? (
//             <button
//               onClick={handleLogout}
//               className="text-white px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition"
//             >
//               Logout
//             </button>
//           ) : (
//             <div className="flex flex-col gap-3">
//               <Link
//                 to="/login"
//                 className="text-white px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="text-white px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 transition"
//               >
//                 Register
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default NavBar;
import React, { useState } from "react";
import a from "../AllCorrectPages/images/duplica.png";
import "./NavBar.css";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { resetState } from "../REACT/SLICES/Userslice";
import { resetState1 } from "../REACT/SLICES/PRCslice";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const NormalUser = useSelector((state) => state.User);
  const Prc_User = useSelector((state) => state.PRC);

  const isLoggedIn = NormalUser.loginStatus || Prc_User.loginStatus;
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Catalog", link: "/filtered" },
    { name: "Contact", link: "/contact" },
  ];
  const handleLogout = () => {
    dispatch(resetState());
    dispatch(resetState1());
    navigate("/login");
  };

  return (
    <div className="bg-dark bg-gradient relative">
      {/* Navbar Container */}
      <div className="flex flex-wrap w-full p-2 justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center gap-1">
          <img src={a} className="img11" alt="Logo" height="35px" width="35px" />
          <p className="text-white font-semibold">DuplicaXpert</p>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="md:hidden">
          <button
            className="relative w-8 h-8 flex flex-col justify-between items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span
              className={`block w-7 h-1 bg-white transition-transform origin-center duration-300 ${
                isOpen ? "rotate-45 translate-y-[14px]" : ""
              }`}
            ></span>
            <span
              className={`block w-7 h-1 bg-white transition-opacity duration-300 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`block w-7 h-1 bg-white transition-transform origin-center duration-300 ${
                isOpen ? "-rotate-45 -translate-y-[14px]" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">
        <ul className="flex gap-5">
  {navItems.map((item, index) => (
    <li key={index} className="relative group">
      <a className="text-white p-0.5" href={item.link}>
        {item.name}
      </a>
      <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
    </li>
  ))}
</ul>
          {/* Conditional Buttons */}
          {isLoggedIn && NormalUser.currentUser?.role === "student" && (
            <Link
              to="/studentview"
              className="text-white px-3 py-1 bg-purple-600 rounded-md hover:bg-purple-700 transition"
            >
              Student View
            </Link>
          )}

          {isLoggedIn && NormalUser.currentUser?.role === "faculty" && (
            <>
              <Link
                to="/fileupload"
                className="text-white px-3 py-1 bg-orange-600 rounded-md hover:bg-orange-700 transition"
              >
                Faculty View
              </Link>
              <Link
                to="/EditDeletePublish"
                className="text-white px-3 py-1 bg-yellow-600 rounded-md hover:bg-yellow-700 transition"
              >
                View
              </Link>
            </>
          )}


          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-white px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="text-white px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
