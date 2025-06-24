import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import AlertMessage from "../../components/alert/AlertMessage"
import { signUpAPI } from "../../services/users/userServices";
import { getUser } from "../../utils/getUser";

//Validations
const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .required("Password is required"),
});

const SignUp = () => {
  const user = getUser();

  const {mutate, isPending, isError, error, isSuccess} = useMutation({
      mutationFn: signUpAPI,
      mutationKey: ["Sign-up"]
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email:"",
      password:"",
    },
    validationSchema,
    onSubmit: values => {
      mutate(values);
    }
  });

  return (
    <PageWrapper>
      {user && <Navigate to="/" replace />}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl font-bold mb-8">Sign Up</h1>

        <form onSubmit={formik.handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          {isPending && <AlertMessage type="loading" message="please wait..." />}
          {isError && <AlertMessage type="error" message={error.response.data.error} />}
          {isSuccess && <AlertMessage type="success" message="Sign up successfully, please check your email to activate your account" />}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              type="text"
              {...formik.getFieldProps("username")}
              className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your username"
            />
            {formik.touched.username && formik.errors.username && (
              <span className="text-xs text-red-500">{formik.errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your email"
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-xs text-red-500">{formik.errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                {...formik.getFieldProps("password")}
                className="w-full border rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your password"
                type="password"
              />
              {formik.touched.password && formik.errors.password && (
                <span className="text-xs text-red-500">{formik.errors.password}</span>
              )}
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="bg-black text-white font-semibold py-2 rounded-full shadow hover:opacity-90 transition-all"
          >
            Sign Up
          </button>

          {/* Already have account */}
          <p className="text-center text-sm mt-2">
            Have an account?{" "}
            <Link to="/login" className="text-green-600 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </PageWrapper>
  );
};

export default SignUp;
