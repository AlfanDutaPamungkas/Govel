import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { loginAction } from "../../redux/slice/authSlice";
import { useDispatch } from "react-redux";
import { signInAPI } from "../../services/users/userServices";
import AlertMessage from "../../components/alert/AlertMessage";
import { getUser } from "../../utils/getUser";

//! validations
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters long").required("Password is required"),
});

const SignIn = () => {
  const user = getUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {mutateAsync, isPending, isError, error, isSuccess} = useMutation({
    mutationFn: signInAPI,
    mutationKey: ["Sign-in"]
  });

  const formik = useFormik({
    initialValues: {
      email:"",
      password:"",
    },
    validationSchema,
    onSubmit: (values) => {
      mutateAsync(values)
        .then(data=>{
          dispatch(loginAction(data));
          localStorage.setItem("userInfo", JSON.stringify(data.data));
        })
        .catch(e => console.log(e));
    }
  });

  useEffect(() => {
  if (isSuccess) {
      setTimeout(() => {
        navigate("/profile");
        window.location.reload();
      }, 500);
    }
  }, [isSuccess]);

  return (
    <PageWrapper>
      {user && !isSuccess && <Navigate to="/" replace />}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl font-bold mb-8">Sign In</h1>

        <form onSubmit={formik.handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          {isPending && <AlertMessage type="loading" message="please wait..." />}
          {isError && <AlertMessage type="error" message={error.response.data.error} />}
          {isSuccess && <AlertMessage type="success" message="Sign in successfully" />}

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
                className="w-full border rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your password"
                type="password"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <span className="text-xs text-red-500">{formik.errors.password}</span>
              )}
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
            Sign In
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
