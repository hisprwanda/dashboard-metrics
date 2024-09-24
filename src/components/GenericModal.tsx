// src/components/GenericModal/GenericModal.tsx
import React, { ReactNode } from 'react';
import { Modal, ModalTitle, ModalContent, ModalActions, Button, ButtonStrip } from '@dhis2/ui';

interface GenericModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    children: ReactNode;
    onCancel?: () => void;
}

const GenericModal: React.FC<GenericModalProps> = ({  isOpen, setIsOpen, children }) => {

    const handleClose = () => {
        setIsOpen(false);

    };

    return (
        <>
           
            {isOpen && (
              
   <Modal onClose={handleClose} position='middle' >
  
                <ModalContent   >{children}</ModalContent> 
                </Modal>
             
             
            )}
        </>
    );
};

export default GenericModal;
