import { createContext, ReactNode } from "react";

export const ToastContext = createContext<{
  content: ReactNode;
  showToast: (content: ReactNode) => void;
}>({
  content: null,
  showToast: () => null,
});
