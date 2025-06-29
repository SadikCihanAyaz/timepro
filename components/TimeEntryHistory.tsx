'use client';

import { useState, useMemo } from 'react';
import { Edit2, Trash2, Save, X, Calendar, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

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

interface TimeEntryHistoryProps {
  entries: TimeEntry[];
  projects: Project[];
  onUpdateEntry: (id: string, updatedEntry: Partial<TimeEntry>) => void;
  onDeleteEntry: (id: string) => void;
}

export function TimeEntryHistory({ entries, projects, onUpdateEntry, onDeleteEntry }: TimeEntryHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editHours, setEditHours] = useState('0');
  const [editMinutes, setEditMinutes] = useState('0');
  const [editSeconds, setEditSeconds] = useState('0');

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Filter by project
    if (filterProject !== 'all') {
      filtered = filtered.filter(entry => entry.projectId === filterProject);
    }

    // Filter by date range
    if (filterDateFrom) {
      filtered = filtered.filter(entry => entry.date >= filterDateFrom);
    }
    if (filterDateTo) {
      filtered = filtered.filter(entry => entry.date <= filterDateTo);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [entries, filterProject, filterDateFrom, filterDateTo]);

  const totalHours = useMemo(() => {
    const totalSeconds = filteredEntries.reduce((total, entry) => {
      return total + (entry.editedDuration || entry.duration);
    }, 0);
    return totalSeconds / 3600;
  }, [filteredEntries]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredEntries.slice(start, end);
  }, [filteredEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditEntry = (entry: TimeEntry) => {
    const time = entry.editedDuration || entry.duration;
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    
    setEditHours(hours.toString());
    setEditMinutes(minutes.toString());
    setEditSeconds(seconds.toString());
    setEditingEntry(entry);
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;

    const totalSeconds = parseInt(editHours) * 3600 + parseInt(editMinutes) * 60 + parseInt(editSeconds);
    onUpdateEntry(editingEntry.id, { editedDuration: totalSeconds });
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      onDeleteEntry(id);
    }
  };

  const clearFilters = () => {
    setFilterProject('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(1);
  };

  const getProjectColor = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#6B7280';
  };

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Time Entry History
              </CardTitle>
              <CardDescription>
                View and manage your tracked time entries
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Hours (Filtered)</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filter-project">Project</Label>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
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
              <div>
                <Label htmlFor="filter-date-from">From Date</Label>
                <Input
                  id="filter-date-from"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filter-date-to">To Date</Label>
                <Input
                  id="filter-date-to"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Entries List */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No time entries found. {entries.length === 0 ? 'Start tracking time to see entries here.' : 'Try adjusting your filters.'}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: getProjectColor(entry.projectId) }}
                        />
                        <div>
                          <p className="font-medium">{entry.projectName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{formatDate(entry.date)}</span>
                            <span>{formatDateTime(entry.startTime)} - {entry.endTime ? formatDateTime(entry.endTime) : 'Running'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-mono font-semibold">
                            {formatTime(entry.editedDuration || entry.duration)}
                          </p>
                          {entry.editedDuration && entry.editedDuration !== entry.duration && (
                            <Badge variant="secondary" className="text-xs">
                              Edited
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEntry(entry)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Time Entry</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {entry.projectName} - {formatDate(entry.date)}
                                  </p>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor="edit-hours">Hours</Label>
                                    <Input
                                      id="edit-hours"
                                      type="number"
                                      min="0"
                                      value={editHours}
                                      onChange={(e) => setEditHours(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-minutes">Minutes</Label>
                                    <Input
                                      id="edit-minutes"
                                      type="number"
                                      min="0"
                                      max="59"
                                      value={editMinutes}
                                      onChange={(e) => setEditMinutes(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-seconds">Seconds</Label>
                                    <Input
                                      id="edit-seconds"
                                      type="number"
                                      min="0"
                                      max="59"
                                      value={editSeconds}
                                      onChange={(e) => setEditSeconds(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogTrigger>
                                  <DialogTrigger asChild>
                                    <Button onClick={handleUpdateEntry}>
                                      <Save className="h-4 w-4 mr-1" />
                                      Update
                                    </Button>
                                  </DialogTrigger>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}