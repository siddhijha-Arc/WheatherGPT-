import React from "react";
import Markdown from "react-markdown";

export const MarkdownMessage = ({ content, isUser = false }) => {
  if (!content) return null;

  return (
    <div
      className={`markdown-body select-text cursor-text text-[14px] leading-relaxed break-words font-sans ${
        isUser ? "text-white" : "text-slate-900"
      }`}
      style={{ userSelect: "text", WebkitUserSelect: "text" }}
    >
      <Markdown
        components={{
          strong: ({ node, ...props }) => (
            <strong
              className={`font-bold tracking-tight ${
                isUser ? "text-white font-bold" : "text-slate-950 font-bold"
              }`}
              {...props}
            />
          ),
          em: ({ node, ...props }) => (
            <em
              className={`italic font-medium ${
                isUser ? "text-blue-100" : "text-slate-800"
              }`}
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed font-normal" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-outside ml-4 mb-2.5 space-y-1"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-outside ml-4 mb-2.5 space-y-1"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-1" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1
              className={`text-base sm:text-lg font-bold mt-3 mb-1.5 pb-1 border-b ${
                isUser
                  ? "text-white border-white/20"
                  : "text-slate-950 border-slate-200"
              }`}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className={`text-sm sm:text-base font-bold mt-2.5 mb-1 ${
                isUser ? "text-white" : "text-slate-900"
              }`}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className={`text-xs sm:text-sm font-bold mt-2 mb-1 ${
                isUser ? "text-white" : "text-slate-900"
              }`}
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className={`border-l-3 pl-3 py-1 my-2 text-xs italic rounded-r ${
                isUser
                  ? "border-white/50 text-blue-100 bg-white/10"
                  : "border-blue-500 text-slate-700 bg-blue-50/70"
              }`}
              {...props}
            />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                className={`px-1.5 py-0.5 rounded text-[12px] font-mono ${
                  isUser
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/90 text-slate-900 font-semibold"
                }`}
                {...props}
              />
            ) : (
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto my-2 border border-slate-700">
                <code {...props} />
              </pre>
            ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-slate-200">
              <table className="min-w-full text-xs text-left" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className={`px-2.5 py-1.5 font-bold ${
                isUser ? "bg-white/20 text-white" : "bg-slate-100 text-slate-900"
              }`}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className={`px-2.5 py-1.5 border-t ${
                isUser ? "border-white/10 text-white" : "border-slate-100 text-slate-800"
              }`}
              {...props}
            />
          )
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
