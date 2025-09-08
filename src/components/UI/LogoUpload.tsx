import React, { useState, useRef } from 'react';
import { Upload, X, RotateCcw, Image } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import Button from './Button';
import toast from 'react-hot-toast';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logo: string | null) => void;
  className?: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo, onLogoChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToStorage = async (file: File): Promise<string | null> => {
    if (!isSupabaseAvailable) {
      // Fallback to base64 for offline mode
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileName = `logo_${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('studio-assets')
        .upload(fileName, file);
      
      if (error) {
        console.warn('Storage upload failed, using base64 fallback:', error);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('studio-assets')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      console.warn('Storage upload error, using base64 fallback:', error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
  };
  const handleFileSelect = async (file: File) => {
    if (!file.type.match(/^image\/(png|jpg|jpeg|svg\+xml)$/)) {
      toast.error('Please upload a PNG, JPG, or SVG file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    toast.loading('Uploading logo...');
    
    try {
      const result = await uploadToStorage(file);
      if (result) {
      setPreview(result);
      onLogoChange(result);
        toast.dismiss();
        toast.success('Logo uploaded successfully!');
      } else {
        toast.dismiss();
        toast.error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload logo');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const resetLogo = () => {
    setPreview(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayLogo = preview || currentLogo;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Logo Preview */}
      {displayLogo && (
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Current Logo</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={resetLogo}
              icon={RotateCcw}
            >
              Reset
            </Button>
          </div>
          <div className="bg-white rounded-lg p-4 flex items-center justify-center">
            <img
              src={displayLogo}
              alt="Studio Logo"
              className="max-h-20 max-w-48 object-contain"
            />
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-white/20 hover:border-white/40'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-white/70" />
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-2">Upload Company Logo</h3>
            <p className="text-white/60 text-sm mb-4">
              Drag and drop your logo here, or click to browse
            </p>
            <p className="text-white/40 text-xs">
              Recommended size: 200x80px • PNG, JPG, SVG • Max 5MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/svg+xml"
            onChange={handleFileInput}
            className="hidden"
          />

          <Button
            variant="glass"
            onClick={() => fileInputRef.current?.click()}
            icon={Image}
          >
            Choose File
          </Button>
        </div>
      </div>

      {/* Upload Tips */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white/80 font-medium mb-2 text-sm">Logo Guidelines:</h4>
        <ul className="text-white/60 text-xs space-y-1">
          <li>• Use a transparent background (PNG) for best results</li>
          <li>• Keep text readable at small sizes</li>
          <li>• Horizontal layouts work best for the sidebar</li>
          <li>• High contrast colors ensure visibility</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoUpload;