import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileInput, Group, Stack } from "@mantine/core";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentsTranslation: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  const onFileChange = (file: File | null) => {
    if (file) {
      setPdfFile(file);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Stack justify="center" gap="md">
      <FileInput placeholder="Upload PDF" accept="application/pdf" onChange={onFileChange} />
      {pdfFile && (
        <Group justify="center">
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from({ length: numPages }, (_, i) => {
              return <Page pageNumber={i + 1} scale={1} renderAnnotationLayer={true} renderTextLayer={true} />
            })}
          </Document>
        </Group>
      )}
    </Stack>
  );
};

export default DocumentsTranslation;
