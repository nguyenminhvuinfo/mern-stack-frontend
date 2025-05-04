import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Alert, AlertIcon, Image, Flex
} from '@chakra-ui/react';

const AuditLogs = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) fetchAuditLogs();
  }, [isOpen]);

  const fetchAuditLogs = async () => {
    setIsLoading(true); 
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không có token, vui lòng đăng nhập.");
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auditlogs', {
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        setError("Không thể lấy nhật ký.");
      }
    } catch {
      setError("Lỗi kết nối với server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format giá tiền từ số sang định dạng VNĐ
  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format ngày từ timestamp sang định dạng DD/MM/YYYY
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "N/A";
      
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error);
      return "N/A";
    }
  };

  // Hiển thị tên sản phẩm tại thời điểm thay đổi
  const getProductName = (log) => {
    if (log.action === 'DELETE') {
      return log.changes?.old?.name || "Sản phẩm không tồn tại hoặc đã bị xóa";
    }
    if (log.action === 'UPDATE' || log.action === 'CREATE') {
      return log.changes?.new?.name || log.product || "Không xác định";
    }
    return "Không xác định";
  };

  // Lấy thông tin thay đổi từ note hoặc từ product
  const extractChangeInfo = (log, field) => {
    const oldValue = log.changes?.old?.[field];
    const newValue = log.changes?.new?.[field];
    
    // Kiểm tra nếu giá trị cũ và mới giống nhau, không cần hiển thị sự thay đổi
    if (oldValue === newValue) return null;

    return oldValue !== undefined && newValue !== undefined ? { old: oldValue, new: newValue } : null;
  };

  // Render nội dung chi tiết với thông tin thay đổi
  const renderDetailContent = (log) => {
    // Đối với UPDATE, kiểm tra nếu không có sự thay đổi nào
    if (log.action === 'UPDATE') {
      const nameChange = extractChangeInfo(log, 'name');
      const priceChange = extractChangeInfo(log, 'price');
      const imageChange = extractChangeInfo(log, 'image');

      // Kiểm tra nếu tất cả các thay đổi đều không có sự thay đổi thực tế
      if (!nameChange && !priceChange && !imageChange) {
        return <div>Không có sự thay đổi nào</div>;
      }

      return (
        <>
          {nameChange && (
            <div>
              <strong>Tên sản phẩm:</strong> {nameChange.old} → {nameChange.new}
            </div>
          )}
          {priceChange && (
            <div>
              <strong>Giá tiền:</strong> {formatPrice(priceChange.old)} → {formatPrice(priceChange.new)}
            </div>
          )}
          {imageChange && (
            <div>
              <strong>Hình ảnh:</strong>
              {/* Hiển thị hình ảnh cũ và mới trên cùng một hàng */}
              <Flex align="center">
                <Image 
                  src={imageChange.old} 
                  alt="Old Image" 
                  boxSize="80px" 
                  objectFit="cover" 
                  fallbackSrc="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif" 
                  mr={2}
                />
                <span> → </span>
                <Image 
                  src={imageChange.new} 
                  alt="New Image" 
                  boxSize="80px" 
                  objectFit="cover" 
                  fallbackSrc="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif" 
                  ml={2}
                />
              </Flex>
            </div>
          )}
        </>
      );
    }

    // CREATE / DELETE: show full info
    return (
      <>
        <div><strong>Tên sản phẩm:</strong> {log.changes?.new?.name || log.changes?.old?.name || "Không xác định"}</div>
        <div>
          <strong>Giá tiền:</strong> {formatPrice(log.changes?.new?.price || log.changes?.old?.price)}
        </div>
        <div><strong>Hình ảnh:</strong>
          {/* Hiển thị hình ảnh */}
          <Image 
            src={log.changes?.new?.image || log.changes?.old?.image} 
            alt="Product Image" 
            boxSize="80px" 
            objectFit="cover" 
            fallbackSrc="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif" 
          />
        </div>
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="90%">
        <ModalHeader textAlign="center">Nhật ký chỉnh sửa</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Spinner size="xl" />
          ) : error ? (
            <Alert status="error"><AlertIcon />{error}</Alert>
          ) : (
            <Table variant="simple" colorScheme="blue" w="100%" overflow="hidden">
              <Thead>
                <Tr>
                  <Th width="15%" >Phương thức</Th>
                  <Th width="15%">User</Th>
                  <Th width="15%">Ngày chỉnh sửa</Th>
                  <Th width="20%">Sản phẩm</Th>
                  <Th width="35%" textAlign="center">Nội dung chi tiết</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.length ? logs.map((log) => (
                  <Tr key={log.timestamp}>
                    <Td color={log.action === 'CREATE' ? 'green.400' : log.action === 'UPDATE' ? 'blue.400' : 'red.400'}>
                      {log.action === 'CREATE' ? 'THÊM MỚI' :
                       log.action === 'UPDATE' ? 'CHỈNH SỬA' :
                       'XÓA BỎ'}
                    </Td>
                    <Td style={{ wordWrap: 'break-word', maxWidth: '15%' }}>{log.user}</Td>
                    <Td style={{ wordWrap: 'break-word', maxWidth: '15%' }}>
                      {formatDate(log.timestamp)}
                    </Td>
                    <Td style={{ wordWrap: 'break-word', maxWidth: '20%' }}>{getProductName(log)}</Td>
                    <Td style={{ wordWrap: 'break-word', maxWidth: '35%' }}>{renderDetailContent(log)}</Td>
                  </Tr>
                )) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center">Không có nhật ký nào.</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuditLogs;