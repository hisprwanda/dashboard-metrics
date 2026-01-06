import { useState } from "react";
import {
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  Button,
  IconInfo24,
} from "@dhis2/ui";

interface TabInfoModalProps {
  title: string;
  content: React.ReactNode;
}

export default function TabInfoModal({ title, content }: TabInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        small
        secondary
        icon={<IconInfo24 />}
        onClick={() => setIsOpen(true)}
        dataTest="tab-info-button"
      />

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} position="middle">
          <ModalTitle>{title}</ModalTitle>
          <ModalContent>
            <div className="space-y-4">{content}</div>
          </ModalContent>
          <ModalActions>
            <Button onClick={() => setIsOpen(false)} primary>
              Close
            </Button>
          </ModalActions>
        </Modal>
      )}
    </>
  );
}
