/**
 * RichTextDisplay Component
 * Lightweight read-only renderer for TipTap JSON content.
 *
 * Key goal: avoid creating a TipTap editor instance per item in feeds.
 */

import type { ReactNode } from "react";

type TipTapMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

type TipTapNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

type MarkRenderContext = {
  children: ReactNode;
  key: string;
  attrs?: Record<string, unknown>;
  onHashtagClick?: (hashtag: string) => void;
};

type MarkRenderer = (ctx: MarkRenderContext) => ReactNode;

const renderBoldMark: MarkRenderer = ({ children, key }) => (
  <strong key={key}>{children}</strong>
);
const renderItalicMark: MarkRenderer = ({ children, key }) => (
  <em key={key}>{children}</em>
);
const renderStrikeMark: MarkRenderer = ({ children, key }) => (
  <s key={key}>{children}</s>
);
const renderCodeMark: MarkRenderer = ({ children, key }) => (
  <code key={key}>{children}</code>
);
const renderHighlightMark: MarkRenderer = ({ children, key, attrs }) => {
  const color = asString(attrs?.color);
  return (
    <mark key={key} style={color ? { backgroundColor: color } : undefined}>
      {children}
    </mark>
  );
};
const renderTextStyleMark: MarkRenderer = ({ children, key, attrs }) => {
  const style: Record<string, string> = {};
  const color = asString(attrs?.color);
  const fontFamily = asString(attrs?.fontFamily);
  if (color) style.color = color;
  if (fontFamily) style.fontFamily = fontFamily;
  const hasStyle = Object.keys(style).length > 0;

  return hasStyle ? (
    <span key={key} style={style}>
      {children}
    </span>
  ) : (
    <span key={key}>{children}</span>
  );
};
const renderHashtagMark: MarkRenderer = ({
  children,
  key,
  attrs,
  onHashtagClick,
}) => {
  const tag = asString(attrs?.tag);
  if (!tag) return <span key={key}>{children}</span>;

  if (!onHashtagClick) {
    return (
      <span key={key} className="hashtag" data-tag={tag}>
        {children}
      </span>
    );
  }

  return (
    <button
      key={key}
      type="button"
      className="hashtag"
      data-tag={tag}
      onClick={() => onHashtagClick(tag)}
    >
      {children}
    </button>
  );
};
const renderMentionMark: MarkRenderer = ({ children, key }) => (
  <span key={key} className="mention">
    {children}
  </span>
);

const MARK_RENDERERS: Record<string, MarkRenderer> = {
  bold: renderBoldMark,
  italic: renderItalicMark,
  strike: renderStrikeMark,
  code: renderCodeMark,
  highlight: renderHighlightMark,
  textStyle: renderTextStyleMark,
  hashtag: renderHashtagMark,
  mention: renderMentionMark,
};

function applyTextMarks(params: {
  node: TipTapNode;
  children: ReactNode;
  key: string;
  onHashtagClick?: (hashtag: string) => void;
}): ReactNode {
  const { node, children, key, onHashtagClick } = params;
  const marks = Array.isArray(node.marks) ? node.marks : [];

  return marks.reduce<ReactNode>((acc, mark, index) => {
    const markKey = `${key}-m${index}`;
    const type = mark?.type;
    const renderer = type ? MARK_RENDERERS[type] : undefined;
    if (!renderer) return acc;

    return renderer({
      children: acc,
      key: markKey,
      attrs: isRecord(mark?.attrs) ? mark.attrs : undefined,
      onHashtagClick,
    });
  }, children);
}

type NodeRenderContext = {
  node: TipTapNode;
  key: string;
  onHashtagClick?: (hashtag: string) => void;
  renderChildren: () => ReactNode[];
};

type NodeRenderer = (ctx: NodeRenderContext) => ReactNode;

const renderTextNode: NodeRenderer = ({ node, key, onHashtagClick }) => {
  const text = node.text ?? "";
  return applyTextMarks({ node, children: text, key, onHashtagClick });
};
const renderHardBreakNode: NodeRenderer = ({ key }) => <br key={key} />;
const renderImageNode: NodeRenderer = ({ node, key }) => {
  const attrs = isRecord(node.attrs) ? node.attrs : undefined;
  const src = asString(attrs?.src);
  if (!src) return null;
  const alt = asString(attrs?.alt) ?? "";
  return (
    <img
      key={key}
      src={src}
      alt={alt}
      className="rounded-lg max-w-full h-auto my-2"
      loading="lazy"
    />
  );
};
const renderMentionNode: NodeRenderer = ({ node, key }) => {
  const attrs = isRecord(node.attrs) ? node.attrs : undefined;
  const label = asString(attrs?.label);
  return (
    <span key={key} className="mention">
      {label ? `@${label}` : "@"}
    </span>
  );
};
const renderDocNode: NodeRenderer = ({ renderChildren }) => (
  <>{renderChildren()}</>
);
const renderParagraphNode: NodeRenderer = ({ key, renderChildren }) => (
  <p key={key}>{renderChildren()}</p>
);
const renderHeadingNode: NodeRenderer = ({ node, key, renderChildren }) => {
  const attrs = isRecord(node.attrs) ? node.attrs : undefined;
  const level = asNumber(attrs?.level) ?? 2;
  const clamped = Math.min(6, Math.max(1, level));
  const headingTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
  const HeadingTag: (typeof headingTags)[number] = headingTags[clamped - 1];
  return (
    <HeadingTag key={key} className="font-semibold">
      {renderChildren()}
    </HeadingTag>
  );
};
const renderBulletListNode: NodeRenderer = ({ key, renderChildren }) => (
  <ul key={key} className="list-disc ml-5">
    {renderChildren()}
  </ul>
);
const renderOrderedListNode: NodeRenderer = ({ key, renderChildren }) => (
  <ol key={key} className="list-decimal ml-5">
    {renderChildren()}
  </ol>
);
const renderListItemNode: NodeRenderer = ({ key, renderChildren }) => (
  <li key={key}>{renderChildren()}</li>
);
const renderBlockquoteNode: NodeRenderer = ({ key, renderChildren }) => (
  <blockquote
    className="border-l-4 border-divider pl-3 text-secondary italic"
    key={key}
  >
    {renderChildren()}
  </blockquote>
);
const renderHorizontalRuleNode: NodeRenderer = ({ key }) => (
  <hr key={key} className="border-divider my-3" />
);
const renderCodeBlockNode: NodeRenderer = ({ node, key }) => {
  const content = Array.isArray(node.content) ? node.content : [];
  const text = content
    .map((c) => (c.type === "text" ? (c.text ?? "") : ""))
    .join("");

  return (
    <pre key={key} className="bg-muted rounded p-3 overflow-x-auto">
      <code>{text}</code>
    </pre>
  );
};
const renderUnknownNode: NodeRenderer = ({ key, renderChildren }) => (
  <span key={key}>{renderChildren()}</span>
);

const NODE_RENDERERS: Record<string, NodeRenderer> = {
  text: renderTextNode,
  hardBreak: renderHardBreakNode,
  image: renderImageNode,
  mention: renderMentionNode,
  doc: renderDocNode,
  paragraph: renderParagraphNode,
  heading: renderHeadingNode,
  bulletList: renderBulletListNode,
  orderedList: renderOrderedListNode,
  listItem: renderListItemNode,
  blockquote: renderBlockquoteNode,
  horizontalRule: renderHorizontalRuleNode,
  codeBlock: renderCodeBlockNode,
};

function renderTipTapNode(params: {
  node: TipTapNode;
  key: string;
  onHashtagClick?: (hashtag: string) => void;
}): ReactNode {
  const { node, key, onHashtagClick } = params;
  const type = node.type ?? "";
  const renderer = NODE_RENDERERS[type] ?? renderUnknownNode;
  const content = Array.isArray(node.content) ? node.content : [];

  const renderChildren = () =>
    content.map((child, index) =>
      renderTipTapNode({
        node: child,
        key: `${key}-${index}`,
        onHashtagClick,
      })
    );

  return renderer({ node, key, onHashtagClick, renderChildren });
}

interface RichTextDisplayProps {
  content: string;
  className?: string;
  onHashtagClick?: (hashtag: string) => void;
}

export function RichTextDisplay({
  content,
  onHashtagClick,
  className,
}: RichTextDisplayProps) {
  if (!content) return null;

  let parsed: TipTapNode | null = null;

  try {
    const json = JSON.parse(content) as unknown;
    parsed = isRecord(json) ? (json as TipTapNode) : null;
  } catch {
    parsed = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: content }],
        },
      ],
    };
  }

  return (
    <div
      className={
        className ? `rich-text-display ${className}` : "rich-text-display"
      }
    >
      {parsed ? (
        renderTipTapNode({ node: parsed, key: "root", onHashtagClick })
      ) : (
        <p className="whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}
