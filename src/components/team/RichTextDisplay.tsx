/**
 * RichTextDisplay Component
 * Read-only display of rich text content with inline images and advanced formatting
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Mention from "@tiptap/extension-mention";
import { Extension } from "@tiptap/core";
import { Mark as TipTapMark, markInputRule, markPasteRule } from "@tiptap/core";
import { useEffect } from "react";

// FontFamily extension (same as editor)
const FontFamily = Extension.create({
  name: "fontFamily",
  
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },
});

// Hashtag mark (same as editor, but read-only)
const Hashtag = TipTapMark.create({
  name: "hashtag",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "hashtag",
      },
    };
  },

  addAttributes() {
    return {
      tag: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-tag"),
        renderHTML: (attributes) => {
          if (!attributes.tag) {
            return {};
          }
          return {
            "data-tag": attributes.tag,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-tag].hashtag",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      { ...this.options.HTMLAttributes, ...HTMLAttributes },
      0,
    ];
  },

  addInputRules() {
    return [
      markInputRule({
        find: /(^|\s)(#[a-zA-Z0-9_]+)\s$/,
        type: this.type,
        getAttributes: (match) => ({
          tag: match[2].substring(1),
        }),
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: /(^|\s)(#[a-zA-Z0-9_]+)/g,
        type: this.type,
        getAttributes: (match) => ({
          tag: match[2].substring(1),
        }),
      }),
    ];
  },
});

interface RichTextDisplayProps {
  content: string;
  className?: string;
  onHashtagClick?: (hashtag: string) => void;
}

export function RichTextDisplay({ content, onHashtagClick }: RichTextDisplayProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({
        multicolor: true,
      }),
      Hashtag,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        // No suggestion config needed - this is read-only display
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-2 cursor-pointer",
          style: "max-height: 400px; object-fit: contain;",
        },
      }),
    ],
    editable: false,
    content: "",
  });

  // Update content when it changes
  useEffect(() => {
    if (editor && content) {
      try {
        const json = JSON.parse(content);
        editor.commands.setContent(json);
      } catch {
        // If content is not JSON, treat as plain text
        editor.commands.setContent({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: content }],
            },
          ],
        });
      }
    }
  }, [editor, content]);

  // Add click handlers for hashtags
  useEffect(() => {
    if (!editor || !onHashtagClick) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("hashtag")) {
        const hashtag = target.getAttribute("data-tag");
        if (hashtag) {
          onHashtagClick(hashtag);
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("click", handleClick);

    return () => {
      editorElement.removeEventListener("click", handleClick);
    };
  }, [editor, onHashtagClick]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-display">
      <EditorContent editor={editor} />
    </div>
  );
}
