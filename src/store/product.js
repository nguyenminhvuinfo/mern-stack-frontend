import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useProductStore = create((set) => ({
    products: [],
    setProducts: (products) => set({ products }),
    createProduct: async (newProduct) => {
        if (!newProduct.name || !newProduct.price || !newProduct.image){
            return {success: false, message:"Vui lòng điền đầy đủ thông tin sản phẩm."}
        }
        
        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            return {success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này."}
        }
        
        const res = await fetch(`${API_BASE_URL}/api/products`, {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization": `Bearer ${token}` // Thêm token vào header
            },
            body:JSON.stringify(newProduct),
        });
        const data = await res.json();
        
        if (!data.success) {
            return {success: false, message: data.message}
        }
        
        set((state) => ({ products: [...state.products, data.data] }));
        return {success: true, message:"Sản phẩm mới đã được tạo."}
    }, 
    fetchProducts: async () => {
        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        
        const headers = token 
            ? { "Authorization": `Bearer ${token}` } 
            : {};
            
        const res = await fetch(`${API_BASE_URL}/api/products`, {
            headers: headers
        });
        const data = await res.json();
        
        if (data.success) {
            set({ products: data.data });
        }
        return data;
    },
    deleteProduct: async(pid) =>{
        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            return {success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này."}
        }
        
        const res = await fetch(`${API_BASE_URL}/api/products/${pid}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}` // Thêm token vào header
            }
        });
        const data = await res.json();
        if(!data.success) return {success: false, message: data.message};

        // update UI ngay lập tức để ko cần refresh trang
        set((state) => ({ products: state.products.filter((product) => product._id !== pid) }));
        return {success: true, message: data.message};
    },
    updateProduct: async(pid, updatedProduct) =>{
        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            return {success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này."}
        }
        
        const res = await fetch(`${API_BASE_URL}/api/products/${pid}`,{
            method: "PUT",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Thêm token vào header
            },
            body: JSON.stringify(updatedProduct),
        });
        const data = await res.json();
        if (!data.success) return {success: false, message: data.message};
        
        // update UI ngay lập tức mà khum cần refresh
        set(state => ({ 
            products: state.products.map((product) => (product._id === pid ? data.data : product)),
        }));
        return {success: true, message: data.message};
    },
}));