import type { FCC } from '@/types';
import type { ButtonProps, ModalProps } from '@chakra-ui/react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import type { ComponentType } from 'react';
import { useId } from 'react-id-generator';

export type ModalFormProps = {
  closeModal: () => void;
  formId: string;
};

type ModalButtonProps = ButtonProps & { modalProps?: Omit<ModalProps, 'isOpen' | 'onClose' | 'children'> } & {
  modalTitle?: string;
  Form: ComponentType<React.PropsWithChildren<ModalFormProps>>;
};

const ModalButton: FCC<ModalButtonProps> = ({ modalProps, modalTitle, Form, ...props }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [htmlId] = useId();

  return (
    <>
      <Button onClick={onOpen} {...props} />
      <Modal isOpen={isOpen} onClose={onClose} size="xl" {...modalProps}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{isOpen && <Form closeModal={onClose} formId={htmlId} />}</ModalBody>

          <ModalFooter>
            <Button variant="subtle" colorScheme="success" type="submit" form={htmlId} mr={3}>
              Submit
            </Button>
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalButton;
