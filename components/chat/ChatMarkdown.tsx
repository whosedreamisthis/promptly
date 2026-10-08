import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const MARKDOWN_CLASS = [
  "min-w-0 space-y-3 break-words",
  "[&_a]:underline [&_a]:underline-offset-2",
  "[&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-surface-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-surface-border [&_pre]:bg-surface-input [&_pre]:p-3 [&_pre]:text-sm [&_pre]:text-foreground",
  "[&_pre_code]:font-mono",
  "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-black/10 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-sm",
  "[&_table]:w-full [&_table]:text-sm [&_th]:border [&_th]:border-surface-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:border [&_td]:border-surface-border [&_td]:px-2 [&_td]:py-1",
].join(" ");

/** Model-generated links open in a new tab without access to this page. */
const MARKDOWN_COMPONENTS: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

interface ChatMarkdownProps {
  children: string;
}

export default function ChatMarkdown({ children }: ChatMarkdownProps) {
  return (
    <div className={MARKDOWN_CLASS}>
      <Markdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {children}
      </Markdown>
    </div>
  );
}
