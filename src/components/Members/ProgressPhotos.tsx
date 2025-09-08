import React, { useState } from 'react';
import { Camera, Plus, Trash2, Eye, Calendar, Weight, FileText, Download } from 'lucide-react';
import { Member, ProgressPhoto } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import FormField from '../UI/FormField';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

interface ProgressPhotosProps {
  member: Member;
}

const ProgressPhotos: React.FC<ProgressPhotosProps> = ({ member }) => {
  const { updateMember } = useApp();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [newPhoto, setNewPhoto] = useState<{
    file: File | null;
    preview: string | null;
    weight: string;
    notes: string;
    type: 'before' | 'progress' | 'after';
  }>({
    file: null,
    preview: null,
    weight: '',
    notes: '',
    type: 'progress'
  });

  const progressPhotos = member.progressPhotos || [];
  const beforePhotos = progressPhotos.filter(p => p.type === 'before');
  const progressPhotosList = progressPhotos.filter(p => p.type === 'progress');
  const afterPhotos = progressPhotos.filter(p => p.type === 'after');

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Photo size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPhoto(prev => ({
          ...prev,
          file,
          preview: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (!newPhoto.file || !newPhoto.preview) {
      toast.error('Please select a photo');
      return;
    }

    const photoData: ProgressPhoto = {
      id: Date.now().toString(),
      url: newPhoto.preview,
      date: new Date().toISOString().split('T')[0],
      weight: newPhoto.weight ? parseFloat(newPhoto.weight) : undefined,
      notes: newPhoto.notes,
      type: newPhoto.type,
      uploadedBy: user?.name || 'Admin'
    };

    const updatedPhotos = [...progressPhotos, photoData];
    updateMember(member.id, { progressPhotos: updatedPhotos });

    setIsAddModalOpen(false);
    setNewPhoto({ file: null, preview: null, weight: '', notes: '', type: 'progress' });
    toast.success('Progress photo added successfully!');
  };

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      const updatedPhotos = progressPhotos.filter(p => p.id !== photoId);
      updateMember(member.id, { progressPhotos: updatedPhotos });
      toast.success('Photo deleted successfully!');
    }
  };

  const generateProgressReport = () => {
    toast.success('Progress report generated and ready for download!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Progress Photos ({progressPhotos.length})
        </h3>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateProgressReport} icon={Download}>
            Progress Report
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
            Add Photo
          </Button>
        </div>
      </div>

      {/* Photo Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Before Photos */}
        <div className="bg-white/5 rounded-xl p-6">
          <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            Before Photos ({beforePhotos.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {beforePhotos.map((photo) => (
              <div key={photo.id} className="relative group cursor-pointer" onClick={() => {
                setSelectedPhoto(photo);
                setIsViewModalOpen(true);
              }}>
                <img
                  src={photo.url}
                  alt="Before photo"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs bg-black/70 rounded px-2 py-1">
                    {format(new Date(photo.date), 'MMM dd')}
                    {photo.weight && ` • ${photo.weight}kg`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Photos */}
        <div className="bg-white/5 rounded-xl p-6">
          <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            Progress Photos ({progressPhotosList.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {progressPhotosList.map((photo) => (
              <div key={photo.id} className="relative group cursor-pointer" onClick={() => {
                setSelectedPhoto(photo);
                setIsViewModalOpen(true);
              }}>
                <img
                  src={photo.url}
                  alt="Progress photo"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs bg-black/70 rounded px-2 py-1">
                    {format(new Date(photo.date), 'MMM dd')}
                    {photo.weight && ` • ${photo.weight}kg`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* After Photos */}
        <div className="bg-white/5 rounded-xl p-6">
          <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            After Photos ({afterPhotos.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {afterPhotos.map((photo) => (
              <div key={photo.id} className="relative group cursor-pointer" onClick={() => {
                setSelectedPhoto(photo);
                setIsViewModalOpen(true);
              }}>
                <img
                  src={photo.url}
                  alt="After photo"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs bg-black/70 rounded px-2 py-1">
                    {format(new Date(photo.date), 'MMM dd')}
                    {photo.weight && ` • ${photo.weight}kg`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      {progressPhotos.length > 0 && (
        <div className="bg-white/5 rounded-xl p-6">
          <h4 className="text-lg font-medium text-white mb-4">Progress Timeline</h4>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {progressPhotos
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((photo, index) => (
                <div key={photo.id} className="flex-shrink-0 text-center">
                  <div className="relative">
                    <img
                      src={photo.url}
                      alt={`Progress ${index + 1}`}
                      className="w-24 h-32 object-cover rounded-lg cursor-pointer"
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setIsViewModalOpen(true);
                      }}
                    />
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      photo.type === 'before' ? 'bg-blue-400' :
                      photo.type === 'progress' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-white/80 text-xs mt-2">
                    {format(new Date(photo.date), 'MMM dd')}
                  </p>
                  {photo.weight && (
                    <p className="text-white/60 text-xs">{photo.weight}kg</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Progress Photo"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Add Progress Photo for {member.name}
            </h3>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Upload Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white"
              />
            </div>

            {newPhoto.preview && (
              <div className="bg-white/5 rounded-lg p-4">
                <img
                  src={newPhoto.preview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Photo Type
                </label>
                <select
                  value={newPhoto.type}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="before">Before</option>
                  <option value="progress">Progress</option>
                  <option value="after">After</option>
                </select>
              </div>

              <FormField
                label="Weight (kg) - Optional"
                type="number"
                step="0.1"
                value={newPhoto.weight}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="65.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={newPhoto.notes}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Add notes about this photo..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSavePhoto} className="flex-1" disabled={!newPhoto.file}>
              Save Photo
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Photo Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Progress Photo Details"
        size="lg"
      >
        {selectedPhoto && (
          <div className="space-y-6">
            <div className="text-center">
              <img
                src={selectedPhoto.url}
                alt="Progress photo"
                className="max-w-full max-h-96 object-contain rounded-lg mx-auto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm">Date</p>
                  <p className="text-white font-medium">
                    {format(new Date(selectedPhoto.date), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Type</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPhoto.type === 'before' ? 'bg-blue-500/20 text-blue-300' :
                    selectedPhoto.type === 'progress' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {selectedPhoto.type.charAt(0).toUpperCase() + selectedPhoto.type.slice(1)}
                  </span>
                </div>
                {selectedPhoto.weight && (
                  <div>
                    <p className="text-white/70 text-sm">Weight</p>
                    <p className="text-white font-medium">{selectedPhoto.weight} kg</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm">Uploaded By</p>
                  <p className="text-white font-medium">{selectedPhoto.uploadedBy}</p>
                </div>
                {selectedPhoto.notes && (
                  <div>
                    <p className="text-white/70 text-sm">Notes</p>
                    <p className="text-white font-medium">{selectedPhoto.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                icon={Trash2}
                className="flex-1"
              >
                Delete Photo
              </Button>
              <Button 
                variant="glass"
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Privacy Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-300 font-medium mb-1">Privacy & Consent Notice</h4>
            <p className="text-yellow-200/80 text-sm">
              Progress photos contain sensitive health data. Ensure proper member consent before uploading. 
              Photos should only be taken and recorded by qualified staff members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPhotos;