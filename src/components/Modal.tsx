'use client';

import React, { type FC, type ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
interface ModalProps {
  children: ReactNode;
  onClose?: () => void; // Function to close the modal
  animation?: 'slide' | 'fade';
  isCloseable?: boolean;
  notCenter?: boolean;
  bgClass?: string;
  forceBgColor?: string;
  isFull?: boolean;
}

const Modal: FC<ModalProps> = ({
  children,
  notCenter,
  onClose,
  bgClass,
  forceBgColor,
  isFull = false,
  animation = 'slide',
  isCloseable = true
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Function to handle clicks outside the children
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isCloseable
      ) {
        onClose && onClose(); // Close the modal when clicked outside
      }
    };

    // Add event listener to the document
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn('fixed inset-0 z-[1000] bg-gray-600/50', bgClass)}
        style={{ backgroundColor: forceBgColor }}
      ></motion.div>
      <motion.div
        initial={
          animation === 'slide' ? { opacity: 0, top: '100vh' } : { opacity: 0 }
        }
        animate={
          animation === 'slide' ? { opacity: 1, top: 0 } : { opacity: 1 }
        }
        exit={
          animation === 'slide' ? { opacity: 0, top: '100vh' } : { opacity: 0 }
        }
        className={cn(
          'fixed inset-0 top-0 z-[1001] h-full w-full overflow-scroll',
          notCenter !== true && 'flex items-center justify-center'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-full ${!isFull && 'max-w-4xl'}`} ref={modalRef}>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;
