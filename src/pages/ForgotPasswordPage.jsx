import { useState } from "react";
import { 
  Container, 
  VStack, 
  Heading, 
  Input, 
  Button, 
  Text, 
  useToast, 
  FormControl,
  FormLabel,
  FormHelperText,
  Box
} from "@chakra-ui/react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/user";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Theo dõi các bước
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mã xác minh, 3: Đặt mật khẩu mới
  const [resetToken, setResetToken] = useState(null);
  
  const toast = useToast();
  const navigate = useNavigate();
  const { forgotPassword, verifyResetCode, resetPassword, isLoading } = useAuthStore();

  // Xử lý gửi email đặt lại mật khẩu
  const handleSendResetEmail = async () => {
    if (!email) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email của bạn.",
        status: "error",
        isClosable: true
      });
      return;
    }

    const result = await forgotPassword(email);
    
    if (result.success) {
      toast({
        title: "Thành công",
        description: result.message,
        status: "success",
        isClosable: true
      });
      setStep(2);
    } else {
      toast({
        title: "Lỗi",
        description: result.message,
        status: "error",
        isClosable: true
      });
    }
  };

  // Xử lý xác minh mã
  const handleVerifyCode = async () => {
    if (!resetCode) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã xác minh.",
        status: "error",
        isClosable: true
      });
      return;
    }

    const result = await verifyResetCode(email, resetCode);
    
    if (result.success) {
      toast({
        title: "Thành công",
        description: result.message,
        status: "success",
        isClosable: true
      });
      setResetToken(result.resetToken);
      setStep(3);
    } else {
      toast({
        title: "Lỗi",
        description: result.message,
        status: "error",
        isClosable: true
      });
    }
  };

  // Xử lý đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin.",
        status: "error",
        isClosable: true
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        status: "error",
        isClosable: true
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        status: "error",
        isClosable: true
      });
      return;
    }

    const result = await resetPassword(resetToken, newPassword);
    
    if (result.success) {
      toast({
        title: "Thành công",
        description: result.message,
        status: "success",
        isClosable: true,
        duration: 5000
      });
      // Chuyển hướng đến trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      toast({
        title: "Lỗi",
        description: result.message,
        status: "error",
        isClosable: true
      });
    }
  };

  // Gửi lại mã xác minh
  const handleResendCode = async () => {
    const result = await forgotPassword(email);
    
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Mã xác minh mới đã được gửi.",
        status: "success",
        isClosable: true
      });
    } else {
      toast({
        title: "Lỗi",
        description: result.message,
        status: "error",
        isClosable: true
      });
    }
  };

  return (
    <Container maxW="sm" mt={10}>
      <VStack spacing={6}>
        <Heading size="lg">Quên mật khẩu</Heading>

        {step === 1 && (
          <Box w="100%">
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
              />
              <FormHelperText>
                Chúng tôi sẽ gửi mã xác minh đến email của bạn.
              </FormHelperText>
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              w="full"
              onClick={handleSendResetEmail}
              isLoading={isLoading}
            >
              Gửi mã xác minh
            </Button>
            <Button 
              mt={2} 
              variant="link" 
              colorScheme="blue" 
              w="full"
              onClick={() => navigate("/login")}
            >
              Quay lại đăng nhập
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box w="100%">
            <FormControl id="resetCode" isRequired>
              <FormLabel>Mã xác minh</FormLabel>
              <Input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Nhập mã 6 chữ số"
              />
              <FormHelperText>
                Nhập mã 6 chữ số đã được gửi tới email của bạn.
              </FormHelperText>
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              w="full"
              onClick={handleVerifyCode}
              isLoading={isLoading}
            >
              Xác minh
            </Button>
            <Button 
              mt={2} 
              variant="link" 
              colorScheme="blue" 
              w="full"
              onClick={handleResendCode}
            >
              Gửi lại mã
            </Button>
            <Button 
              mt={2} 
              variant="link" 
              colorScheme="gray" 
              w="full"
              onClick={() => setStep(1)}
            >
              Quay lại
            </Button>
          </Box>
        )}

        {step === 3 && (
          <Box w="100%">
            <FormControl id="newPassword" isRequired mb={4}>
              <FormLabel>Mật khẩu mới</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </FormControl>
            <FormControl id="confirmPassword" isRequired>
              <FormLabel>Xác nhận mật khẩu</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
              />
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              w="full"
              onClick={handleResetPassword}
              isLoading={isLoading}
            >
              Đặt lại mật khẩu
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default ForgotPasswordPage;