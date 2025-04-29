import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileInput, Group, Stack, Button, TextInput, Slider, ColorInput, Box } from "@mantine/core";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentsWatermarking: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [opacity, setOpacity] = useState<number>(50);
  const [watermarkColor, setWatermarkColor] = useState<string>("#FF0000");
  const [isWatermarkApplied, setIsWatermarkApplied] = useState<boolean>(false);

  const onFileChange = (file: File | null) => {
    if (file) {
      setPdfFile(file);
      setIsWatermarkApplied(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleApplyWatermark = () => {
    if (pdfFile && watermarkText) {
      setIsWatermarkApplied(true);
    }
  };

  // Convert hex color to RGB (values from 0-1 for pdf-lib)
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 0, b: 0 };
  };

  const handleDownload = async () => {
    if (!pdfFile) return;
    
    try {
      // Read the file
      const fileBuffer = await pdfFile.arrayBuffer();
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      // Embed the standard font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Get all pages
      const pages = pdfDoc.getPages();
      
      // Convert color
      const { r, g, b } = hexToRgb(watermarkColor);
      const rgbColor = rgb(r, g, b);
      const alphaValue = opacity / 100;
      
      // Apply watermark to each page
      for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) / 10; // Adjust font size based on page size
        
        // Calculate text width for centering
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
        
        // Center position
        const centerX = width / 2 - textWidth / 2;
        const centerY = height / 2;
        
        // Draw diagonal watermark
        page.drawText(watermarkText, {
          x: centerX,
          y: centerY,
          size: fontSize,
          font: helveticaFont,
          color: rgbColor,
          opacity: alphaValue,
          rotate: degrees(45), // Use degrees() helper instead of Math.PI/4
        });
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "watermarked.pdf";
      link.click();
    } catch (error) {
      console.error("Error generating watermarked PDF:", error);
      alert("Failed to generate watermarked PDF. Please try again.");
    }
  };

  // Watermark overlay style for preview
  const getWatermarkOverlayStyle = (): React.CSSProperties => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 10,
      transform: 'rotate(45deg)',
      transformOrigin: 'center center',
      opacity: opacity / 100,
      color: watermarkColor,
      fontSize: '50px',
      fontWeight: 'bold'
    };
  };

  return (
    <Stack justify="center" gap="md">
      <Group align="flex-end" mb="md">
        <FileInput 
          placeholder="Upload document (PDF)" 
          accept="application/pdf" 
          onChange={onFileChange}
          style={{ flexGrow: 1 }}
        />
        
        {pdfFile && (
          <>
            <Button onClick={handleApplyWatermark}>
              {isWatermarkApplied ? "Update Watermark" : "Apply Watermark"}
            </Button>
            {isWatermarkApplied && (
              <Button onClick={handleDownload}>Download Watermarked PDF</Button>
            )}
          </>
        )}
      </Group>
      
      {pdfFile && (
        <Group position="apart" noWrap spacing="xl">
          <Stack gap="md" style={{ width: "300px" }}>
            <TextInput
              label="Watermark Text"
              placeholder="Enter watermark text"
              value={watermarkText}
              onChange={(event) => setWatermarkText(event.currentTarget.value)}
            />
            
            <ColorInput
              label="Watermark Color"
              placeholder="Choose watermark color"
              value={watermarkColor}
              onChange={setWatermarkColor}
              swatches={['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000']}
            />
            
            <Stack gap="xs">
              <Box>Opacity: {opacity}%</Box>
              <Slider
                min={10}
                max={100}
                value={opacity}
                onChange={setOpacity}
              />
            </Stack>
          </Stack>
          
          <Box style={{ position: 'relative', flex: 1 }}>
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from({ length: numPages }, (_, i) => (
                <div key={`page-container-${i}`} style={{ position: 'relative', marginBottom: '20px' }}>
                  <Page 
                    key={`page-${i}`} 
                    pageNumber={i + 1} 
                    scale={1} 
                    renderAnnotationLayer={true} 
                    renderTextLayer={true} 
                  />
                  
                  {isWatermarkApplied && (
                    <div style={getWatermarkOverlayStyle(i)}>
                      {watermarkText}
                    </div>
                  )}
                </div>
              ))}
            </Document>
          </Box>
        </Group>
      )}
    </Stack>
  );
};

export default DocumentsWatermarking;