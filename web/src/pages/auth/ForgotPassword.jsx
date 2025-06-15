import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import PageWrapper from "../../components/PageWrapper";

const ForgotPassword = () => {
  return (
    <PageWrapper>
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-red-600 text-center mb-4">
          Forgot your password?
        </h1>
        <p className="text-center text-gray-700 mb-6">
          Enter your email address for a link to reset your password
        </p>

        <form className="w-full max-w-sm flex flex-col gap-4">
          {/* Email input */}
          <input
            type="email"
            className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your email here..."
          />

          {/* Send button */}
          <button
            type="submit"
            className="bg-black text-white font-semibold py-2 rounded-full shadow hover:opacity-90 transition-all"
          >
            Send
          </button>

          {/* Link to Sign Up */}
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

export default ForgotPassword;
