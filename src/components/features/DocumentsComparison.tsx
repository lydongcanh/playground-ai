import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileInput, Group, Stack, Title, Container, Grid, Text, Button, Badge, Box, Divider } from "@mantine/core";
import { IconArrowsDiff } from "@tabler/icons-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentsComparison: React.FC = () => {
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [leftNumPages, setLeftNumPages] = useState<number>(0);
  const [rightNumPages, setRightNumPages] = useState<number>(0);
  const [leftTextContent, setLeftTextContent] = useState<string[]>([]);
  const [rightTextContent, setRightTextContent] = useState<string[]>([]);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [diffResult, setDiffResult] = useState<{
    added: string[];
    removed: string[];
    diffText: string;
  }>({
    added: [],
    removed: [],
    diffText: ""
  });

  const onLeftFileChange = (file: File | null) => {
    if (file) {
      setLeftFile(file);
      setShowDiff(false);
      setLeftTextContent([]);
    }
  };

  const onRightFileChange = (file: File | null) => {
    if (file) {
      setRightFile(file);
      setShowDiff(false);
      setRightTextContent([]);
    }
  };

  const onLeftDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setLeftNumPages(numPages);
  };

  const onRightDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setRightNumPages(numPages);
  };

  const extractTextFromPage = (page: any): Promise<string> => {
    return new Promise((resolve) => {
      if (!page || !page.getTextContent) {
        resolve("");
        return;
      }
      
      page.getTextContent().then((textContent: any) => {
        const text = textContent.items.map((item: any) => item.str).join(' ');
        resolve(text);
      }).catch(() => {
        resolve("");
      });
    });
  };

  const onLeftPageRenderSuccess = async (page: any, pageIndex: number) => {
    const text = await extractTextFromPage(page);
    setLeftTextContent(prev => {
      const newContent = [...prev];
      newContent[pageIndex] = text;
      return newContent;
    });
  };

  const onRightPageRenderSuccess = async (page: any, pageIndex: number) => {
    const text = await extractTextFromPage(page);
    setRightTextContent(prev => {
      const newContent = [...prev];
      newContent[pageIndex] = text;
      return newContent;
    });
  };

  const findDifferences = () => {
    const leftFullText = leftTextContent.join(' ').replace(/\s+/g, ' ').trim();
    const rightFullText = rightTextContent.join(' ').replace(/\s+/g, ' ').trim();
    
    // Simple word-by-word difference calculation
    const leftWords = leftFullText.split(' ');
    const rightWords = rightFullText.split(' ');
    
    // Track added and removed words
    const added: string[] = [];
    const removed: string[] = [];

    // Dynamically calculate lookAhead based on file sizes
    const avgFileSize = (leftFullText.length + rightFullText.length) / 2;
    // Scale lookAhead from 3 (small files) to 10 (large files)
    const lookAhead = Math.max(3, Math.min(10, Math.floor(avgFileSize / 1000) + 3));
    
    console.log(`Dynamic lookAhead value: ${lookAhead} based on avg file size: ${avgFileSize} chars`);

    // Create diff output with git-like annotations
    let diffOutput = "";
    
    // Use a simplified diff algorithm (similar to LCS - longest common subsequence)
    let i = 0, j = 0;
    while (i < leftWords.length || j < rightWords.length) {
      if (i < leftWords.length && j < rightWords.length && leftWords[i] === rightWords[j]) {
        // Words match, keep them as context
        diffOutput += `<span class="diff-context">${leftWords[i]}</span> `;
        i++;
        j++;
      } else {
        // Try to find best match within the dynamically calculated window
        let foundMatch = false;
        
        // Look ahead in right text for matches
        for (let k = 1; k <= lookAhead && i + k < leftWords.length; k++) {
          if (j < rightWords.length && leftWords[i + k] === rightWords[j]) {
            // Found match ahead in left (old) text - these are removed words
            for (let r = 0; r < k; r++) {
              diffOutput += `<span class="diff-removed">${leftWords[i]}</span> `;
              removed.push(leftWords[i]);
              i++;
            }
            foundMatch = true;
            break;
          }
        }
        
        // Look ahead in left text for matches
        if (!foundMatch) {
          for (let k = 1; k <= lookAhead && j + k < rightWords.length; k++) {
            if (i < leftWords.length && leftWords[i] === rightWords[j + k]) {
              // Found match ahead in right (new) text - these are added words
              for (let a = 0; a < k; a++) {
                diffOutput += `<span class="diff-added">${rightWords[j]}</span> `;
                added.push(rightWords[j]);
                j++;
              }
              foundMatch = true;
              break;
            }
          }
        }
        
        // If no good matches found, treat as simple replacement
        if (!foundMatch) {
          if (i < leftWords.length) {
            diffOutput += `<span class="diff-removed">${leftWords[i]}</span> `;
            removed.push(leftWords[i]);
            i++;
          }
          if (j < rightWords.length) {
            diffOutput += `<span class="diff-added">${rightWords[j]}</span> `;
            added.push(rightWords[j]);
            j++;
          }
        }
      }
    }
    
    setDiffResult({
      added,
      removed,
      diffText: diffOutput
    });
    
    setShowDiff(true);
  };

  const handleShowDifferences = () => {
    findDifferences();
  };

  const renderDiffView = () => {
    if (!showDiff) return null;
    
    return (
      <Grid mt={20}>
        <Grid.Col span={12}>
          <Divider label="Git-style Differences View" labelPosition="center" />
          <Text size="sm" c="dimmed" mb={10}>File 1 (old) shown with <span style={{ color: 'red' }}>deletions in red</span>, File 2 (new) with <span style={{ color: 'green' }}>additions in green</span></Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Box style={{ 
            border: '1px solid #ccc', 
            padding: '15px',
            background: '#f8f9fa', 
            minHeight: '200px',
            position: 'relative',
            borderRadius: '4px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <Text size="sm" fw={700}>Unified Diff View</Text>
              <div>
                <Badge color="red" size="sm" mr={5}>
                  {diffResult.removed.length} removed
                </Badge>
                <Badge color="green" size="sm">
                  {diffResult.added.length} added
                </Badge>
              </div>
            </div>
            <div 
              style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                lineHeight: 1.5,
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
              dangerouslySetInnerHTML={{ 
                __html: diffResult.diffText
              }} 
            />
          </Box>
        </Grid.Col>
      </Grid>
    );
  };

  return (
    <Container size="xl">
      <Stack gap="md">
        <Title order={3}>Documents Comparison</Title>
        <Text size="sm" c="dimmed">Upload two PDF documents to compare them side by side</Text>
        
        <Grid>
          <Grid.Col span={6}>
            <FileInput 
              placeholder="Upload old document" 
              accept="application/pdf" 
              onChange={onLeftFileChange}
              label="File 1 (OLD)"
              description="This will be treated as the original file"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <FileInput 
              placeholder="Upload new document" 
              accept="application/pdf" 
              onChange={onRightFileChange}
              label="File 2 (NEW)"
              description="This will be treated as the modified file"
            />
          </Grid.Col>
        </Grid>
        
        {leftFile && rightFile && (
          <Group justify="center" mt={5} mb={5}>
            <Button 
              onClick={handleShowDifferences} 
              leftSection={<IconArrowsDiff size="1rem" />}
              variant="filled"
              color="blue"
            >
              Show Git-style Differences
            </Button>
          </Group>
        )}
        
        {renderDiffView()}
        
        <style dangerouslySetInnerHTML={{ __html: `
          .diff-added {
            background-color: rgba(0, 255, 0, 0.2);
            color: green;
            text-decoration: none;
            padding: 0 2px;
            border-radius: 2px;
            margin: 0 1px;
          }
          .diff-removed {
            background-color: rgba(255, 0, 0, 0.2);
            color: red;
            text-decoration: line-through;
            padding: 0 2px;
            border-radius: 2px;
            margin: 0 1px;
          }
          .diff-context {
            color: #333;
            margin: 0 1px;
          }
        `}} />
        
        <Grid>
          <Grid.Col span={6}>
            {leftFile && (
              <Stack>
                <Text fw={500}>OLD - {leftFile.name}</Text>
                <Document file={leftFile} onLoadSuccess={onLeftDocumentLoadSuccess}>
                  {Array.from({ length: leftNumPages }, (_, i) => (
                    <Page 
                      key={`left-page-${i}`} 
                      pageNumber={i + 1} 
                      scale={0.8} 
                      renderAnnotationLayer={true} 
                      renderTextLayer={true}
                      onRenderSuccess={(page) => onLeftPageRenderSuccess(page, i)}
                    />
                  ))}
                </Document>
              </Stack>
            )}
          </Grid.Col>
          <Grid.Col span={6}>
            {rightFile && (
              <Stack>
                <Text fw={500}>NEW - {rightFile.name}</Text>
                <Document file={rightFile} onLoadSuccess={onRightDocumentLoadSuccess}>
                  {Array.from({ length: rightNumPages }, (_, i) => (
                    <Page 
                      key={`right-page-${i}`} 
                      pageNumber={i + 1} 
                      scale={0.8} 
                      renderAnnotationLayer={true} 
                      renderTextLayer={true}
                      onRenderSuccess={(page) => onRightPageRenderSuccess(page, i)}
                    />
                  ))}
                </Document>
              </Stack>
            )}
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default DocumentsComparison;