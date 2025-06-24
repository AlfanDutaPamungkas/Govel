import { useQuery } from "@tanstack/react-query";
import { checkAdminAPI } from "../../services/users/userServices";
import { Navigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { getUser } from "../../utils/getUser";

const AdminRoute = ({ children }) => {
  const token = getUser();

  if (!token) {
    return (
      <PageWrapper>
        <div className="pt-28 px-6 max-w-3xl mx-auto text-center text-gray-500 italic">
          Anda belum login.
        </div>
      </PageWrapper>
    );
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-check"],
    queryFn: checkAdminAPI,
    retry: false,
  });

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="pt-28 px-6 max-w-3xl mx-auto text-center text-gray-500 italic">
          Memeriksa akses admin...
        </div>
      </PageWrapper>
    );
  }

  if (isError || data?.data !== "ok") {
    return (
      <PageWrapper>
        <div className="pt-28 px-6 max-w-3xl mx-auto text-center text-red-500 font-medium">
          Akses ditolak. Halaman ini hanya untuk admin.
        </div>
      </PageWrapper>
    );
  }

  return children;
};

export default AdminRoute;
