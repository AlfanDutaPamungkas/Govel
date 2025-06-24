import { motion } from "framer-motion";
import Footer from "./Footer";
import Navbar from "./navbar/Navbar";
import PublicNavbar from "./navbar/PublicNavbar";
import { useSelector } from "react-redux";

const PageWrapper = ({ children }) => {
  const user = useSelector(state => state?.auth?.user);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {user ? <Navbar/> : <PublicNavbar/>}
      {children}
      <Footer />
    </motion.div>
  );
};

export default PageWrapper;
