'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Save, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  date: string;
  isRunning: boolean;
  editedDuration?: number;
}

interface TimerProps {
  currentEntry: TimeEntry | null;
  projects: Project[];
  onStart: (projectId: string) => void;
  onStop: () => void;
  onSave: (entry: TimeEntry) => void;
  onUpdateEntry: (entry: TimeEntry) => void;
}

export function Timer({ currentEntry, projects, onStart, onStop, onSave, onUpdateEntry }: TimerProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editHours, setEditHours] = useState('0');
  const [editMinutes, setEditMinutes] = useState('0');
  const [editSeconds, setEditSeconds] = useState('0');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentEntry?.isRunning) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(currentEntry.startTime).getTime()) / 1000);
        setCurrentTime(elapsed);
      }, 1000);
    } else if (currentEntry && !currentEntry.isRunning) {
      setCurrentTime(currentEntry.editedDuration || currentEntry.duration);
    } else {
      setCurrentTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentEntry]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (selectedProject && !currentEntry?.isRunning) {
      onStart(selectedProject);
    }
  };

  const handleStop = () => {
    if (currentEntry?.isRunning) {
      onStop();
    }
  };

  const handleSave = () => {
    if (currentEntry && !currentEntry.isRunning) {
      onSave(currentEntry);
    }
  };

  const handleEditTime = () => {
    const totalSeconds = parseInt(editHours) * 3600 + parseInt(editMinutes) * 60 + parseInt(editSeconds);
    if (currentEntry) {
      const updatedEntry = { ...currentEntry, editedDuration: totalSeconds };
      onUpdateEntry(updatedEntry);
      setCurrentTime(totalSeconds);
    }
    setEditMode(false);
  };

  const openEditDialog = () => {
    const time = currentEntry?.editedDuration || currentEntry?.duration || 0;
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    
    setEditHours(hours.toString());
    setEditMinutes(minutes.toString());
    setEditSeconds(seconds.toString());
    setEditMode(true);
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="project-select">Select Project</Label>
          <Select value={selectedProject} onValueChange={setSelectedProject} disabled={currentEntry?.isRunning}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a project to track time" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProjectData && (
          <div className="p-4 rounded-lg border" style={{ borderColor: selectedProjectData.color + '40', backgroundColor: selectedProjectData.color + '10' }}>
            <p className="text-sm text-gray-600">Currently tracking</p>
            <p className="font-medium" style={{ color: selectedProjectData.color }}>
              {selectedProjectData.name}
            </p>
          </div>
        )}
      </div>

      <div className="text-center space-y-4">
        <div className="relative">
          <div className="text-6xl font-mono font-bold text-gray-900 tracking-wider">
            {formatTime(currentTime)}
          </div>
          {currentEntry && !currentEntry.isRunning && (
            <Dialog open={editMode} onOpenChange={setEditMode}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 opacity-70 hover:opacity-100"
                  onClick={openEditDialog}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Time Duration</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seconds">Seconds</Label>
                    <Input
                      id="seconds"
                      type="number"
                      min="0"
                      max="59"
                      value={editSeconds}
                      onChange={(e) => setEditSeconds(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditTime}>
                    Update Time
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {!currentEntry?.isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!selectedProject}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Timer
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              size="lg"
              variant="destructive"
            >
              <Pause className="h-5 w-5 mr-2" />
              Stop Timer
            </Button>
          )}

          {currentEntry && !currentEntry.isRunning && (
            <Button
              onClick={handleSave}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Entry
            </Button>
          )}
        </div>

        {currentEntry?.isRunning && (
          <div className="animate-pulse">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Timer is running...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}