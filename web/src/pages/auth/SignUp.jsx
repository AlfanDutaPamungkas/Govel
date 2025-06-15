import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import PageWrapper from "../../components/PageWrapper";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl font-bold mb-8">Sign Up</h1>

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

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your email"
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
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="bg-black text-white font-semibold py-2 rounded-full shadow hover:opacity-90 transition-all"
          >
            Register
          </button>

          {/* Already have account */}
          <p className="text-center text-sm mt-2">
            Have an account?{" "}
            <Link to="/login" className="text-green-600 hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </PageWrapper>
  );
};

export default SignUp;
