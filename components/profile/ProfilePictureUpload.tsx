'use client';

import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  userName: string;
}

export function ProfilePictureUpload({ 
  currentImage, 
  onImageChange, 
  userName 
}: ProfilePictureUploadProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onImageChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = previewImage || currentImage;
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={displayImage} alt={userName} />
          <AvatarFallback className="text-2xl font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-background border-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <Card
        className={`w-full max-w-md transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-dashed'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            JPG, PNG, GIF up to 10MB
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Picture
            </Button>
            
            {/* {displayImage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )} */}
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}