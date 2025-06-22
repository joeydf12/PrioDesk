import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Image, MessageSquare, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { analyzeContent } from '@/services/geminiService';
import { useToast } from "@/components/ui/use-toast";
import { taskAttachmentService } from '@/services/taskAttachmentService';
import { toast } from 'sonner';

interface TaskUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (type: 'file' | 'image' | 'text', content: string, analysis: string) => void;
  taskId: string;
}

export function TaskUploadDialog({
  isOpen,
  onClose,
  onUpload = () => {},
  taskId,
}: TaskUploadDialogProps) {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Validate file type
      const isValidFile = activeTab === 'image' 
        ? file.type === 'image/png'
        : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      
      if (!isValidFile) {
        throw new Error(`Invalid file type. Expected ${activeTab === 'image' ? 'PNG image' : 'PDF or Word document'}`);
      }

      const content = await readFileContent(file);
      console.log('File content read:', content.substring(0, 100) + '...');

      // Store file and content for later processing
      setUploadedFile(file);
      setFileContent(content);
      
      toast({
        title: "File uploaded",
        description: `File "${file.name}" uploaded successfully. Choose an analysis option below.`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeTab, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: activeTab === 'image' 
      ? { 'image/png': ['.png'] }
      : { 
          'application/pdf': ['.pdf']
          // 'application/msword': ['.doc'],
          // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
    maxFiles: 1,
  });

  const handleTextSummary = async () => {
    if (!textContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsAnalyzing(true);
      const prompt = `Vat de volgende tekst samen in maximaal 5 zinnen. Focus op de hoofdpunten en belangrijkste informatie. Antwoord in het Nederlands.\n\n${textContent}`;
      const analysis = await analyzeContent('text', prompt);
      if (!analysis) throw new Error('No analysis result received');
      
      // Sanitize content before saving to Supabase
      const sanitizedContent = sanitizeContent(textContent);
      await taskAttachmentService.createAttachment(taskId, 'text', sanitizedContent, analysis);
      setAnalysisResult(analysis);
      onUpload('text', sanitizedContent, analysis);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
      toast({ title: "Success", description: "Samenvatting gemaakt!" });
    } catch (error) {
      console.error('Error creating summary:', error);
      toast({ title: "Error", description: "Samenvatting mislukt.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextBullets = async () => {
    if (!textContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsAnalyzing(true);
      const prompt = `Maak een puntsgewijze opsomming van de belangrijkste punten uit de volgende tekst. Gebruik maximaal 7 bullets. Antwoord in het Nederlands.\n\n${textContent}`;
      const analysis = await analyzeContent('text', prompt);
      if (!analysis) throw new Error('No analysis result received');
      
      // Sanitize content before saving to Supabase
      const sanitizedContent = sanitizeContent(textContent);
      await taskAttachmentService.createAttachment(taskId, 'text', sanitizedContent, analysis);
      setAnalysisResult(analysis);
      onUpload('text', sanitizedContent, analysis);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
      toast({ title: "Success", description: "Opsomming gemaakt!" });
    } catch (error) {
      toast({ title: "Error", description: "Opsomming mislukt.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSummary = async () => {
    if (!uploadedFile || !fileContent) {
      toast({
        title: "Error",
        description: "Please upload a file first",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsAnalyzing(true);
      
      // Check if content appears to be PDF binary data
      const isPdfBinary = fileContent.startsWith('%PDF-') || fileContent.includes('stream') || fileContent.includes('endstream');
      
      let prompt;
      let contentForAnalysis;
      
      if (isPdfBinary) {
        // Extract text from PDF before analysis
        const extractedText = extractTextFromPdf(fileContent);
        contentForAnalysis = extractedText;
        
        prompt = `Analyseer de volgende tekst die is geëxtraheerd uit een PDF-document en maak een beknopte samenvatting in het Nederlands. Focus op de hoofdpunten en belangrijkste informatie:

${extractedText}

Als de geëxtraheerde tekst beperkt is of geen leesbare inhoud bevat, leg dan uit waarom en geef aan welke informatie wel beschikbaar is.`;
      } else {
        contentForAnalysis = fileContent;
        prompt = `Vat de volgende tekst samen in maximaal 5 zinnen. Focus op de hoofdpunten en belangrijkste informatie. Antwoord in het Nederlands.\n\n${fileContent}`;
      }
      
      const analysis = await analyzeContent('file', contentForAnalysis);
      if (!analysis) throw new Error('No analysis result received');
      
      // Sanitize content before saving to Supabase
      const sanitizedContent = sanitizeContent(fileContent);
      await taskAttachmentService.createAttachment(taskId, 'file', sanitizedContent, analysis);
      setAnalysisResult(analysis);
      onUpload('file', sanitizedContent, analysis);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        // Reset state
        setUploadedFile(null);
        setFileContent('');
      }, 1500);
      toast({ title: "Success", description: "Samenvatting gemaakt!" });
    } catch (error) {
      console.error('Error creating file summary:', error);
      toast({ title: "Error", description: "Samenvatting mislukt.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileBullets = async () => {
    if (!uploadedFile || !fileContent) {
      toast({
        title: "Error",
        description: "Please upload a file first",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsAnalyzing(true);
      
      // Check if content appears to be PDF binary data
      const isPdfBinary = fileContent.startsWith('%PDF-') || fileContent.includes('stream') || fileContent.includes('endstream');
      
      let prompt;
      let contentForAnalysis;
      
      if (isPdfBinary) {
        // Extract text from PDF before analysis
        const extractedText = extractTextFromPdf(fileContent);
        contentForAnalysis = extractedText;
        
        prompt = `Analyseer de volgende tekst die is geëxtraheerd uit een PDF-document en maak een puntsgewijze opsomming van de belangrijkste punten. Gebruik maximaal 7 bullets. Antwoord in het Nederlands:

${extractedText}

Als de geëxtraheerde tekst beperkt is, maak dan een opsomming van wat er wel beschikbaar is aan informatie.`;
      } else {
        contentForAnalysis = fileContent;
        prompt = `Maak een puntsgewijze opsomming van de belangrijkste punten uit de volgende tekst. Gebruik maximaal 7 bullets. Antwoord in het Nederlands.\n\n${fileContent}`;
      }
      
      const analysis = await analyzeContent('file', contentForAnalysis);
      if (!analysis) throw new Error('No analysis result received');
      
      // Sanitize content before saving to Supabase
      const sanitizedContent = sanitizeContent(fileContent);
      await taskAttachmentService.createAttachment(taskId, 'file', sanitizedContent, analysis);
      setAnalysisResult(analysis);
      onUpload('file', sanitizedContent, analysis);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        // Reset state
        setUploadedFile(null);
        setFileContent('');
      }, 1500);
      toast({ title: "Success", description: "Opsomming gemaakt!" });
    } catch (error) {
      toast({ title: "Error", description: "Opsomming mislukt.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageAnalysis = async () => {
    if (!uploadedFile || !fileContent) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsAnalyzing(true);
      const analysis = await analyzeContent('image', fileContent);
      if (!analysis) throw new Error('No analysis result received');
      
      // Sanitize content before saving to Supabase
      const sanitizedContent = sanitizeContent(fileContent);
      await taskAttachmentService.createAttachment(taskId, 'image', sanitizedContent, analysis);
      setAnalysisResult(analysis);
      onUpload('image', sanitizedContent, analysis);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        // Reset state
        setUploadedFile(null);
        setFileContent('');
      }, 1500);
      toast({ title: "Success", description: "Afbeelding geanalyseerd!" });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({ title: "Error", description: "Analyse mislukt.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset uploaded file when switching tabs
    setUploadedFile(null);
    setFileContent('');
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result;
        
        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      // Handle different file types
      if (file.type === 'image/png') {
        // For images, read as data URL (base64 string)
        reader.readAsDataURL(file);
      } else {
        // For PDFs and Word documents, read as text
        // Note: This is a simplified approach. PDFs may not read properly as text
        // In a production environment, you'd want to use a PDF parsing library
        reader.readAsText(file);
      }
    });
  };

  const handleUpload = (type, content, analysis) => {
    onUpload(type, content, analysis);
  };

  const sanitizeContent = (content: string): string => {
    // Remove null bytes and other problematic characters for database storage
    return content
      .replace(/\u0000/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control characters
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n'); // Convert remaining carriage returns
  };

  const extractTextFromPdf = (pdfContent: string): string => {
    try {
      // Simple text extraction from PDF content
      // This extracts readable text that might be present in the PDF
      let extractedText = '';
      
      // Look for text patterns in PDF content
      const textMatches = pdfContent.match(/\(([^)]+)\)/g);
      if (textMatches) {
        extractedText = textMatches
          .map(match => match.slice(1, -1)) // Remove parentheses
          .filter(text => text.length > 3 && !text.match(/^[0-9\s]+$/)) // Filter out numbers and short strings
          .join(' ');
      }
      
      // Look for stream content that might contain text
      const streamMatches = pdfContent.match(/stream\s*([\s\S]*?)\s*endstream/g);
      if (streamMatches) {
        const streamText = streamMatches
          .map(stream => {
            // Try to extract readable text from streams
            const content = stream.replace(/stream\s*/, '').replace(/\s*endstream/, '');
            // Look for text patterns in stream content
            const textInStream = content.match(/\(([^)]+)\)/g);
            return textInStream ? textInStream.map(t => t.slice(1, -1)).join(' ') : '';
          })
          .filter(text => text.length > 0)
          .join(' ');
        
        if (streamText) {
          extractedText += ' ' + streamText;
        }
      }
      
      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\w\s.,!?;:()\-]/g, '') // Remove special characters but keep basic punctuation
        .trim();
      
      return extractedText || 'Geen leesbare tekst gevonden in het PDF-bestand.';
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return 'Fout bij het extraheren van tekst uit het PDF-bestand.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white p-4 rounded-lg">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
        </DialogHeader>
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <div className="text-xl font-semibold text-green-700 mb-2">Upload gelukt!</div>
            <div className="text-sm text-green-600">De analyse is toegevoegd aan de taak.</div>
          </div>
        ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="file">File</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Enter your text here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onClick={handleTextSummary}
                disabled={isAnalyzing || !textContent.trim()}
                className="w-full"
                variant="default"
              >
                {isAnalyzing ? 'Bezig...' : 'Maak samenvatting'}
              </Button>
              <Button
                onClick={handleTextBullets}
                disabled={isAnalyzing || !textContent.trim()}
                className="w-full"
                variant="outline"
              >
                {isAnalyzing ? 'Bezig...' : 'Maak opsomming'}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="file" className="space-y-4">
            {!uploadedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
              >
                <input {...getInputProps()} />
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop the file here'
                    : 'Drag and drop a PDF here, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: PDF (.pdf)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setFileContent('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    onClick={handleFileSummary}
                    disabled={isAnalyzing}
                    className="w-full"
                    variant="default"
                  >
                    {isAnalyzing ? 'Bezig...' : 'Maak samenvatting'}
                  </Button>
                  <Button
                    onClick={handleFileBullets}
                    disabled={isAnalyzing}
                    className="w-full"
                    variant="outline"
                  >
                    {isAnalyzing ? 'Bezig...' : 'Maak opsomming'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="image" className="space-y-4">
            {!uploadedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
              >
                <input {...getInputProps()} />
                <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag and drop a PNG image here, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported format: PNG (.png)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                  <Image className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setFileContent('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleImageAnalysis}
                  disabled={isAnalyzing}
                  className="w-full"
                  variant="default"
                >
                  {isAnalyzing ? 'Bezig...' : 'Analyseer afbeelding'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
} 