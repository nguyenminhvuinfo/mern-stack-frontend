import { create } from 'zustand';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAuditStore = create((set) => ({
  auditLogs: [],
  isLoading: false,
  error: null,

  fetchAuditLogs: async () => {
    set({ isLoading: true, error: null });
    const token = localStorage.getItem("token");

    if (!token) {
      set({ error: "Không có token, vui lòng đăng nhập.", isLoading: false });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auditlogs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();

      if (data.success) {
        set({ auditLogs: data.data, isLoading: false });
      } else {
        set({ error: "Không thể lấy nhật ký chỉnh sửa.", isLoading: false });
      }
    } catch (error) {
      set({ error: "Lỗi kết nối với server.", isLoading: false });
    }
  },
}));
