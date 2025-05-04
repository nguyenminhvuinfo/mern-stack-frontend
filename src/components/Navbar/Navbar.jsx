import { Box, Button, Container, Flex, HStack, Text, Input, useColorMode, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, Icon } from '@chakra-ui/react';
import { Link, useNavigate } from "react-router-dom";
import { PlusSquareIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FaUser, FaClipboardList, FaReceipt, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { useAuthStore } from "../../store/user";
import { useDisclosure } from '@chakra-ui/react';
import AuditLogs from './AuditLogs';
import TransactionHistory from './TransactionHistory';
import RevenueStatistics from './RevenueStatistics';

const Navbar = ({ onSearch }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("gray.100", "gray.900");
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  
  // Modal controls
  const { 
    isOpen: isAuditLogOpen, 
    onOpen: onAuditLogOpen, 
    onClose: onAuditLogClose 
  } = useDisclosure();
  
  const {
    isOpen: isTransactionHistoryOpen,
    onOpen: onTransactionHistoryOpen,
    onClose: onTransactionHistoryClose
  } = useDisclosure();

  const {
    isOpen: isRevenueStatisticsOpen,
    onOpen: onRevenueStatisticsOpen,
    onClose: onRevenueStatisticsClose
  } = useDisclosure();

  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box position="sticky" top="0" zIndex="999" bg={bg} boxShadow="sm" w="100%">
      <Container maxW="1140px" px={4} py={2}>
        <Flex h={16} alignItems="center" justifyContent="space-between" flexDir={{ base: "column", sm: "row" }} px={2}>
          {/* Logo */}
          <Text fontSize={{ base: "22", sm: "28" }} fontWeight="bold" textTransform="uppercase" textAlign="center" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
            <Link to="/">Sukem Store 🛒</Link>
          </Text>

          {/* Thanh Tìm kiếm */}
          <Input placeholder="Tìm tên sản phẩm..." onChange={handleChange} bg={useColorModeValue("white", "gray.700")} w={{ base: "100%", sm: "500px" }} />

          {/* Nút tạo, đổi màu và tài khoản */}
          <HStack spacing={2}>
            <Link to="/create">
              <Button>
                <PlusSquareIcon fontSize={20} />
              </Button>
            </Link>
            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
            </Button>
            
            {/* Menu quản lý tài khoản */}
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                <Icon as={FaUser} />
              </MenuButton>
              <MenuList>
                <Text px={3} py={1} fontSize="sm" color="gray.500">
                  Xin chào, {user?.name || user?.email || "Pháp sư vô danh"}
                </Text>
                <MenuItem icon={<FaClipboardList />} onClick={onAuditLogOpen}>
                  Nhật ký chỉnh sửa
                </MenuItem>
                <MenuItem icon={<FaReceipt />} onClick={onTransactionHistoryOpen}>
                  Lịch sử giao dịch
                </MenuItem>
                <MenuItem icon={<FaChartLine />} onClick={onRevenueStatisticsOpen}>
                  Thống kê doanh thu
                </MenuItem>
                <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                  Đăng xuất
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>

      {/* Modal Audit Log */}
      <AuditLogs isOpen={isAuditLogOpen} onClose={onAuditLogClose} />
      
      {/* Modal Transaction History */}
      <TransactionHistory isOpen={isTransactionHistoryOpen} onClose={onTransactionHistoryClose} />

      {/* Modal Revenue Statistics */}
      <RevenueStatistics isOpen={isRevenueStatisticsOpen} onClose={onRevenueStatisticsClose} />
    </Box>
  );
};

export default Navbar;