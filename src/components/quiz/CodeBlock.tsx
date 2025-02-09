"use client";

import { Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
  // Add debug logging
  console.log("CodeBlock received:", {
    code,
    language,
    codeLength: code?.length,
    codeType: typeof code,
  });

  if (!code) {
    console.warn("CodeBlock received empty code");
    return null;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            JavaScript
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          backgroundColor: "rgb(17, 24, 39)", // dark gray background
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
