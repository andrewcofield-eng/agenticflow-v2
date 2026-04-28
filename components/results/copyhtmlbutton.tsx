"use client";

import { useState } from "react";

type CopyHtmlButtonProps = {
  html: string;
};

export default function CopyHtmlButton({ html }: CopyHtmlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" className="button-secondary" onClick={() => void handleCopy()}>
      {copied ? "Copied" : "Copy HTML"}
    </button>
  );
}
