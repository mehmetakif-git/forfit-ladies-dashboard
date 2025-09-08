import React, { useState, useEffect } from 'react';
import FeatureGuard from '../components/UI/FeatureGuard';
import { 
  Camera, 
  Play, 
  Pause, 
  Download, 
  Maximize, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Monitor, 
  Shield, 
  Clock, 
  MapPin, 
  Activity, 
  Filter, 
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Breadcrumb from '../components/UI/Breadcrumb';
import StatsCard from '../components/UI/StatsCard';
import FormField from '../components/UI/FormField';
import toast from 'react-hot-toast';

interface SecurityCamera {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  streamUrl: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastPing: string;
  isRecording: boolean;
  resolution: string;
  nightVision: boolean;
  motionDetection: boolean;
}

interface SecurityEvent {
  id: string;
  cameraId: string;
  cameraName: string;
  type: 'motion_detected' | 'door_access' | 'alert_triggered' | 'recording_started' | 'recording_stopped';
  timestamp: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  imageUrl?: string;
}

const SecurityCameras: React.FC = () => {
  const { user } = useAuth();

  return (
    <FeatureGuard feature="security_cameras">
      <SecurityCamerasContent />
    </FeatureGuard>
  );
};

const SecurityCamerasContent: React.FC = () => {
  const { user } = useAuth();
  const [cameras, setCameras] = useState<SecurityCamera[]>([
    {
      id: '1',
      name: 'Main Entrance',
      location: 'Front Door',
      ipAddress: '192.168.1.101',
      streamUrl: 'rtsp://192.168.1.101:554/stream',
      status: 'online',
      lastPing: new Date().toISOString(),
      isRecording: true,
      resolution: '1080p',
      nightVision: true,
      motionDetection: true
    },
    {
      id: '2',
      name: 'Gym Floor',
      location: 'Main Workout Area',
      ipAddress: '192.168.1.102',
      streamUrl: 'rtsp://192.168.1.102:554/stream',
      status: 'online',
      lastPing: new Date().toISOString(),
      isRecording: true,
      resolution: '1080p',
      nightVision: false,
      motionDetection: true
    },
    {
      id: '3',
      name: 'Reception Area',
      location: 'Front Desk',
      ipAddress: '192.168.1.103',
      streamUrl: 'rtsp://192.168.1.103:554/stream',
      status: 'online',
      lastPing: new Date().toISOString(),
      isRecording: false,
      resolution: '720p',
      nightVision: false,
      motionDetection: true
    },
    {
      id: '4',
      name: 'Locker Room Entrance',
      location: 'Changing Area Entry',
      ipAddress: '192.168.1.104',
      streamUrl: 'rtsp://192.168.1.104:554/stream',
      status: 'maintenance',
      lastPing: '2024-12-19T10:00:00',
      isRecording: false,
      resolution: '1080p',
      nightVision: true,
      motionDetection: false
    },
    {
      id: '5',
      name: 'Emergency Exit',
      location: 'Back Exit',
      ipAddress: '192.168.1.105',
      streamUrl: 'rtsp://192.168.1.105:554/stream',
      status: 'error',
      lastPing: '2024-12-18T15:30:00',
      isRecording: false,
      resolution: '720p',
      nightVision: true,
      motionDetection: true
    },
    {
      id: '6',
      name: 'Parking Area',
      location: 'Outdoor Parking',
      ipAddress: '192.168.1.106',
      streamUrl: 'rtsp://192.168.1.106:554/stream',
      status: 'online',
      lastPing: new Date().toISOString(),
      isRecording: true,
      resolution: '1080p',
      nightVision: true,
      motionDetection: true
    }
  ]);

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      cameraId: '1',
      cameraName: 'Main Entrance',
      type: 'door_access',
      timestamp: '2024-12-20T10:45:00',
      description: 'Member entry detected - Sarah Johnson',
      severity: 'low',
      resolved: true,
      resolvedBy: 'System',
      resolvedAt: '2024-12-20T10:45:05'
    },
    {
      id: '2',
      cameraId: '2',
      cameraName: 'Gym Floor',
      type: 'motion_detected',
      timestamp: '2024-12-20T10:30:00',
      description: 'Motion detected in main workout area',
      severity: 'low',
      resolved: true
    },
    {
      id: '3',
      cameraId: '5',
      cameraName: 'Emergency Exit',
      type: 'alert_triggered',
      timestamp: '2024-12-20T09:15:00',
      description: 'Camera offline - connection lost',
      severity: 'high',
      resolved: false
    },
    {
      id: '4',
      cameraId: '1',
      cameraName: 'Main Entrance',
      type: 'recording_started',
      timestamp: '2024-12-20T08:00:00',
      description: 'Scheduled recording started',
      severity: 'low',
      resolved: true
    }
  ]);

  const [selectedCamera, setSelectedCamera] = useState<SecurityCamera | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<SecurityCamera | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [gridSize, setGridSize] = useState<'2x2' | '3x3' | '2x3'>('2x2');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update camera status
      setCameras(prev => prev.map(camera => ({
        ...camera,
        lastPing: camera.status === 'online' ? new Date().toISOString() : camera.lastPing
      })));

      // Occasionally add new events
      if (Math.random() < 0.1) {
        const randomCamera = cameras[Math.floor(Math.random() * cameras.length)];
        const eventTypes: SecurityEvent['type'][] = ['motion_detected', 'door_access'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const newEvent: SecurityEvent = {
          id: Date.now().toString(),
          cameraId: randomCamera.id,
          cameraName: randomCamera.name,
          type: randomType,
          timestamp: new Date().toISOString(),
          description: `${randomType.replace('_', ' ')} in ${randomCamera.location}`,
          severity: 'low',
          resolved: false
        };

        setSecurityEvents(prev => [newEvent, ...prev.slice(0, 49)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, cameras]);

  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const recordingCameras = cameras.filter(c => c.isRecording).length;
  const unresolvedEvents = securityEvents.filter(e => !e.resolved).length;
  const todayEvents = securityEvents.filter(e => 
    e.timestamp.startsWith(new Date().toISOString().split('T')[0])
  ).length;

  const filteredEvents = securityEvents.filter(event => {
    const matchesType = filterEventType === 'all' || event.type === filterEventType;
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    return matchesType && matchesSeverity;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'offline': return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'maintenance': return <Settings className="w-5 h-5 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'offline': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500/20 text-blue-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'high': return 'bg-orange-500/20 text-orange-300';
      case 'critical': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleToggleRecording = (cameraId: string) => {
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId 
        ? { ...camera, isRecording: !camera.isRecording }
        : camera
    ));
    
    const camera = cameras.find(c => c.id === cameraId);
    toast.success(`Recording ${camera?.isRecording ? 'stopped' : 'started'} for ${camera?.name}`);
  };

  const handleResolveEvent = (eventId: string) => {
    setSecurityEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            resolved: true, 
            resolvedBy: user?.name || 'Admin',
            resolvedAt: new Date().toISOString()
          }
        : event
    ));
    toast.success('Event marked as resolved');
  };

  const handleAddCamera = () => {
    setEditingCamera(null);
    setIsCameraModalOpen(true);
  };

  const handleEditCamera = (camera: SecurityCamera) => {
    setEditingCamera(camera);
    setIsCameraModalOpen(true);
  };

  const handleDeleteCamera = (cameraId: string) => {
    if (window.confirm('Are you sure you want to remove this camera?')) {
      setCameras(prev => prev.filter(c => c.id !== cameraId));
      toast.success('Camera removed successfully');
    }
  };

  const exportSecurityReport = () => {
    toast.success('Security report exported to PDF!');
  };

  const getGridCols = () => {
    switch (gridSize) {
      case '2x2': return 'grid-cols-2';
      case '3x3': return 'grid-cols-3';
      case '2x3': return 'grid-cols-2 lg:grid-cols-3';
      default: return 'grid-cols-2';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Camera className="w-8 h-8" />
            Security Cameras
          </h1>
          <p className="text-white/70">Live monitoring and security event management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportSecurityReport} icon={Download}>
            Export Report
          </Button>
          <Button onClick={handleAddCamera} icon={Plus}>
            Add Camera
          </Button>
        </div>
      </div>

      {/* Security Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Cameras Online"
          value={`${onlineCameras}/${cameras.length}`}
          icon={Camera}
          color="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="Recording"
          value={recordingCameras}
          icon={Monitor}
          color="from-blue-500 to-cyan-600"
        />
        <StatsCard
          title="Unresolved Events"
          value={unresolvedEvents}
          icon={AlertTriangle}
          color="from-red-500 to-orange-500"
        />
        <StatsCard
          title="Today's Events"
          value={todayEvents}
          icon={Activity}
          trend={{ value: 12, isPositive: false }}
          color="from-purple-500 to-indigo-600"
        />
      </div>

      {/* Camera Controls */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Camera Controls</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-white/80 text-sm">Auto Refresh:</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-primary' : 'bg-white/20'
                } relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                } absolute top-0.5`} />
              </button>
            </div>
            
            <select
              value={gridSize}
              onChange={(e) => setGridSize(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="2x2">2x2 Grid</option>
              <option value="2x3">2x3 Grid</option>
              <option value="3x3">3x3 Grid</option>
            </select>
            
            <Button variant="glass" onClick={() => window.location.reload()} icon={RefreshCw}>
              Refresh All
            </Button>
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Camera Feeds */}
        <div className="lg:col-span-3">
          <div className={`grid ${getGridCols()} gap-4`}>
            {cameras.map((camera) => (
              <div key={camera.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                {/* Camera Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{camera.name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(camera.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(camera.status)}`}>
                        {camera.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">{camera.location}</p>
                </div>

                {/* Video Feed */}
                <div className="relative bg-black aspect-video">
                  {camera.status === 'online' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-white/50 mx-auto mb-2" />
                        <p className="text-white/70 text-sm">Live Feed</p>
                        <p className="text-white/50 text-xs">{camera.resolution}</p>
                      </div>
                      
                      {/* Simulated live indicators */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">LIVE</span>
                      </div>
                      
                      {camera.isRecording && (
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-white text-xs">REC</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center">
                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                        <p className="text-red-300 text-sm">Camera Offline</p>
                        <p className="text-white/50 text-xs">
                          Last seen: {format(new Date(camera.lastPing), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Camera Controls Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleRecording(camera.id)}
                        disabled={camera.status !== 'online'}
                        className={`p-2 rounded-lg transition-colors ${
                          camera.isRecording 
                            ? 'bg-red-500/80 hover:bg-red-500 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        {camera.isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedCamera(camera);
                          setIsFullscreen(true);
                        }}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCamera(camera)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Camera Info */}
                <div className="p-3 bg-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">IP: {camera.ipAddress}</span>
                    <div className="flex items-center gap-3">
                      {camera.nightVision && (
                        <span className="text-purple-300">🌙 Night Vision</span>
                      )}
                      {camera.motionDetection && (
                        <span className="text-blue-300">👁 Motion</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Live Events</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-xs">LIVE</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <select
                  value={filterEventType}
                  onChange={(e) => setFilterEventType(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Events</option>
                  <option value="motion_detected">Motion</option>
                  <option value="door_access">Door Access</option>
                  <option value="alert_triggered">Alerts</option>
                  <option value="recording_started">Recording</option>
                </select>
                
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredEvents.slice(0, 20).map((event) => (
                <div key={event.id} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  !event.resolved ? 'bg-white/5' : ''
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        event.resolved ? 'bg-gray-400' : 'bg-red-400 animate-pulse'
                      }`}></div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </div>
                    {!event.resolved && (
                      <button
                        onClick={() => handleResolveEvent(event.id)}
                        className="p-1 rounded hover:bg-white/10 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-white font-medium text-sm mb-1">{event.cameraName}</p>
                  <p className="text-white/80 text-xs mb-2">{event.description}</p>
                  <p className="text-white/60 text-xs">
                    {format(new Date(event.timestamp), 'h:mm a')}
                  </p>
                  
                  {event.resolved && (
                    <p className="text-green-300/80 text-xs mt-1">
                      ✓ Resolved by {event.resolvedBy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Management Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Camera Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Camera</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">IP Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Recording</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Last Ping</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {cameras.map((camera) => (
                <tr key={camera.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-white font-medium">{camera.name}</p>
                        <p className="text-white/60 text-sm">{camera.resolution}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/60" />
                      <span className="text-white/80">{camera.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-mono text-sm">{camera.ipAddress}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(camera.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(camera.status)}`}>
                        {camera.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {camera.isRecording ? (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                      <span className="text-white/80 text-sm">
                        {camera.isRecording ? 'Recording' : 'Stopped'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {format(new Date(camera.lastPing), 'h:mm a')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditCamera(camera)}
                        className="p-2 rounded-lg hover:bg-white/10 text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCamera(camera.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Overall Status</span>
              <span className="text-green-400 font-bold">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Uptime</span>
              <span className="text-white font-bold">99.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Storage Used</span>
              <span className="text-white font-bold">2.4 TB / 10 TB</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Event Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Today</span>
              <span className="text-white font-bold">{todayEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">This Week</span>
              <span className="text-white font-bold">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Unresolved</span>
              <span className="text-red-400 font-bold">{unresolvedEvents}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recording Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Active Recordings</span>
              <span className="text-white font-bold">{recordingCameras}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Today's Footage</span>
              <span className="text-white font-bold">18.5 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Retention</span>
              <span className="text-white font-bold">30 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Camera Modal */}
      <Modal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={selectedCamera?.name || 'Camera View'}
        size="xl"
      >
        {selectedCamera && (
          <div className="space-y-4">
            <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
              {selectedCamera.status === 'online' ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center">
                    <Camera className="w-24 h-24 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70 text-lg">Live Feed - {selectedCamera.name}</p>
                    <p className="text-white/50">{selectedCamera.resolution} • {selectedCamera.location}</p>
                  </div>
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">LIVE</span>
                  </div>
                  
                  {selectedCamera.isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium">RECORDING</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <XCircle className="w-24 h-24 text-red-400 mx-auto mb-4" />
                    <p className="text-red-300 text-lg">Camera Offline</p>
                    <p className="text-white/50">
                      Last seen: {format(new Date(selectedCamera.lastPing), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => handleToggleRecording(selectedCamera.id)}
                disabled={selectedCamera.status !== 'online'}
                variant={selectedCamera.isRecording ? 'outline' : 'primary'}
                icon={selectedCamera.isRecording ? Pause : Play}
              >
                {selectedCamera.isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              
              <Button variant="glass" icon={Download}>
                Download Footage
              </Button>
              
              <Button variant="glass" icon={Settings}>
                Camera Settings
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Camera Modal */}
      <Modal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        title={editingCamera ? 'Edit Camera' : 'Add New Camera'}
      >
        <CameraForm
          camera={editingCamera}
          onSuccess={() => {
            setIsCameraModalOpen(false);
            setEditingCamera(null);
            toast.success(editingCamera ? 'Camera updated successfully!' : 'Camera added successfully!');
          }}
        />
      </Modal>
    </div>
  );
};

// Camera Form Component
const CameraForm: React.FC<{ camera?: SecurityCamera | null; onSuccess: () => void }> = ({ camera, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: camera?.name || '',
    location: camera?.location || '',
    ipAddress: camera?.ipAddress || '',
    streamUrl: camera?.streamUrl || '',
    resolution: camera?.resolution || '1080p',
    nightVision: camera?.nightVision || false,
    motionDetection: camera?.motionDetection || true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In real app, would save to database
    console.log('Saving camera:', formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Camera Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="Main Entrance Camera"
        />
        
        <FormField
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          required
          placeholder="Front Door Area"
        />
        
        <FormField
          label="IP Address"
          value={formData.ipAddress}
          onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
          required
          placeholder="192.168.1.101"
        />
        
        <FormField
          label="Stream URL"
          value={formData.streamUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, streamUrl: e.target.value }))}
          required
          placeholder="rtsp://192.168.1.101:554/stream"
        />
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Resolution</label>
          <select
            value={formData.resolution}
            onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="720p">720p HD</option>
            <option value="1080p">1080p Full HD</option>
            <option value="4K">4K Ultra HD</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.nightVision}
            onChange={(e) => setFormData(prev => ({ ...prev, nightVision: e.target.checked }))}
            className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
          />
          <span className="text-white/80">Night Vision Enabled</span>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.motionDetection}
            onChange={(e) => setFormData(prev => ({ ...prev, motionDetection: e.target.checked }))}
            className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
          />
          <span className="text-white/80">Motion Detection Enabled</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {camera ? 'Update Camera' : 'Add Camera'}
        </Button>
        <Button variant="outline" onClick={onSuccess} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default SecurityCameras;