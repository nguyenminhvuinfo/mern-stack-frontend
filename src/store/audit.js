import { create } from 'zustand';

export const useAuditStore = create((set) => ({
  auditLogs: [],
  isLoading: false,
  error: null,

  // Hàm gọi API để lấy nhật ký
  fetchAuditLogs: async () => {
    set({ isLoading: true, error: null }); // Đặt trạng thái loading khi bắt đầu
    const token = localStorage.getItem("token");

    // Kiểm tra token trước khi thực hiện API
    if (!token) {
      set({ error: "Không có token, vui lòng đăng nhập.", isLoading: false });
      return;
    }

    try {
      const response = await fetch('/api/auditlogs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Gửi token trong header
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
