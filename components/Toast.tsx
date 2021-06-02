import React, { useContext } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContext } from "context/Toast";

export function Toast() {
  const { content } = useContext(ToastContext);

  return (
    <AnimatePresence>
      {content != null && (
        <ToastContainer
          initial={{ y: "-110%" }}
          exit={{ y: "-110%" }}
          animate={{ y: 16 }}
        >
          {content}
        </ToastContainer>
      )}
    </AnimatePresence>
  );
}

const ToastContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 0.25rem;
  border: 4px solid var(--black);
  color: var(--black);
  padding: 1rem;
  z-index: 1000000000000000000;
`;
