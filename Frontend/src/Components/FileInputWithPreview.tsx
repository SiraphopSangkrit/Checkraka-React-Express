import { useState, useRef } from "react";
import { Card, CardBody, Image, Button } from "@heroui/react";
import { Upload, X, FileImage } from "lucide-react";

interface FileInputWithPreviewProps {
  onFileChange?: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: File | null;
}

export default function FileInputWithPreview({
  onFileChange,
  accept = "image/*",
  maxSize = 10,
  className = "",
  placeholder = "Click to upload or drag and drop",
  disabled = false,
  value = null,
}: FileInputWithPreviewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(value);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Check file type
    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      alert(`Please select a valid file type: ${accept}`);
      return;
    }

    setSelectedFile(file);
    onFileChange?.(file);

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileChange?.(null);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-primary-500" />;
    }
    return <Upload className="w-8 h-8 text-default-400" />;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      {/* Upload Area or Preview */}
      {!selectedFile ? (
        <Card 
          isPressable={!disabled}
          onPress={() => !disabled && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed transition-all duration-200 cursor-pointer w-full
            ${dragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' 
              : 'border-default-300 hover:border-primary-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowedx' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardBody className="flex flex-col items-center justify-center py-8 space-y-3">
            <Upload className={`w-8 h-8 ${dragActive ? 'text-primary-500' : 'text-default-400'}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {placeholder}
              </p>
              <p className="text-xs text-default-500 mt-1">
                {accept.replace('*', '').toUpperCase()} up to {maxSize}MB
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        /* Preview Section */
        <Card>
          <CardBody className="p-4">
            <div className="flex items-start space-x-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-default-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(selectedFile)}
                  </div>
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-default-500 mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
                <p className="text-xs text-default-500">
                  {selectedFile.type || 'Unknown type'}
                </p>
              </div>
              
              {/* Remove Button */}
              {!disabled && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={handleRemoveFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
