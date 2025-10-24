/**
 * RichTextDisplay Component
 * Read-only display of rich text content with inline images
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
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

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-display">
      <EditorContent editor={editor} />
    </div>
  );
}
