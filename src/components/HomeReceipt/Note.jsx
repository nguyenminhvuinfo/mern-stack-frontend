import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Textarea,
    useDisclosure
  } from "@chakra-ui/react";
  import { useState, useEffect } from "react";
  
  const Note = ({ note, setNote, isModalOpen, onModalClose }) => {
    const [tempNote, setTempNote] = useState("");
    
    // Update tempNote whenever the modal opens with the current note
    useEffect(() => {
      if (isModalOpen) {
        setTempNote(note);
      }
    }, [isModalOpen, note]);
    
    const handleSave = () => {
      setNote(tempNote);
      onModalClose();
    };
    
    return (
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ghi chú cho hóa đơn</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Nhập ghi chú cho hóa đơn này..."
              size="md"
              rows={5}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Lưu ghi chú
            </Button>
            <Button variant="ghost" onClick={onModalClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default Note;