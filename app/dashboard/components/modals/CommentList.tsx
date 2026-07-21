"use client";

import { useState } from "react";
import type { Comment, Task } from "../../types";
import { COLORS } from "../../constants";

interface CommentListProps {
  editingTask: Task;
  taskComments: Comment[];
  onAddComment?: (taskId: string, content: string) => void;
  onDeleteComment?: (commentId: string, taskId: string) => void;
}

export default function CommentList({
  editingTask,
  taskComments,
  onAddComment,
  onDeleteComment,
}: CommentListProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (newComment.trim() && editingTask) {
      onAddComment?.(editingTask.id, newComment);
      setNewComment("");
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        id="modal-comments-label"
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "14px",
          fontWeight: 600,
          color: COLORS.text,
        }}
      >
        Comments ({taskComments.length})
      </label>
      <div
        role="log"
        aria-label="Comments list"
        aria-live="polite"
        style={{
          marginBottom: "12px",
          border: `1px solid ${COLORS.border}`,
          borderRadius: "6px",
          padding: "12px",
          background: "#f9fafb",
        }}
      >
        {taskComments.length === 0 ? (
          <p
            style={{
              margin: 0,
              color: COLORS.textSecondary,
              fontSize: "13px",
            }}
          >
            No comments yet. Add a comment below.
          </p>
        ) : (
          taskComments.map((comment) => (
            <div
              key={comment.id}
              style={{
                marginBottom: "12px",
                padding: "10px",
                background: COLORS.cardBackground,
                borderRadius: "6px",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: COLORS.text,
                  }}
                >
                  {comment.author}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onDeleteComment?.(comment.id, editingTask.id)
                  }
                  aria-label={`Delete comment by ${comment.author}`}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.buttonDanger,
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "2px 4px",
                  }}
                >
                  Delete
                </button>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                  lineHeight: "1.5",
                }}
              >
                {comment.content}
              </p>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "11px",
                  color: "#6b7280",
                }}
              >
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          id="modal-new-comment"
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          aria-label="Add a comment"
          aria-describedby="modal-comments-label"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
          placeholder="Add a comment..."
        />
        <button
          type="button"
          onClick={handleSubmit}
          aria-label="Submit comment"
          style={{
            padding: "10px 20px",
            background: COLORS.buttonPrimary,
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
