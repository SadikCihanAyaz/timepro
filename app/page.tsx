'use client';

import { useState, useEffect } from 'react';
import { Timer } from '../components/Timer';
import { ProjectSelector } from '../components/ProjectSelector';
import { TimeEntryHistory } from '../components/TimeEntryHistory';
import { PerformanceCharts } from '../components/PerformanceCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Clock, BarChart3, History, Settings } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
  date: string;
  isRunning: boolean;
  editedDuration?: number;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('timesheet-projects');
    const savedEntries = localStorage.getItem('timesheet-entries');
    const savedCurrentEntry = localStorage.getItem('timesheet-current-entry');

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Default projects
      const defaultProjects: Project[] = [
        { id: '1', name: 'Software Engineering', color: '#3B82F6', createdAt: new Date().toISOString() },
        { id: '2', name: 'UI/UX Design', color: '#10B981', createdAt: new Date().toISOString() },
        { id: '3', name: 'Project Management', color: '#F97316', createdAt: new Date().toISOString() },
      ];
      setProjects(defaultProjects);
      localStorage.setItem('timesheet-projects', JSON.stringify(defaultProjects));
    }

    if (savedEntries) {
      setTimeEntries(JSON.parse(savedEntries));
    }

    if (savedCurrentEntry) {
      setCurrentEntry(JSON.parse(savedCurrentEntry));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('timesheet-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('timesheet-entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    if (currentEntry) {
      localStorage.setItem('timesheet-current-entry', JSON.stringify(currentEntry));
    } else {
      localStorage.removeItem('timesheet-current-entry');
    }
  }, [currentEntry]);

  const addProject = (name: string, color: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, name: string, color: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, name, color } : p));
    setTimeEntries(entries => entries.map(entry => 
      entry.projectId === id ? { ...entry, projectName: name } : entry
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    // Note: We keep the time entries but they'll show as "Deleted Project"
  };

  const startTimer = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      projectId,
      projectName: project.name,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      date: new Date().toISOString().split('T')[0],
      isRunning: true,
    };

    setCurrentEntry(newEntry);
  };

  const stopTimer = () => {
    if (!currentEntry) return;

    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime).getTime() - new Date(currentEntry.startTime).getTime()) / 1000);

    const stoppedEntry: TimeEntry = {
      ...currentEntry,
      endTime,
      duration,
      isRunning: false,
    };

    setCurrentEntry(stoppedEntry);
  };

  const saveEntry = (entry: TimeEntry) => {
    setTimeEntries([...timeEntries, entry]);
    setCurrentEntry(null);
  };

  const updateTimeEntry = (id: string, updatedEntry: Partial<TimeEntry>) => {
    setTimeEntries(entries => 
      entries.map(entry => entry.id === id ? { ...entry, ...updatedEntry } : entry)
    );
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(entries => entries.filter(entry => entry.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TimeTracker Pro</h1>
          <p className="text-gray-600">Professional time tracking and productivity analytics</p>
        </div>

        <Tabs defaultValue="timer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Current Session</CardTitle>
                  <CardDescription>Track your time for the selected project</CardDescription>
                </CardHeader>
                <CardContent>
                  <Timer
                    currentEntry={currentEntry}
                    projects={projects}
                    onStart={startTimer}
                    onStop={stopTimer}
                    onSave={saveEntry}
                    onUpdateEntry={setCurrentEntry}
                  />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Today's productivity overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Today's Total</span>
                      <span className="text-lg font-semibold">
                        {Math.floor(
                          timeEntries
                            .filter(entry => entry.date === new Date().toISOString().split('T')[0])
                            .reduce((total, entry) => total + (entry.editedDuration || entry.duration), 0) / 3600
                        )}h {Math.floor(
                          (timeEntries
                            .filter(entry => entry.date === new Date().toISOString().split('T')[0])
                            .reduce((total, entry) => total + (entry.editedDuration || entry.duration), 0) % 3600) / 60
                        )}m
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Sessions</span>
                      <span className="text-lg font-semibold">{currentEntry ? 1 : 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Entries</span>
                      <span className="text-lg font-semibold">{timeEntries.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <TimeEntryHistory
              entries={timeEntries}
              projects={projects}
              onUpdateEntry={updateTimeEntry}
              onDeleteEntry={deleteTimeEntry}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <PerformanceCharts entries={timeEntries} projects={projects} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectSelector
              projects={projects}
              onAdd={addProject}
              onUpdate={updateProject}
              onDelete={deleteProject}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}