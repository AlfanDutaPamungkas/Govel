import React from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { forgotPasswordAPI } from "../../services/users/userServices";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import AlertMessage from "../../components/alert/AlertMessage"

// validation
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
});

const ForgotPassword = () => {
  const {mutate, isPending, isError, error, isSuccess} = useMutation({
    mutationFn: forgotPasswordAPI,
    mutationKey: ["Forgot-password"]
  });

  const formik = useFormik({
    initialValues: {
      email:"",
    },
    validationSchema,
    onSubmit: values => {
      mutate(values);
    }
  });

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-red-600 text-center mb-4">
          Forgot your password?
        </h1>
        <p className="text-center text-gray-700 mb-6">
          Enter your email address for a link to reset your password
        </p>

        <form onSubmit={formik.handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          {isPending && <AlertMessage type="loading" message="please wait..." />}
          {isError && <AlertMessage type="error" message={error.response.data.error} />}
          {isSuccess && <AlertMessage type="success" message="Please check your email to reset your password" />}

          {/* Email input */}
          <input
            id="email"
            type="email"
            {...formik.getFieldProps("email")}
            className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your email here..."
          />
          {formik.touched.email && formik.errors.email && (
              <span className="text-xs text-red-500">{formik.errors.email}</span>
          )}
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
