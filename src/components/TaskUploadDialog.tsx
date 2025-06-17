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
import { Upload, FileText, Image, MessageSquare, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";

interface TaskUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (type: 'file' | 'image' | 'text', content: File | string) => void;
}

export const TaskUploadDialog: React.FC<TaskUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'image' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: activeTab === 'image' 
      ? { 'image/*': [] }
      : { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    multiple: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'text' && textContent) {
      onUpload('text', textContent);
    } else if ((activeTab === 'file' || activeTab === 'image') && selectedFile) {
      onUpload(activeTab, selectedFile);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setTextContent('');
    onClose();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const renderFileUpload = () => {
    if (isMobile) {
      return (
        <div className="space-y-2">
          <Label htmlFor="file">Kies een bestand</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept={activeTab === 'image' ? "image/*" : ".pdf,.doc,.docx,.txt"}
          />
        </div>
      );
    }

    return (
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
          selectedFile ? "border-green-500" : ""
        )}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">{selectedFile.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeSelectedFile();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Laat het bestand hier los..."
                : "Sleep een bestand hierheen of klik om te selecteren"}
            </p>
            <p className="text-xs text-gray-500">
              {activeTab === 'image' 
                ? "Ondersteunde formaten: JPG, PNG, GIF"
                : "Ondersteunde formaten: PDF, DOC, DOCX, TXT"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload bijlage</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'file' | 'image' | 'text')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bestand
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Afbeelding
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Tekst
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            {renderFileUpload()}
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            {renderFileUpload()}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Voer tekst in</Label>
              <Textarea
                id="text"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Typ hier je tekst..."
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuleren
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              (activeTab === 'text' && !textContent) ||
              ((activeTab === 'file' || activeTab === 'image') && !selectedFile)
            }
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 