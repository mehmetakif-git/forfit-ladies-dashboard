import React, { useState, useRef } from 'react';
import { Upload, X, RotateCcw, Globe } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import Button from './Button';
import toast from 'react-hot-toast';

interface FaviconUploadProps {
  currentFavicon?: string;
  onFaviconChange: (favicon: string | null) => void;
  className?: string;
}

const FaviconUpload: React.FC<FaviconUploadProps> = ({ currentFavicon, onFaviconChange, className = '' }) => {
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
      const fileName = `favicon_${Date.now()}.${file.name.split('.').pop()}`;
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
    if (!file.type.match(/^image\/(x-icon|png|vnd\.microsoft\.icon)$/)) {
      toast.error('Please upload a .ico or .png file');
      return;
    }

    if (file.size > 1 * 1024 * 1024) { // 1MB limit
      toast.error('File size must be less than 1MB');
      return;
    }

    toast.loading('Uploading favicon...');
    
    try {
      const result = await uploadToStorage(file);
      if (result) {
        setPreview(result);
        onFaviconChange(result);
        updateFavicon(result);
        toast.dismiss();
        toast.success('Favicon uploaded successfully!');
      } else {
        toast.dismiss();
        toast.error('Failed to upload favicon');
      }
    } catch (error) {
      console.error('Favicon upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload favicon');
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach(link => link.remove());

    // Add new favicon links for different sizes
    const sizes = ['16x16', '32x32', '64x64'];
    sizes.forEach(size => {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.sizes = size;
      link.href = faviconUrl;
      document.head.appendChild(link);
    });

    // Add fallback favicon
    const fallbackLink = document.createElement('link');
    fallbackLink.rel = 'shortcut icon';
    fallbackLink.href = faviconUrl;
    document.head.appendChild(fallbackLink);
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

  const resetFavicon = () => {
    setPreview(null);
    onFaviconChange(null);
    
    // Reset to default favicon
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach(link => link.remove());
    
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'icon';
    defaultLink.type = 'image/svg+xml';
    defaultLink.href = '/vite.svg';
    document.head.appendChild(defaultLink);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayFavicon = preview || currentFavicon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Favicon Preview */}
      {displayFavicon && (
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Current Favicon</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFavicon}
              icon={RotateCcw}
            >
              Reset
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg p-3 flex items-center justify-center">
              <img
                src={displayFavicon}
                alt="Favicon Preview"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="text-white/80 text-sm">
              <p>Preview in browser tab:</p>
              <div className="flex items-center gap-2 mt-1 p-2 bg-gray-800 rounded text-xs">
                <img src={displayFavicon} alt="" className="w-4 h-4" />
                <span>Forfit Ladies - Premium Fitness</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
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
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6 text-white/70" />
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-2">Upload Favicon</h3>
            <p className="text-white/60 text-sm mb-4">
              Drag and drop your favicon here, or click to browse
            </p>
            <p className="text-white/40 text-xs">
              Recommended sizes: 16x16px, 32x32px, 64x64px • ICO, PNG • Max 1MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".ico,.png,image/x-icon,image/png"
            onChange={handleFileInput}
            className="hidden"
          />

          <Button
            variant="glass"
            onClick={() => fileInputRef.current?.click()}
            icon={Globe}
          >
            Choose Favicon
          </Button>
        </div>
      </div>

      {/* Favicon Guidelines */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white/80 font-medium mb-2 text-sm">Favicon Guidelines:</h4>
        <ul className="text-white/60 text-xs space-y-1">
          <li>• Use square dimensions (16x16, 32x32, or 64x64 pixels)</li>
          <li>• Simple designs work best at small sizes</li>
          <li>• High contrast ensures visibility in browser tabs</li>
          <li>• ICO format supports multiple sizes in one file</li>
          <li>• PNG format is widely supported and recommended</li>
        </ul>
      </div>
    </div>
  );
};

export default FaviconUpload;