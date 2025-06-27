import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';
import Header from '@/components/organisms/Header';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 overflow-y-auto z-40">
          <div className="w-full p-6">
            <nav className="space-y-2">
              {routeArray.map(route => (
                <NavLink
                  key={route.id}
                  to={route.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'gradient-primary text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <ApperIcon 
                        name={route.icon} 
                        size={20} 
                        className={`transition-transform duration-200 ${
                          isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary'
                        }`}
                      />
                      <span>{route.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={closeMobileMenu}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                        <ApperIcon name="CheckSquare" size={16} className="text-white" />
                      </div>
                      <h1 className="text-xl font-display font-bold text-gray-900">TaskFlow</h1>
                    </div>
                    <button
                      onClick={closeMobileMenu}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ApperIcon name="X" size={20} className="text-gray-500" />
                    </button>
                  </div>
                  
                  <nav className="space-y-2">
                    {routeArray.map(route => (
                      <NavLink
                        key={route.id}
                        to={route.path}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                            isActive
                              ? 'gradient-primary text-white shadow-lg'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <ApperIcon 
                              name={route.icon} 
                              size={20} 
                              className={`transition-transform duration-200 ${
                                isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary'
                              }`}
                            />
                            <span>{route.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;