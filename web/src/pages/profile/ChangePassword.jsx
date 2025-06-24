import React from "react";
import PageWrapper from "../../components/PageWrapper";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { logoutAction } from "../../redux/slice/authSlice";
import { useDispatch } from "react-redux";
import { changePasswordAPI } from "../../services/users/userServices";
import AlertMessage from "../../components/alert/AlertMessage";
import * as Yup from "yup";

const validationSchema = Yup.object({
  old_password: Yup.string().min(8, "Old password must be at least 8 characters long").required("Old password is required"),
  new_password: Yup.string().min(8, "New password must be at least 8 characters long").required("New password is required"),
});

const ChangePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {mutateAsync, isPending, isError, error, isSuccess} = useMutation({
    mutationFn: changePasswordAPI,
    mutationKey: ["change-password"]
  });

  const formik = useFormik({
    initialValues: {
      old_password: "",
      new_password: "",
    },
    validationSchema,
    //Submit
    onSubmit: (values) => {
      mutateAsync(values)
        .then(data => {
          dispatch(logoutAction());
          localStorage.removeItem("userInfo");
          navigate("/login");
        })
        .catch(e => console.log(e));
      },
    });

  return (
    <PageWrapper>
      <div className="pt-28 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Change Password</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
          {isPending && <AlertMessage type="loading" message="please wait..." />}
          {isError && <AlertMessage type="error" message={error.response.data.error} />}
          {isSuccess && <AlertMessage type="success" message="Change password successfully" />}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="current-password"
            >
              Old Password
            </label>
            <input
              id="old_password"
              type="password"
              {...formik.getFieldProps("old_password")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter old password"
            />
            {formik.touched.old_password && formik.errors.old_password && (
              <span className="text-xs text-red-500">{formik.errors.old_password}</span>
            )}
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="new-password"
            >
              New Password
            </label>
            <input
              id="new_password"
              type="password"
              {...formik.getFieldProps("new_password")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter new password"
            />
            {formik.touched.new_password && formik.errors.new_password && (
              <span className="text-xs text-red-500">{formik.errors.new_password}</span>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Change Password
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default ChangePassword;
