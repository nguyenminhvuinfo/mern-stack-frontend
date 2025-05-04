import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "./store/user"; // Import store user

import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar/Navbar";

// Component bảo vệ route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      await checkAuth(); // Kiểm tra xác thực
      setIsChecking(false);
    };
    verify();
  }, [checkAuth]);

  if (isChecking) {
    return <Box textAlign="center" py={10}>Đang kiểm tra...</Box>; // Hoặc spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Chuyển hướng về login nếu không xác thực
  }

  return children;
};

function App() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // Kiểm tra xác thực mỗi khi component được render
  }, [checkAuth]);

  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar onSearch={setSearchKeyword} />
              <HomePage searchKeyword={searchKeyword} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <Navbar onSearch={setSearchKeyword} />
              <CreatePage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </Box>
  );
}

export default App;
