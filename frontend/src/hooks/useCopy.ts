import React, { useState } from "react";
import { toast } from "sonner";

const useCopy = (url: string) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return {
    copied,
    copyToClipboard,
  };
};

export default useCopy;
