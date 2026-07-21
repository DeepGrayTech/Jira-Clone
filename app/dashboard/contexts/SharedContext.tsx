"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { encryptData } from "@/lib/encryption";
import type { Comment, OperationLog } from "../types";
import { createCommentApi, deleteCommentApi } from "../services/api";
import { STORAGE_KEYS } from "../constants";

function persistComments(comments: Comment[]) {
  try {
    const payload = JSON.stringify(comments);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, encrypted || payload);
    });
  } catch (error) {
    console.error("[SharedContext] persistComments 失败:", error);
  }
}

function persistOperationLogs(logs: OperationLog[]) {
  try {
    const payload = JSON.stringify(logs);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.OPERATION_LOGS, encrypted || payload);
    });
  } catch (error) {
    console.error("[SharedContext] persistOperationLogs 失败:", error);
  }
}

interface SharedContextType {
  comments: Comment[];
  tagHistory: string[];
  operationLogs: OperationLog[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setTagHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setOperationLogs: React.Dispatch<React.SetStateAction<OperationLog[]>>;
  addComment: (comment: Comment) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  logOperation: (action: string, target: string, details: string) => void;
}

const SharedContext = createContext<SharedContextType | undefined>(undefined);

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [tagHistory, setTagHistory] = useState<string[]>([]);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const commentsRef = useRef(comments);
  const operationLogsRef = useRef(operationLogs);
  commentsRef.current = comments;
  operationLogsRef.current = operationLogs;

  const addComment = useCallback(async (comment: Comment) => {
    try {
      const created = await createCommentApi(comment);
      setComments((prev) => {
        const next = [...prev, created];
        persistComments(next);
        return next;
      });
    } catch (error) {
      console.warn("[SharedContext] addComment API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setComments((prev) => {
        const next = [...prev, comment];
        persistComments(next);
        return next;
      });
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    setComments((prev) => {
      const next = prev.filter((c) => c.id !== commentId);
      persistComments(next);
      return next;
    });
    try {
      await deleteCommentApi(commentId);
    } catch (error) {
      console.warn("[SharedContext] deleteComment API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const logOperation = useCallback((action: string, target: string, details: string) => {
    const newLog: OperationLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      target,
      details,
    };
    setOperationLogs((prev) => {
      const next = [...prev, newLog];
      const trimmed = next.length > 100 ? next.slice(next.length - 100) : next;
      persistOperationLogs(trimmed);
      return trimmed;
    });
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
