import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileInput, Stack, Button, TextInput, Slider, ColorInput, Box, Grid } from "@mantine/core";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentsWatermarking: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [opacity, setOpacity] = useState<number>(50);
  const [watermarkColor, setWatermarkColor] = useState<string>("#FF0000");
  const [rotationAngle, setRotationAngle] = useState<number>(45);
  const [positionY, setPositionY] = useState<number>(50); // 50% is center

  // Auto-apply watermark whenever settings change
  useEffect(() => {
    if (pdfFile && watermarkText) {
      // Watermark is always applied now
    }
  }, [pdfFile, watermarkText, opacity, watermarkColor, rotationAngle, positionY]);

  const onFileChange = (file: File | null) => {
    if (file) {
      setPdfFile(file);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
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
        
        // Calculate vertical position - invert the value since PDF coordinates start from bottom
        // For 50% (center) we want to be at height/2, for 10% (top) we want to be at height*0.9, etc.
        const yPosition = height * (1 - positionY / 100);
        
        // Center horizontally
        const centerX = width / 2 - textWidth / 2;
        
        // Draw watermark with custom rotation - same as preview
        page.drawText(watermarkText, {
          x: centerX,
          y: yPosition,
          size: fontSize,
          font: helveticaFont,
          color: rgbColor,
          opacity: alphaValue,
          rotate: degrees(rotationAngle),
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

  return (
    <Grid grow gutter="md">
      {/* Left side - PDF Display (fixed) */}
      <Grid.Col span={8} style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        {pdfFile ? (
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
                
                {pdfFile && watermarkText && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: positionY === 50 ? 'center' : 'flex-start',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 10,
                    opacity: opacity / 100,
                    paddingTop: `${positionY}%`
                  }}>
                    <div style={{
                      color: watermarkColor,
                      fontSize: '50px',
                      fontWeight: 'bold',
                      transform: `rotate(${rotationAngle}deg)`,
                      textAlign: 'center',
                      width: '100%',
                      position: 'absolute'
                    }}>
                      {watermarkText}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Document>
        ) : (
          <Box style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px dashed #ccc',
            borderRadius: '8px'
          }}>
            <p>Upload a PDF document to add watermark</p>
          </Box>
        )}
      </Grid.Col>
      
      {/* Right side - Controls (fixed) */}
      <Grid.Col span={4}>
        <Stack gap="md" style={{ position: 'sticky', top: '20px' }}>
          <FileInput 
            placeholder="Upload document (PDF)" 
            accept="application/pdf" 
            onChange={onFileChange}
          />
          
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
          
          <Stack gap="xs">
            <Box>Rotation: {rotationAngle}°</Box>
            <Slider
              min={0}
              max={360}
              value={rotationAngle}
              onChange={setRotationAngle}
            />
          </Stack>
          
          <Stack gap="xs" mb="xl">
            <Box>Position: {positionY < 50 ? "Top" : positionY > 50 ? "Bottom" : "Center"} ({positionY}%)</Box>
            <Slider
              min={10}
              max={90}
              value={positionY}
              onChange={setPositionY}
              marks={[
                { value: 10, label: 'Top' },
                { value: 50, label: 'Center' },
                { value: 90, label: 'Bottom' }
              ]}
            />
          </Stack>
          
          {pdfFile && (
            <Button onClick={handleDownload} fullWidth size="md" mt="xl">
              Download Watermarked PDF
            </Button>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

export default DocumentsWatermarking;