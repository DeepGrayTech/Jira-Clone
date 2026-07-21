"use client";

import { useState, useEffect } from "react";
import type { FormFields } from "../../types";
import { COLORS } from "../../constants";

interface TagInputProps {
  formData: FormFields;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  tagHistory: string[];
}

export default function TagInput({
  formData,
  setFormData,
  tagHistory,
}: TagInputProps) {
  const [tagInputValue, setTagInputValue] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const tagInputContainer = document.querySelector(".tag-input-container");
      if (tagInputContainer && !tagInputContainer.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    if (showTagDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTagDropdown]);

  const handleAddTag = () => {
    const trimmedTag = tagInputValue.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setTagInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSelectTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInputValue("");
    setShowTagDropdown(false);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        id="modal-tags-label"
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "14px",
          fontWeight: 600,
          color: COLORS.text,
        }}
      >
        Tags
      </label>
      <div
        role="list"
        aria-label="Current tags"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        {formData.tags.map((tag) => (
          <span
            key={tag}
            role="listitem"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              background: "#e0e7ff",
              color: "#4338ca",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            #{tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              aria-label={`Remove tag ${tag}`}
              style={{
                background: "none",
                border: "none",
                color: "#4338ca",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div
        className="tag-input-container"
        style={{
          position: "relative",
        }}
      >
        <input
          id="modal-tag-input"
          type="text"
          value={tagInputValue}
          onChange={(e) => {
            setTagInputValue(e.target.value);
            if (e.target.value) {
              setFilteredTags(
                tagHistory.filter((tag) =>
                  tag.toLowerCase().includes(e.target.value.toLowerCase())
                )
              );
              setShowTagDropdown(true);
            } else {
              setShowTagDropdown(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          onFocus={() => {
            if (tagInputValue) {
              setFilteredTags(
                tagHistory.filter((tag) =>
                  tag.toLowerCase().includes(tagInputValue.toLowerCase())
                )
              );
            } else {
              setFilteredTags(tagHistory);
            }
            setShowTagDropdown(true);
          }}
          aria-label="Add a tag"
          aria-describedby="modal-tags-label"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
          placeholder="Add a tag..."
        />
        {showTagDropdown && filteredTags.length > 0 && (
          <div
            role="listbox"
            aria-label="Tag suggestions"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#ffffff",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginTop: "4px",
              zIndex: 100,
            }}
          >
            {filteredTags.map((tag) => (
              <button
                key={tag}
                type="button"
                role="option"
                aria-selected={formData.tags.includes(tag)}
                onClick={() => handleSelectTag(tag)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: COLORS.text,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = COLORS.columnBackground;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
