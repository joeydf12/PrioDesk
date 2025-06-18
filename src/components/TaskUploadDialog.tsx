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
import { Upload, FileText, Image, MessageSquare, X, Loader2 } from 'lucide-react';
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
  onUpload,
  taskId,
}: TaskUploadDialogProps) {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      const content = await readFileContent(file);
      console.log('File content read:', content.substring(0, 100) + '...');

      const analysis = await analyzeContent(
        activeTab as 'file' | 'image' | 'text',
        content
      );
      console.log('Analysis result:', analysis);

      if (!analysis) {
        throw new Error('No analysis result received');
      }

      // Store in Supabase
      const attachment = await taskAttachmentService.createAttachment(
        taskId,
        activeTab as 'file' | 'image' | 'text',
        content,
        analysis
      );

      setAnalysisResult(analysis);
      onUpload(activeTab as 'file' | 'image' | 'text', content, analysis);
      toast({
        title: "Success",
        description: "Content analyzed and stored successfully",
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeTab, onUpload, taskId, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: activeTab === 'image' 
      ? { 'image/*': [] }
      : { 'text/*': [], 'application/pdf': [] },
    maxFiles: 1,
  });

  const handleTextSubmit = async () => {
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
      const analysis = await analyzeContent('text', textContent);
      console.log('Analysis result:', analysis);

      if (!analysis) {
        throw new Error('No analysis result received');
      }

      // Store in Supabase
      const attachment = await taskAttachmentService.createAttachment(
        taskId,
        'text',
        textContent,
        analysis
      );

      setAnalysisResult(analysis);
      onUpload('text', textContent, analysis);
      toast({
        title: "Success",
        description: "Text analyzed and stored successfully",
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Error",
        description: "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
      reader.readAsText(file);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white p-4 rounded-lg">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <Button
              onClick={handleTextSubmit}
              disabled={isAnalyzing || !textContent.trim()}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
            </Button>
          </TabsContent>
          <TabsContent value="file" className="space-y-4">
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
                  : 'Drag and drop a file here, or click to select'}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="image" className="space-y-4">
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
                  : 'Drag and drop an image here, or click to select'}
              </p>
            </div>
          </TabsContent>
        </Tabs>
        {analysisResult && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Analysis Result:</h4>
            <p className="text-sm text-muted-foreground">{analysisResult}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 