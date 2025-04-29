import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileInput, Group, Stack, Button, TextInput } from "@mantine/core";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentsRedaction: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [redactedFile, setRedactedFile] = useState<Blob | null>(null);
  const [redactionText, setRedactionText] = useState<string>("");

  const onFileChange = (file: File | null) => {
    if (file) {
      setPdfFile(file);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleRedact = () => {
    if (pdfFile && redactionText) {
      // Simulate redaction process by replacing the redactionText in the file
      const redactedBlob = new Blob([`Redacted content: ${redactionText}`], { type: "application/pdf" });
      setRedactedFile(redactedBlob);
    }
  };

  const handleDownload = () => {
    if (redactedFile) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(redactedFile);
      link.download = "redacted.pdf";
      link.click();
    }
  };

  return (
    <Stack justify="center" gap="md">
      <FileInput placeholder="Upload PDF" accept="application/pdf" onChange={onFileChange} />
      {pdfFile && (
        <Group justify="center">
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from({ length: numPages }, (_, i) => {
              return <Page key={`page-${i}`} pageNumber={i + 1} scale={1} renderAnnotationLayer={true} renderTextLayer={true} />;
            })}
          </Document>
        </Group>
      )}
      {pdfFile && (
        <Group justify="center">
          <TextInput
            placeholder="Enter text to redact"
            value={redactionText}
            onChange={(event) => setRedactionText(event.currentTarget.value)}
          />
          <Button onClick={handleRedact}>Redact</Button>
          {redactedFile && <Button onClick={handleDownload}>Download Redacted File</Button>}
        </Group>
      )}
    </Stack>
  );
};

export default DocumentsRedaction;
