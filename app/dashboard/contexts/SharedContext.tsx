"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Comment, OperationLog } from "../types";

interface SharedContextType {
  comments: Comment[];
  tagHistory: string[];
  operationLogs: OperationLog[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setTagHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setOperationLogs: React.Dispatch<React.SetStateAction<OperationLog[]>>;
  addComment: (comment: Comment) => void;
  deleteComment: (commentId: string) => void;
  logOperation: (action: string, target: string, details: string) => void;
}

const SharedContext = createContext<SharedContextType | undefined>(undefined);

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [tagHistory, setTagHistory] = useState<string[]>([]);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);

  const addComment = useCallback((comment: Comment) => {
    setComments((prev) => [...prev, comment]);
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  const logOperation = useCallback((action: string, target: string, details: string) => {
    const newLog: OperationLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      target,
      details,
    };
    setOperationLogs((prev) => [newLog, ...prev].slice(0, 100));
  }, []);

  return (
    <SharedContext.Provider
      value={{
        comments,
        tagHistory,
        operationLogs,
        setComments,
        setTagHistory,
        setOperationLogs,
        addComment,
        deleteComment,
        logOperation,
      }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export const useShared = () => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error("useShared must be used within SharedProvider");
  }
  return context;
};