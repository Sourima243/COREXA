import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = {
  patient: "/patient",
  doctor: "/doctor",
  admin: "/admin",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={user ? roleHome[user.role] : "/"} className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">
            +
          </span>
          <span className="font-semibold text-lg text-gray-800">HealthTrack</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {user.name} <span className="capitalize text-brand-600">({user.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
