import React from 'react'
import PageWrapper from "../../components/PageWrapper";
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { resetPasswordAPI } from '../../services/users/userServices';
import AlertMessage from "../../components/alert/AlertMessage"

// validation
const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .required("Password is required")
});

const ResetPassword = () => {
  const {token} = useParams();
  const navigate = useNavigate();

  const {mutateAsync, isPending, isError, error, isSuccess} = useMutation({
    mutationFn: resetPasswordAPI,
    mutationKey: ["Reset-password"]
  });

  const formik = useFormik({
    initialValues: {
      password:"",
    },
    validationSchema,
    onSubmit: values => {
      const data = {...values, token}
      mutateAsync(data)
        .then(data => {
            navigate("/login");
        })
        .catch(e => console.log(e));
    }
  });

  return (
    <PageWrapper>
      <div className="pt-28 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Reset Password</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
          {isPending && <AlertMessage type="loading" message="please wait..." />}
          {isError && <AlertMessage type="error" message={error.response.data.error} />}
          {isSuccess && <AlertMessage type="success" message="Reset password successfully" />}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="new-password"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              {...formik.getFieldProps("password")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter new password"
            />
            {formik.touched.password && formik.errors.password && (
              <span className="text-xs text-red-500">{formik.errors.password}</span>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </PageWrapper>
  )
}

export default ResetPassword
