/**
 * RichTextEditor Component
 * Facebook-style rich text editor with inline images using TipTap
 * Now with advanced formatting: fonts, colors, highlights, mentions, hashtags
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import { Mark as TipTapMark, markInputRule, markPasteRule } from "@tiptap/core";
import tippy from "tippy.js";
import type { Instance as TippyInstance } from "tippy.js";
import { useCallback, useRef, useState, useEffect } from "react";
import { uploadImage } from "../../services/imageUploadService";
import { MentionsService } from "../../services/mentionsService";
import { MentionList } from "../ui/MentionList";
import type { MentionItem, MentionListRef } from "../ui/MentionList";
import { Type, Palette, Highlighter, ChevronDown } from "lucide-react";
import {
  EDITOR_TEXT_COLORS,
  EDITOR_HIGHLIGHT_COLORS,
} from "../../design-system/chartColors";
import { useToast } from "../../hooks/useToast";

const FONTS = [
  { name: "Default", value: "" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Comic Sans", value: "'Comic Sans MS', cursive" },
];

type EditorMenusState = {
  showFontMenu: boolean;
  showColorMenu: boolean;
  showHighlightMenu: boolean;
};

function useEditorMenus() {
  const [menus, setMenus] = useState<EditorMenusState>({
    showFontMenu: false,
    showColorMenu: false,
    showHighlightMenu: false,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".relative")) {
        setMenus({
          showFontMenu: false,
          showColorMenu: false,
          showHighlightMenu: false,
        });
      }
    };

    if (menus.showFontMenu || menus.showColorMenu || menus.showHighlightMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menus]);

  const openFontMenu = () =>
    setMenus({
      showFontMenu: true,
      showColorMenu: false,
      showHighlightMenu: false,
    });
  const toggleFontMenu = () =>
    setMenus((prev) => ({
      showFontMenu: !prev.showFontMenu,
      showColorMenu: false,
      showHighlightMenu: false,
    }));
  const toggleColorMenu = () =>
    setMenus((prev) => ({
      showFontMenu: false,
      showColorMenu: !prev.showColorMenu,
      showHighlightMenu: false,
    }));
  const toggleHighlightMenu = () =>
    setMenus((prev) => ({
      showFontMenu: false,
      showColorMenu: false,
      showHighlightMenu: !prev.showHighlightMenu,
    }));
  const closeFontMenu = () =>
    setMenus((prev) => ({ ...prev, showFontMenu: false }));
  const closeColorMenu = () =>
    setMenus((prev) => ({ ...prev, showColorMenu: false }));
  const closeHighlightMenu = () =>
    setMenus((prev) => ({ ...prev, showHighlightMenu: false }));
  const closeAllMenus = () =>
    setMenus({
      showFontMenu: false,
      showColorMenu: false,
      showHighlightMenu: false,
    });

  return {
    menus,
    openFontMenu,
    toggleFontMenu,
    toggleColorMenu,
    toggleHighlightMenu,
    closeFontMenu,
    closeColorMenu,
    closeHighlightMenu,
    closeAllMenus,
  };
}

function createMentionSuggestion(teamId?: string): Partial<SuggestionOptions> {
  function createMentionRenderer() {
    let component: ReactRenderer<MentionListRef>;
    let popup: TippyInstance[];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        popup[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup[0]?.hide();
          return true;
        }

        return component.ref?.onKeyDown(props) || false;
      },

      onExit() {
        popup[0]?.destroy();
        component.destroy();
      },
    };
  }

  return {
    items: async ({ query }) => {
      if (!teamId) return [];

      const suggestions = await MentionsService.getTeamMemberSuggestions(
        teamId,
        query,
        10
      );

      return suggestions.map((s) => ({
        id: s.id,
        label: s.display_name,
        avatar: s.avatar_url,
      })) as MentionItem[];
    },

    render: createMentionRenderer,
  };
}

type RichTextEditorToolbarProps = {
  editor: any;
  disabled: boolean;
  menus: EditorMenusState;
  onToggleFontMenu: () => void;
  onToggleColorMenu: () => void;
  onToggleHighlightMenu: () => void;
  onCloseFontMenu: () => void;
  onCloseColorMenu: () => void;
  onCloseHighlightMenu: () => void;
  onAddImage: () => void;
};

const ToolbarDivider: React.FC = () => (
  <div className="w-px h-6 bg-border mx-1" />
);

const InlineStyleButtons: React.FC<{ editor: any; disabled: boolean }> = ({
  editor,
  disabled,
}) => (
  <>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleBold().run()}
      disabled={disabled}
      className={`p-2 rounded hover:bg-muted transition-colors ${
        editor.isActive("bold") ? "bg-muted text-accent" : "text-secondary"
      }`}
      title="Bold"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
        />
      </svg>
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleItalic().run()}
      disabled={disabled}
      className={`p-2 rounded hover:bg-muted transition-colors ${
        editor.isActive("italic") ? "bg-muted text-accent" : "text-secondary"
      }`}
      title="Italic"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 4h4M14 20h4M16 4l-4 16"
        />
      </svg>
    </button>
  </>
);

const ListButtons: React.FC<{ editor: any; disabled: boolean }> = ({
  editor,
  disabled,
}) => (
  <>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      disabled={disabled}
      className={`p-2 rounded hover:bg-muted transition-colors ${
        editor.isActive("bulletList")
          ? "bg-muted text-accent"
          : "text-secondary"
      }`}
      title="Bullet List"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      disabled={disabled}
      className={`p-2 rounded hover:bg-muted transition-colors ${
        editor.isActive("orderedList")
          ? "bg-muted text-accent"
          : "text-secondary"
      }`}
      title="Numbered List"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4h1M3 10h1M3 16h1M7 6h14M7 12h14M7 18h14"
        />
      </svg>
    </button>
  </>
);

type FontMenuProps = {
  editor: any;
  disabled: boolean;
  show: boolean;
  onOpen: () => void;
  onClose: () => void;
  onBeforeOpen: () => void;
};

const FontMenu: React.FC<FontMenuProps> = ({
  editor,
  disabled,
  show,
  onOpen,
  onClose,
  onBeforeOpen,
}) => (
  <div className="relative">
    <button
      type="button"
      onClick={() => {
        onBeforeOpen();
        onOpen();
      }}
      disabled={disabled}
      className="p-2 rounded hover:bg-muted transition-colors text-secondary flex items-center gap-1"
      title="Font Family"
    >
      <Type className="w-4 h-4" />
      <ChevronDown className="w-3 h-3" />
    </button>
    {show && (
      <div className="absolute top-full left-0 mt-1 bg-primary rounded-lg shadow-xl z-50 w-40">
        {FONTS.map((font) => (
          <button
            key={font.name}
            type="button"
            onClick={() => {
              if (font.value) {
                editor.chain().focus().setFontFamily(font.value).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
              onClose();
            }}
            className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
            style={{ fontFamily: font.value || undefined }}
          >
            {font.name}
          </button>
        ))}
      </div>
    )}
  </div>
);

type ColorMenuProps = {
  editor: any;
  disabled: boolean;
  show: boolean;
  onOpen: () => void;
  onClose: () => void;
  onBeforeOpen: () => void;
};

const ColorMenu: React.FC<ColorMenuProps> = ({
  editor,
  disabled,
  show,
  onOpen,
  onClose,
  onBeforeOpen,
}) => {
  const colors = EDITOR_TEXT_COLORS;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          onBeforeOpen();
          onOpen();
        }}
        disabled={disabled}
        className="p-2 rounded hover:bg-muted transition-colors text-secondary flex items-center gap-1"
        title="Text Color"
      >
        <Palette className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>
      {show && (
        <div className="absolute top-full left-0 mt-1 bg-primary rounded-lg shadow-xl z-50 p-2">
          <div className="grid grid-cols-6 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  editor.chain().focus().setColor(color).run();
                  onClose();
                }}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetColor().run();
              onClose();
            }}
            className="w-full mt-2 px-2 py-1 text-xs bg-muted hover:bg-secondary rounded"
          >
            Reset Color
          </button>
        </div>
      )}
    </div>
  );
};

type HighlightMenuProps = {
  editor: any;
  disabled: boolean;
  show: boolean;
  onOpen: () => void;
  onClose: () => void;
  onBeforeOpen: () => void;
};

const HighlightMenu: React.FC<HighlightMenuProps> = ({
  editor,
  disabled,
  show,
  onOpen,
  onClose,
  onBeforeOpen,
}) => {
  const highlightColors = EDITOR_HIGHLIGHT_COLORS;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          onBeforeOpen();
          onOpen();
        }}
        disabled={disabled}
        className={`p-2 rounded hover:bg-muted transition-colors flex items-center gap-1 ${
          editor.isActive("highlight")
            ? "bg-muted text-accent"
            : "text-secondary"
        }`}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>
      {show && (
        <div className="absolute top-full left-0 mt-1 bg-primary rounded-lg shadow-xl z-50 w-32">
          {highlightColors.map((highlight) => (
            <button
              key={highlight.name}
              type="button"
              onClick={() => {
                if (highlight.value) {
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: highlight.value })
                    .run();
                } else {
                  editor.chain().focus().unsetHighlight().run();
                }
                onClose();
              }}
              className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
            >
              <span
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: highlight.value || "transparent" }}
              />
              {highlight.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddImageButton: React.FC<{
  onAddImage: () => void;
  disabled: boolean;
}> = ({ onAddImage, disabled }) => (
  <button
    type="button"
    onClick={onAddImage}
    disabled={disabled}
    className="p-2 rounded hover:bg-muted transition-colors text-secondary"
    title="Add Image"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  </button>
);

const RichTextEditorToolbar: React.FC<RichTextEditorToolbarProps> = ({
  editor,
  disabled,
  menus,
  onToggleFontMenu,
  onToggleColorMenu,
  onToggleHighlightMenu,
  onCloseFontMenu,
  onCloseColorMenu,
  onCloseHighlightMenu,
  onAddImage,
}) => (
  <div className="flex items-center gap-1 p-2 border-b border-border flex-wrap">
    <InlineStyleButtons editor={editor} disabled={disabled} />
    <ToolbarDivider />
    <ListButtons editor={editor} disabled={disabled} />
    <ToolbarDivider />
    <FontMenu
      editor={editor}
      disabled={disabled}
      show={menus.showFontMenu}
      onOpen={onToggleFontMenu}
      onClose={onCloseFontMenu}
      onBeforeOpen={() => {
        onCloseColorMenu();
        onCloseHighlightMenu();
      }}
    />
    <ColorMenu
      editor={editor}
      disabled={disabled}
      show={menus.showColorMenu}
      onOpen={onToggleColorMenu}
      onClose={onCloseColorMenu}
      onBeforeOpen={() => {
        onCloseFontMenu();
        onCloseHighlightMenu();
      }}
    />
    <HighlightMenu
      editor={editor}
      disabled={disabled}
      show={menus.showHighlightMenu}
      onOpen={onToggleHighlightMenu}
      onClose={onCloseHighlightMenu}
      onBeforeOpen={() => {
        onCloseFontMenu();
        onCloseColorMenu();
      }}
    />
    <ToolbarDivider />
    <AddImageButton onAddImage={onAddImage} disabled={disabled} />
    <span className="text-xs text-muted ml-auto">
      Drag & drop or paste images
    </span>
  </div>
);

// Custom FontFamily extension with specific fonts
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
            parseHTML: (element) =>
              element.style.fontFamily?.replace(/['"]+/g, ""),
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

  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontFamily }).run();
        },
      unsetFontFamily:
        () =>
        ({ chain }: any) => {
          return chain()
            .setMark("textStyle", { fontFamily: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// Custom Hashtag mark for #tag parsing
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
    return ["span", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addInputRules() {
    return [
      markInputRule({
        find: /(^|\s)(#[a-zA-Z0-9_]+)\s$/,
        type: this.type,
        getAttributes: (match) => ({
          tag: match[2].substring(1), // Remove the # symbol
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

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  teamId?: string; // Optional: enables team-specific @mentions
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something...",
  disabled = false,
  teamId,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const {
    menus,
    toggleFontMenu,
    toggleColorMenu,
    toggleHighlightMenu,
    closeFontMenu,
    closeColorMenu,
    closeHighlightMenu,
  } = useEditorMenus();

  const mentionSuggestion = createMentionSuggestion(teamId);

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
        suggestion: mentionSuggestion as any,
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-2 cursor-pointer",
          style: "max-height: 400px; object-fit: contain;",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(JSON.stringify(json));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-30 px-4 py-3 text-primary",
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      // Show loading state
      editor
        .chain()
        .focus()
        .insertContent({
          type: "paragraph",
          content: [{ type: "text", text: "Uploading image..." }],
        })
        .run();

      // Upload image
      const result = await uploadImage(file);

      // Remove loading text
      editor.chain().focus().deleteNode("paragraph").run();

      if (result.success && result.url) {
        // Insert image
        editor.chain().focus().setImage({ src: result.url }).run();
      } else {
        // Show error
        toast.error(result.error || "Failed to upload image");
      }
    },
    [editor, toast]
  );

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg bg-primary">
      <RichTextEditorToolbar
        editor={editor}
        disabled={disabled}
        menus={menus}
        onToggleFontMenu={toggleFontMenu}
        onToggleColorMenu={toggleColorMenu}
        onToggleHighlightMenu={toggleHighlightMenu}
        onCloseFontMenu={closeFontMenu}
        onCloseColorMenu={closeColorMenu}
        onCloseHighlightMenu={closeHighlightMenu}
        onAddImage={handleAddImage}
      />

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
