import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/url";
import PageWrapper from "../../components/PageWrapper";
import AlertMessage from "../../components/alert/AlertMessage";

const ConfirmationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await axios.put(`${BASE_URL}/users/activate/${token}`);
      console.log(response);
      if (response.status === 204) {
        setSuccessMsg("Account activated successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.error || "Failed to confirm token. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl font-bold mb-6">Confirm Your Account</h1>

        <div className="w-full max-w-sm flex flex-col gap-4">
          {loading && <AlertMessage type="loading" message="Processing..." />}
          {errorMsg && <AlertMessage type="error" message={errorMsg} />}
          {successMsg && <AlertMessage type="success" message={successMsg} />}

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-black text-white font-semibold py-2 rounded-full shadow hover:opacity-90 transition-all disabled:opacity-60"
          >
            {loading ? "Confirming..." : "Click to Confirm"}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ConfirmationPage;
