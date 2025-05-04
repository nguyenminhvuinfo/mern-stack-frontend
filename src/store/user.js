import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (credentials) => {
    if (!credentials.email || !credentials.password) {
      return { success: false, message: "Vui lòng nhập email và mật khẩu." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/authen/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!data.success) {
        set({ isLoading: false });
        return { success: false, message: data.message };
      } else {
        localStorage.setItem("token", data.token);
        set({ 
          user: data.user || {name: credentials.name} || { email: credentials.email },
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true, message: "Đăng nhập thành công" };
      }
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  register: async (userData) => {
    if (!userData.name || !userData.email || !userData.password) {
      return { success: false, message: "Vui lòng điền đầy đủ các trường." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/authen/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      set({ isLoading: false });

      return { 
        success: data.success, 
        message: data.success ? "Đăng ký thành công" : data.message 
      };
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return false;
    }
    
    try {
      // Kiểm tra token hợp lệ với backend (nếu có endpoint)
      const res = await fetch(`${API_BASE_URL}/api/authen/verify-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (data.success) {
        set({ isAuthenticated: true, user: data.user });
        return true;
      } else {
        localStorage.removeItem("token");
        set({ isAuthenticated: false, user: null });
        return false;
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      // Nếu không connect được server, giả định token vẫn hợp lệ
      set({ isAuthenticated: true });
      return true;
    }
  },
  
  // Thêm phương thức quên mật khẩu
  forgotPassword: async (email) => {
    if (!email) {
      return { success: false, message: "Vui lòng nhập email." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/authen/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      set({ isLoading: false });
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  // Phương thức xác minh mã reset
  verifyResetCode: async (email, resetCode) => {
    if (!email || !resetCode) {
      return { success: false, message: "Vui lòng nhập đầy đủ thông tin." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/authen/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode }),
      });

      const data = await res.json();
      set({ isLoading: false });
      
      return {
        success: data.success,
        message: data.message,
        resetToken: data.resetToken
      };
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  // Phương thức đổi mật khẩu mới
  resetPassword: async (resetToken, newPassword) => {
    if (!resetToken || !newPassword) {
      return { success: false, message: "Thông tin không hợp lệ." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/authen/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await res.json();
      set({ isLoading: false });
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  }
}));