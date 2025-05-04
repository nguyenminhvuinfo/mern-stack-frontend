import { useState } from "react";
import { Container, Input, VStack, Button, Heading, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/user";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const toast = useToast();
  const navigate = useNavigate();
  
  const { register, isLoading } = useAuthStore();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const result = await register(formData);

    if (result.success) {
      toast({
        title: "Đăng ký thành công",
        description: "Bạn có thể đăng nhập ngay bây giờ.",
        status: "success",
        isClosable: true,
      });
      navigate("/login"); 
    } else {
      toast({
        title: "Lỗi đăng ký",
        description: result.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="sm" mt={10}>
      <VStack spacing={6}>
        <Heading>Đăng ký</Heading>
        <Input
          placeholder="Họ tên"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          placeholder="Mật khẩu"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        <Button 
          w="full" 
          colorScheme="teal" 
          onClick={handleRegister}
          isLoading={isLoading}
        >
          Đăng ký
        </Button>
        <Button variant="link" colorScheme="blue" onClick={() => navigate("/login")}>
          Đã có tài khoản? Đăng nhập
        </Button>
      </VStack>
    </Container>
  );
};

export default RegisterPage;