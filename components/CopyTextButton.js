import { Button, ValidIcon, CopyIcon } from "junoblocks";
import { useState, useRef } from "react";
import copy from "copy-text-to-clipboard";

const timeToWaitMs = 3000;

export const CopyTextButton = ({ text }) => {
  const timeoutRef = useRef(null);
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant={copied ? "secondary" : "primary"}
      iconRight={copied ? <ValidIcon color="valid" /> : <CopyIcon />}
      onClick={() => {
        copy(text);
        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), timeToWaitMs);
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
};
