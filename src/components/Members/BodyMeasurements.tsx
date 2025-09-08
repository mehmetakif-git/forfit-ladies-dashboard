import React, { useState } from 'react';
import { TrendingUp, Plus, Calendar, Ruler, Weight, Activity, Download, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Member, BodyMeasurement } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import FormField from '../UI/FormField';
import toast from 'react-hot-toast';

interface BodyMeasurementsProps {
  member: Member;
}

const BodyMeasurements: React.FC<BodyMeasurementsProps> = ({ member }) => {
  const { updateMember } = useApp();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurement>>({
    date: new Date().toISOString().split('T')[0],
    recordedBy: user?.name || 'Admin'
  });

  const measurements = member.bodyMeasurements || [];
  const sortedMeasurements = measurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare chart data
  const chartData = sortedMeasurements.map(m => ({
    date: format(new Date(m.date), 'MMM dd'),
    weight: m.weight,
    bodyFat: m.bodyFat,
    muscleMass: m.muscleMass,
    waist: m.waist,
  }));

  const handleSaveMeasurement = () => {
    if (!newMeasurement.weight && !newMeasurement.bodyFat && !newMeasurement.muscleMass) {
      toast.error('Please enter at least one measurement');
      return;
    }

    const measurementData: BodyMeasurement = {
      id: Date.now().toString(),
      date: newMeasurement.date || new Date().toISOString().split('T')[0],
      weight: newMeasurement.weight,
      bodyFat: newMeasurement.bodyFat,
      muscleMass: newMeasurement.muscleMass,
      chest: newMeasurement.chest,
      waist: newMeasurement.waist,
      hips: newMeasurement.hips,
      arms: newMeasurement.arms,
      thighs: newMeasurement.thighs,
      recordedBy: user?.name || 'Admin',
      notes: newMeasurement.notes
    };

    const updatedMeasurements = [...measurements, measurementData];
    updateMember(member.id, { bodyMeasurements: updatedMeasurements });

    setIsAddModalOpen(false);
    setNewMeasurement({
      date: new Date().toISOString().split('T')[0],
      recordedBy: user?.name || 'Admin'
    });
    toast.success('Measurements recorded successfully!');
  };

  const handleDeleteMeasurement = (measurementId: string) => {
    if (window.confirm('Are you sure you want to delete this measurement record?')) {
      const updatedMeasurements = measurements.filter(m => m.id !== measurementId);
      updateMember(member.id, { bodyMeasurements: updatedMeasurements });
      toast.success('Measurement deleted successfully!');
    }
  };

  const exportMeasurements = () => {
    toast.success('Measurements exported to CSV!');
  };

  const getLatestMeasurement = () => {
    return measurements.length > 0 ? measurements[measurements.length - 1] : null;
  };

  const getProgressIndicator = (current: number | undefined, previous: number | undefined, isLowerBetter = false) => {
    if (!current || !previous) return null;
    
    const change = current - previous;
    const isImprovement = isLowerBetter ? change < 0 : change > 0;
    
    return (
      <span className={`text-xs ${isImprovement ? 'text-green-400' : 'text-red-400'}`}>
        {isImprovement ? '↗' : '↘'} {Math.abs(change).toFixed(1)}
      </span>
    );
  };

  const latest = getLatestMeasurement();
  const previous = measurements.length > 1 ? measurements[measurements.length - 2] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Body Measurements ({measurements.length} records)
        </h3>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportMeasurements} icon={Download}>
            Export Data
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
            Record Measurements
          </Button>
        </div>
      </div>

      {/* Current Stats */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {latest.weight && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Weight className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg">{latest.weight} kg</p>
              <p className="text-white/60 text-sm">Weight</p>
              {previous?.weight && getProgressIndicator(latest.weight, previous.weight, true)}
            </div>
          )}
          
          {latest.bodyFat && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Activity className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg">{latest.bodyFat}%</p>
              <p className="text-white/60 text-sm">Body Fat</p>
              {previous?.bodyFat && getProgressIndicator(latest.bodyFat, previous.bodyFat, true)}
            </div>
          )}
          
          {latest.muscleMass && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg">{latest.muscleMass} kg</p>
              <p className="text-white/60 text-sm">Muscle Mass</p>
              {previous?.muscleMass && getProgressIndicator(latest.muscleMass, previous.muscleMass)}
            </div>
          )}
          
          {latest.waist && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Ruler className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg">{latest.waist} cm</p>
              <p className="text-white/60 text-sm">Waist</p>
              {previous?.waist && getProgressIndicator(latest.waist, previous.waist, true)}
            </div>
          )}
          
          {latest.chest && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Ruler className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg">{latest.chest} cm</p>
              <p className="text-white/60 text-sm">Chest</p>
              {previous?.chest && getProgressIndicator(latest.chest, previous.chest)}
            </div>
          )}
          
          {latest.hips && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Ruler className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg">{latest.hips} cm</p>
              <p className="text-white/60 text-sm">Hips</p>
              {previous?.hips && getProgressIndicator(latest.hips, previous.hips, true)}
            </div>
          )}
        </div>
      )}

      {/* Progress Charts */}
      {chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6">
            <h4 className="text-lg font-medium text-white mb-4">Weight & Body Composition</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#E5E6E6" />
                  <YAxis stroke="#E5E6E6" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(82, 58, 122, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} name="Weight (kg)" />
                  <Line type="monotone" dataKey="bodyFat" stroke="#EF4444" strokeWidth={2} name="Body Fat %" />
                  <Line type="monotone" dataKey="muscleMass" stroke="#10B981" strokeWidth={2} name="Muscle Mass (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <h4 className="text-lg font-medium text-white mb-4">Body Measurements</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#E5E6E6" />
                  <YAxis stroke="#E5E6E6" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(82, 58, 122, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="waist" stroke="#8B5CF6" strokeWidth={2} name="Waist (cm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Measurements History */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-4">Measurement History</h4>
        
        {measurements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Weight</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Body Fat</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Muscle</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Waist</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Recorded By</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sortedMeasurements.reverse().map((measurement) => (
                  <tr key={measurement.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white/80 text-sm">
                      {format(new Date(measurement.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">
                      {measurement.weight ? `${measurement.weight} kg` : '-'}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">
                      {measurement.bodyFat ? `${measurement.bodyFat}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">
                      {measurement.muscleMass ? `${measurement.muscleMass} kg` : '-'}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">
                      {measurement.waist ? `${measurement.waist} cm` : '-'}
                    </td>
                    <td className="px-4 py-3 text-white/80 text-sm">
                      {measurement.recordedBy}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                        className="p-1 rounded hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <Ruler className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No measurements recorded yet</p>
            <p className="text-sm">Start tracking progress by adding the first measurement</p>
          </div>
        )}
      </div>

      {/* Add Measurement Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Body Measurements"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Record Measurements for {member.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Date"
              type="date"
              value={newMeasurement.date}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, date: e.target.value }))}
            />
            
            <FormField
              label="Recorded By"
              value={newMeasurement.recordedBy}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, recordedBy: e.target.value }))}
            />

            <FormField
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={newMeasurement.weight?.toString() || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="65.5"
            />
            
            <FormField
              label="Body Fat (%)"
              type="number"
              step="0.1"
              value={newMeasurement.bodyFat?.toString() || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, bodyFat: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="22.5"
            />
            
            <FormField
              label="Muscle Mass (kg)"
              type="number"
              step="0.1"
              value={newMeasurement.muscleMass?.toString() || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, muscleMass: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="45.2"
            />
            
            <FormField
              label="Chest (cm)"
              type="number"
              step="0.1"
              value={newMeasurement.chest?.toString() || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, chest: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="90.5"
            />
            
            <FormField
              label="Waist (cm)"
              type="number"
              step="0.1"
              value={newMeasurement.waist?.toString() || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, waist: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="75.0"
            />
            
            <FormField
              label="Hips (cm)"
              type="number"
              step="0.1"
              value={newMeasurement.hips?.toString() || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, hips: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="95.0"
            />
            
            <FormField
              label="Arms (cm)"
              type="number"
              step="0.1"
              value={newMeasurement.arms?.toString() || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, arms: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="28.5"
            />
            
            <FormField
              label="Thighs (cm)"
              type="number"
              step="0.1"
              value={newMeasurement.thighs?.toString() || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, thighs: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="55.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={newMeasurement.notes || ''}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Additional notes about measurements or progress..."
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveMeasurement} className="flex-1">
              Save Measurements
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

      {/* Privacy Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-blue-300 font-medium mb-1">Health Data Privacy</h4>
            <p className="text-blue-200/80 text-sm">
              Body measurements are sensitive health information. Only qualified staff should record measurements. 
              Ensure member consent and maintain confidentiality at all times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

};

export default BodyMeasurements;