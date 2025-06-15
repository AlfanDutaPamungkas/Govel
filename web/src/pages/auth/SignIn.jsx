import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import PageWrapper from "../../components/PageWrapper";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl font-bold mb-8">Sign In</h1>

        <form className="w-full max-w-sm flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Link
              to="/forgot-password"
              className="text-xs text-red-500 mt-1 inline-block"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Log In Button */}
          <button
            type="submit"
            className="bg-black text-white font-semibold py-2 rounded-full shadow hover:opacity-90 transition-all"
          >
            Log In
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm mt-2">
            Don’t have an account yet?{" "}
            <Link to="/register" className="text-green-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </PageWrapper>
  );
};

export default SignIn;
