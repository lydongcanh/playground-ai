import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { Box, Button, FileInput, Text, Group, Stack, Paper } from "@mantine/core";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Redaction {
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

const PDFViewer: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [redactions, setRedactions] = useState<Redaction[]>([]);
  const [isRedacting, setIsRedacting] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onFileChange = (file: File | null) => {
    if (file) {
      setPdfFile(file);
      setCurrentPage(1);
      setRedactions([]);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isRedacting || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRedaction = {
      x,
      y,
      width: 100,
      height: 50,
      pageIndex: currentPage - 1,
    };

    setRedactions((prev) => [...prev, newRedaction]);
  };

  const downloadRedactedPDF = async () => {
    if (!pdfFile) return;

    const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
    const pages = pdfDoc.getPages();

    redactions.forEach((redaction) => {
      const page = pages[redaction.pageIndex];
      const { width, height } = page.getSize();
      const scaleFactor = width / (containerRef.current?.clientWidth || width);

      page.drawRectangle({
        x: redaction.x * scaleFactor,
        y: height - (redaction.y + redaction.height) * scaleFactor,
        width: redaction.width * scaleFactor,
        height: redaction.height * scaleFactor,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "redacted-document.pdf";
    link.click();
  };

  return (
    <Stack justify="center" gap="md" style={{ marginTop: 12 }}>
      <FileInput placeholder="Upload PDF" accept="application/pdf" onChange={onFileChange} />

      {pdfFile && (
        <Paper shadow="xs" p="md">
          <Box ref={containerRef} style={{ position: "relative" }} onClick={handleContainerClick}>
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={currentPage} scale={0.9} renderAnnotationLayer={true} renderTextLayer={true} />
            </Document>

            {redactions.map(
              (redaction, index) =>
                redaction.pageIndex === currentPage - 1 && (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      left: `${redaction.x}px`,
                      top: `${redaction.y}px`,
                      width: `${redaction.width}px`,
                      height: `${redaction.height}px`,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      pointerEvents: "none",
                    }}
                  />
                )
            )}
          </Box>

          <Group justify="center" mt="md">
            <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage <= 1}>
              Previous
            </Button>
            <Text>
              Page {currentPage} of {numPages}
            </Text>
            <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, numPages))} disabled={currentPage >= numPages}>
              Next
            </Button>
          </Group>

          <Group justify="center" mt="md">
            <Button onClick={() => setIsRedacting(!isRedacting)} color={isRedacting ? "red" : "blue"}>
              {isRedacting ? "Stop Redacting" : "Start Redacting"}
            </Button>
            <Button onClick={downloadRedactedPDF} color="green">
              Download Redacted PDF
            </Button>
          </Group>
        </Paper>
      )}
    </Stack>
  );
};

export default PDFViewer;
