import React from "react";
import PageWrapper from "../../components/PageWrapper";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../../components/alert/AlertMessage";
import { updateProfileAPI } from "../../services/users/userServices";
import { useDispatch } from "react-redux";
import { logoutAction } from "../../redux/slice/authSlice";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {mutateAsync, isPending, isError, error, isSuccess} = useMutation({
    mutationFn: updateProfileAPI,
    mutationKey: ["update-profile"]
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
    },

    //Submit
    onSubmit: (values) => {
      mutateAsync(values)
        .then(data => {
          if (values.username){
            navigate("/profile")
          }

          if (values.email){
            dispatch(logoutAction());
            localStorage.removeItem("userInfo");
            navigate("/login");
          }
        })
        .catch(e => console.log(e));
    },
  });

  return (
    <PageWrapper>
      <div className="pt-28 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Update Profile</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
          {isPending && <AlertMessage type="loading" message="please wait..." />}
          {isError && <AlertMessage type="error" message={error.response.data.error} />}
          {isSuccess && <AlertMessage type="success" message="Update profile successfully" />}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              {...formik.getFieldProps("username")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter new username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter new email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default UpdateProfile;
