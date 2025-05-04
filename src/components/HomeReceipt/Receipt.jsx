import {
  Box,
  Spacer, 
  Button, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  useColorModeValue,
  useDisclosure,
  Select,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Text
} from "@chakra-ui/react";
import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReceiptStore } from "../../store/receipt";
import { FaSignInAlt, FaTimes } from "react-icons/fa";
import Cart from "./Cart";
import Note from "./Note";
import CheckOut from "./CheckOut";
import QrPayment from "./QrPayment";

const Receipt = forwardRef(({ isAuthenticated, user }, ref) => {
  const componentId = useRef(`receipt-${Math.random().toString(36).substring(2, 9)}`).current;
  const { createReceipt } = useReceiptStore();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Helper function để tạo ID hóa đơn theo định dạng mới
  const generateInvoiceId = (cartIndex) => {
    return `${componentId}-${cartIndex + 1}`; // Thêm component ID để tránh xung đột
  };
  
  const [carts, setCarts] = useState(() => {
    return [{
      id: 1, 
      items: [], 
      note: "", 
      paymentMethod: "Tiền mặt",
      paymentStatus: "Chưa thanh toán",
      invoiceNumber: `${componentId}-1`, // Đảm bảo ID duy nhất
      date: new Date(),
      totalAmount: 0
    }];
  });
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOpen: isNoteOpen, onOpen: onNoteOpen, onClose: onNoteClose } = useDisclosure();
  const { isOpen: isQrOpen, onOpen: onQrOpen, onClose: onQrClose } = useDisclosure();
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  // Thêm state để lưu trữ cart đang hiển thị QR
  const [qrActiveCart, setQrActiveCart] = useState(null);
  
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const bgHover = useColorModeValue("gray.50", "gray.700");
  const bgGreet = useColorModeValue("gray.200", "gray.700");

  const addToCart = (product) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex] };
      
      const existingItemIndex = activeCart.items.findIndex(item => item.productId === product._id);
      
      if (existingItemIndex === -1) {
        activeCart.items.push({
          productId: product._id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          total: product.price
        });
      }
      
      activeCart.totalAmount = activeCart.items.reduce((sum, item) => sum + item.total, 0);
      newCarts[activeTabIndex] = activeCart;
      return newCarts;
    });
  };

  const increaseQuantity = (itemIndex) => {
    setCarts(prev =>
      prev.map((cart, idx) => {
        if (idx !== activeTabIndex) return cart;
        const items = cart.items.map((it, i) =>
          i === itemIndex
            ? { 
                ...it,
                quantity: it.quantity + 1,
                total: (it.quantity + 1) * it.price
              }
            : it
        );
        return {
          ...cart,
          items,
          totalAmount: items.reduce((sum, it) => sum + it.total, 0)
        };
      })
    );
  };
    
  const decreaseQuantity = (itemIndex) => {
    setCarts(prev =>
      prev.map((cart, idx) => {
        if (idx !== activeTabIndex) return cart;
        const items = cart.items.map((it, i) => {
          if (i !== itemIndex) return it;
          const newQty = Math.max(it.quantity - 1, 1);
          return {
            ...it,
            quantity: newQty,
            total: newQty * it.price
          };
        });
        return {
          ...cart,
          items,
          totalAmount: items.reduce((sum, it) => sum + it.total, 0)
        };
      })
    );
  };

  const removeItem = (itemIndex) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex] };
      
      activeCart.items = activeCart.items.filter((_, index) => index !== itemIndex);
      activeCart.totalAmount = activeCart.items.reduce((sum, item) => sum + item.total, 0);
      
      newCarts[activeTabIndex] = activeCart;
      return newCarts;
    });
  };

  const createNewBill = () => {
    const newCartId = carts.length + 1;
    setCarts([...carts, { 
      id: newCartId, 
      items: [], 
      note: "",
      paymentMethod: "Tiền mặt",
      paymentStatus: "Chưa thanh toán",
      invoiceNumber: generateInvoiceId(carts.length),
      date: new Date(),
      totalAmount: 0
    }]);
    setActiveTabIndex(carts.length);
  };

  const removeCart = (cartIndex) => {
    if (cartIndex === 0) return;
    setCarts(prevCarts => {
      const newCarts = prevCarts.filter((_, index) => index !== cartIndex);
      if (activeTabIndex === cartIndex) {
        setActiveTabIndex(cartIndex - 1);
      } else if (activeTabIndex > cartIndex) {
        setActiveTabIndex(activeTabIndex - 1);
      }
      return newCarts;
    });
  };

  const setNote = (newNote) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      newCarts[activeTabIndex] = {
        ...newCarts[activeTabIndex],
        note: newNote
      };
      return newCarts;
    });
  };

  const updatePaymentMethod = (method) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      newCarts[activeTabIndex] = {
        ...newCarts[activeTabIndex],
        paymentMethod: method
      };
      return newCarts;
    });
  };

  useImperativeHandle(ref, () => {
    return {
      addToCart,
      cleanup: () => {
      }
    };
  });

  const redirectToLogin = () => {
    navigate("/login");
  };

  const handleActionButton = () => {
    if (carts[activeTabIndex].items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isAuthenticated) {
      setShowAuthAlert(true);
      return;
    }

    const activeCart = carts[activeTabIndex];
    
    // Lưu cart hiện tại vào state để sử dụng cho QR modal
    setQrActiveCart({...activeCart});
    
    // Kiểm tra phương thức thanh toán
    if (activeCart.paymentMethod === "Chuyển khoản") {
      // Mở modal QR
      onQrOpen();
    } else {
      // Xử lý thanh toán tiền mặt
      handleCheckout();
    }
  };

  const handleQrPaymentComplete = () => {
    // Sau khi người dùng xác nhận đã thanh toán qua QR, tiến hành xử lý thanh toán
    handleCheckout();
    // Đóng modal QR
    onQrClose();
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    const userId = user?._id;
    
    if (!userId) {
      toast({
        title: "Lỗi thông tin người dùng",
        description: "Không thể xác định thông tin người dùng, vui lòng đăng nhập lại",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsProcessing(false);
      return;
    }
    
    const activeCart = carts[activeTabIndex];
    
    const receiptData = {
      products: activeCart.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        total: item.total
      })),
      userId: userId,
      paymentMethod: activeCart.paymentMethod,
      paymentStatus: "Đã thanh toán",
      note: activeCart.note,
      totalAmount: activeCart.totalAmount
    };
    
    try {
      const result = await createReceipt(receiptData);
      
      if (result.success) {
        setCarts(prevCarts => {
          const newCarts = [...prevCarts];
          newCarts[activeTabIndex] = {
            ...newCarts[activeTabIndex],
            items: [],
            note: "",
            paymentMethod: "Tiền mặt",
            paymentStatus: "Chưa thanh toán",
            totalAmount: 0,
            date: new Date(),
          };
          return newCarts;
        });
        
        toast({
          title: "Thanh toán thành công",
          description: `Hóa đơn ${result.data.invoiceNumber || activeCart.invoiceNumber} đã được tạo`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Lỗi thanh toán",
          description: result.message || "Không thể tạo hóa đơn",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Đã có lỗi xảy ra, vui lòng thử lại sau",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box 
      flex="1" 
      borderWidth="1px" 
      borderRadius="lg" 
      p={4}
      shadow="md"
      bg={bgCard}
      borderColor={borderColor}
      height="fit-content"
      position="sticky"
      top="20px"
      minWidth="600px"
      width="100%"
    >
      {showAuthAlert && (
        <Alert 
          status="warning" 
          variant="solid" 
          mb={4}
          borderRadius="md"
        >
          <AlertIcon />
          <AlertTitle mr={2}>Bạn chưa đăng nhập!</AlertTitle>
          <AlertDescription>Cần đăng nhập để tạo hóa đơn.</AlertDescription>
          <Spacer />
          <Button 
            colorScheme="yellow" 
            size="sm" 
            leftIcon={<FaSignInAlt />}
            onClick={redirectToLogin}
          >
            Đăng nhập
          </Button>
          <Button 
            variant="outline" 
            colorScheme="white" 
            size="sm" 
            ml={2}
            onClick={() => setShowAuthAlert(false)}
          >
            Đóng
          </Button>
        </Alert>
      )}

      {isAuthenticated && user && (
        <Box mb={4} p={3} bg={bgGreet} borderRadius="md">
          <Text fontSize="sm" color={textColor}>
            Xin chào, <Text as="span" fontWeight="bold">{user.name || user.email}</Text>
          </Text>
        </Box>
      )}

      <Tabs variant="enclosed" index={activeTabIndex} onChange={setActiveTabIndex}>
        <TabList>
          {carts.map((cart, index) => (
            <Box key={cart.id} position="relative">
              <Tab pr={index > 0 ? 8 : 3}>
                HD {cart.id}
              </Tab>
              {index > 0 && (
                <IconButton
                  icon={<FaTimes />}
                  size="xs"
                  aria-label="Đóng hóa đơn"
                  position="absolute"
                  right={1}
                  top="50%"
                  transform="translateY(-50%)"
                  variant="ghost"
                  colorScheme="red"
                  zIndex={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCart(index);
                  }}
                />
              )}
            </Box>
          ))}
          <Tab onClick={createNewBill}>+</Tab>
        </TabList>
        <TabPanels>
          {carts.map((cart, cartIndex) => (
            <TabPanel key={cart.id} p={0} pt={4}>
              {/* Cart Component */}
              <Cart 
                cart={cart} 
                increaseQuantity={increaseQuantity} 
                decreaseQuantity={decreaseQuantity} 
                removeItem={removeItem}
                bgHover={bgHover}
                textColor={textColor}
              />
              
              {/* Checkout Component */}
              <CheckOut 
                cart={cart}
                updatePaymentMethod={updatePaymentMethod}
                handleCheckout={handleActionButton}
                isProcessing={isProcessing}
                onOpenNote={onNoteOpen}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {/* Note Component */}
      <Note 
        note={carts[activeTabIndex]?.note || ""} 
        setNote={setNote} 
        isModalOpen={isNoteOpen} 
        onModalClose={onNoteClose} 
      />

      {/* QR Payment Modal */}
      <QrPayment
        isOpen={isQrOpen}
        onClose={onQrClose}
        cart={qrActiveCart}
        onCompletePayment={handleQrPaymentComplete}
      />
    </Box>
  );
});

export default Receipt;