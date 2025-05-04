import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

const HotProducts = ({ receipts }) => {
  const [hotProducts, setHotProducts] = useState([]);
  const cardBg = useColorModeValue('white', 'gray.700');

  // Process hot products whenever receipts change
  useEffect(() => {
    if (!receipts || receipts.length === 0) return;
    
    try {
      const now = new Date();
      const productSales = {};
      
      // Create date objects for today, 7 days ago, and 30 days ago
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      
      const monthAgo = new Date();
      monthAgo.setDate(now.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);
      
      // Initialize product data structures
      receipts.forEach(receipt => {
        const receiptDate = new Date(receipt.date);
        
        receipt.products.forEach(product => {
          if (!productSales[product.productId]) {
            productSales[product.productId] = {
              name: product.productName,
              price: product.price,
              dailyQuantity: 0,
              weeklyQuantity: 0,
              monthlyQuantity: 0,
              quantity: 0,
              revenue: 0
            };
          }
          
          // Update quantities based on time periods
          if (receiptDate >= today) {
            productSales[product.productId].dailyQuantity += product.quantity;
          }
          
          if (receiptDate >= weekAgo) {
            productSales[product.productId].weeklyQuantity += product.quantity;
          }
          
          if (receiptDate >= monthAgo) {
            productSales[product.productId].monthlyQuantity += product.quantity;
            productSales[product.productId].quantity += product.quantity; // Total quantity
          }
          
          // Update revenue
          productSales[product.productId].revenue += product.price * product.quantity;
        });
      });

      // Find hot products that meet at least one of the criteria
      const hotProductsList = Object.keys(productSales)
        .map(id => ({ 
          id, 
          ...productSales[id] 
        }))
        .filter(product => 
          product.dailyQuantity >= 7 || 
          product.weeklyQuantity >= 30 || 
          product.monthlyQuantity >= 365
        )
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8); // Show top 8 products

      setHotProducts(hotProductsList);
    } catch (error) {
      console.error("Error processing hot products:", error);
      setHotProducts([]);
    }
  }, [receipts]);

  // Format number as Vietnamese currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', 'đ');
  };

  // Get badge color based on criteria met
  const getBadgeType = (product) => {
    if (product.dailyQuantity >= 7) return "red";
    if (product.weeklyQuantity >= 30) return "orange";
    if (product.monthlyQuantity >= 365) return "green";
    return "purple"; // Fallback color
  };

  return (
    <Box 
      p={4} 
      borderRadius="lg" 
      boxShadow="sm" 
      overflow="auto" 
      bg={cardBg}
    >
      <Heading size="md" mb={4}>
        Sản phẩm bán chạy
      </Heading>

      {hotProducts.length > 0 ? (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th width="40%">Sản phẩm</Th>
              <Th isNumeric width="20%">Đơn giá</Th>
              <Th isNumeric width="20%">Số lượng</Th>
              <Th isNumeric width="20%">Doanh thu</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hotProducts.map((product) => (
              <Tr key={product.id}>
                <Td noOfLines={1} title={product.name}>
                  {product.name}
                  <Badge ml={2} colorScheme={getBadgeType(product)}>Hot</Badge>
                </Td>
                <Td isNumeric>{formatCurrency(product.price)}</Td>
                <Td isNumeric>{product.quantity}</Td>
                <Td isNumeric>{formatCurrency(product.revenue)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>
          Không có sản phẩm bán chạy nào
        </Text>
      )}
    </Box>
  );
};

export default HotProducts;