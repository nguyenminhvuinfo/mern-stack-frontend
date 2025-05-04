import {
  Box,
  HStack,
  Button,
  Divider,
  Icon,
  Select,
  Text
} from "@chakra-ui/react";
import { FaStickyNote, FaReceipt, FaQrcode } from "react-icons/fa";

const CheckOut = ({
  cart,
  updatePaymentMethod,
  handleCheckout,
  isProcessing,
  onOpenNote,
  buttonText
}) => {
  // Xác định nút thanh toán text và icon dựa trên phương thức thanh toán
  const payBtnText = cart.paymentMethod === "Chuyển khoản" ? "TẠO MÃ QR" : "THANH TOÁN";
  const payBtnIcon = cart.paymentMethod === "Chuyển khoản" ? FaQrcode : FaReceipt;

  return (
    <>
      <Divider mt={4} />
      
      <Box mt={4}>
        <Text fontSize="sm" mb={1}>Phương thức thanh toán:</Text>
        <Select 
          value={cart.paymentMethod} 
          onChange={(e) => updatePaymentMethod(e.target.value)}
          size="sm"
        >
          <option value="Tiền mặt">Tiền mặt</option>
          <option value="Chuyển khoản">Chuyển khoản</option>
          <option value="Thẻ tín dụng">Thẻ tín dụng</option>
        </Select>
      </Box>
      
      <HStack spacing={4} justify="space-between" mt={4}>
        <Button 
          colorScheme="blue" 
          width="48%" 
          leftIcon={<Icon as={FaStickyNote} />}
          onClick={onOpenNote}
        >
          Ghi chú
        </Button>
        <Button 
          colorScheme={"green"}
          width="48%" 
          leftIcon={<Icon as={payBtnIcon} />}
          onClick={handleCheckout}
          isLoading={isProcessing}
          loadingText="Đang xử lý"
          isDisabled={cart.items.length === 0 || isProcessing}
        >
          {payBtnText}
        </Button>
      </HStack>
    </>
  );
};

export default CheckOut;