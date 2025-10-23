// import {
//   Sun,
//   Moon,
//   Menu,
//   X,
//   User,
//   LogOut,
//   LayoutDashboard,
// } from "lucide-react";
// import { useState } from "react";
// import { useTheme } from "../contexts/ThemeContext";
// import { useAuth } from "../contexts/AuthContext";

// interface HeaderProps {
//   onAuthClick: () => void;
//   onDashboardClick: () => void;
//   onAdminClick: () => void;
// }

// export default function Header({
//   onAuthClick,
//   onDashboardClick,
//   onAdminClick,
// }: HeaderProps) {
//   const { theme, toggleTheme } = useTheme();
//   const { user, profile, signOut, isAdmin } = useAuth();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);

//   const scrollToSection = (id: string) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       setMobileMenuOpen(false);
//     }
//   };

//   return (
//     <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <h1 className="text-xl font-bold text-orange-500">
//               JAPS Swaminarayan Mandir
//             </h1>
//           </div>

//           <nav className="hidden md:flex items-center space-x-8">
//             <button
//               onClick={() => scrollToSection("hero")}
//               className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
//             >
//               Home
//             </button>
//             <button
//               onClick={() => scrollToSection("about")}
//               className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
//             >
//               About
//             </button>
//             <button
//               onClick={() => scrollToSection("calendar")}
//               className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
//             >
//               Calendar
//             </button>
//             <button
//               onClick={() => scrollToSection("booking")}
//               className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
//             >
//               Book Now
//             </button>
//             <button
//               onClick={() => scrollToSection("contact")}
//               className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
//             >
//               Contact
//             </button>
//           </nav>

//           <div className="flex items-center space-x-4">
//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//               aria-label="Toggle theme"
//             >
//               {theme === "light" ? (
//                 <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
//               ) : (
//                 <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
//               )}
//             </button>

//             {user ? (
//               <div className="relative">
//                 <button
//                   onClick={() => setUserMenuOpen(!userMenuOpen)}
//                   className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//                 >
//                   <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
//                   <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
//                     {profile?.full_name || "User"}
//                   </span>
//                 </button>

//                 {userMenuOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700">
//                     <button
//                       onClick={() => {
//                         onDashboardClick();
//                         setUserMenuOpen(false);
//                       }}
//                       className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                     >
//                       <LayoutDashboard className="w-4 h-4" />
//                       <span>My Bookings</span>
//                     </button>
//                     {isAdmin && (
//                       <button
//                         onClick={() => {
//                           onAdminClick();
//                           setUserMenuOpen(false);
//                         }}
//                         className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                       >
//                         <LayoutDashboard className="w-4 h-4" />
//                         <span>Admin Dashboard</span>
//                       </button>
//                     )}
//                     <button
//                       onClick={() => {
//                         signOut();
//                         setUserMenuOpen(false);
//                       }}
//                       className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       <span>Sign Out</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <button
//                 onClick={onAuthClick}
//                 className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
//               >
//                 Sign In
//               </button>
//             )}

//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//             >
//               {mobileMenuOpen ? (
//                 <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
//               ) : (
//                 <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
//               )}
//             </button>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
//             <button
//               onClick={() => scrollToSection("hero")}
//               className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
//             >
//               Home
//             </button>
//             <button
//               onClick={() => scrollToSection("about")}
//               className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
//             >
//               About
//             </button>
//             <button
//               onClick={() => scrollToSection("calendar")}
//               className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
//             >
//               Calendar
//             </button>
//             <button
//               onClick={() => scrollToSection("booking")}
//               className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
//             >
//               Book Now
//             </button>
//             <button
//               onClick={() => scrollToSection("contact")}
//               className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
//             >
//               Contact
//             </button>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }


import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onAuthClick: () => void;
  onDashboardClick: () => void;
  onAdminClick: () => void;
}

export default function Header({
  onAuthClick,
  onDashboardClick,
  onAdminClick,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO / TITLE */}
          <div className="flex items-center space-x-2">
            {/* Example logo (optional) */}
            {/* <img src="/logo.png" alt="Mandir Logo" className="w-8 h-8" /> */}
            <h1 className="text-xl font-bold text-orange-500">
              JAPS Swaminarayan Mandir
            </h1>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("calendar")}
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              Calendar
            </button>
            <button
              onClick={() => scrollToSection("booking")}
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              Book Now
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex items-center space-x-4">
            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* USER MENU / AUTH BUTTONS */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
                    {profile?.full_name || "User"}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        onDashboardClick();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>My Bookings</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onAdminClick();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onAuthClick}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onAdminClick}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Admin Login
                </button>
              </>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => scrollToSection("hero")}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("calendar")}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Calendar
            </button>
            <button
              onClick={() => scrollToSection("booking")}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Book Now
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Contact
            </button>

            {/* MOBILE AUTH BUTTONS */}
            {!user && (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onAuthClick}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onAdminClick}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Admin Login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
