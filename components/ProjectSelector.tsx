'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';

interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  onAdd: (name: string, color: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
}

const defaultColors = [
  '#3B82F6', '#10B981', '#F97316', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F59E0B', '#EC4899', '#6B7280'
];

export function ProjectSelector({ projects, onAdd, onUpdate, onDelete }: ProjectSelectorProps) {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(defaultColors[0]);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectColor, setEditProjectColor] = useState('');

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAdd(newProjectName.trim(), newProjectColor);
      setNewProjectName('');
      setNewProjectColor(defaultColors[0]);
      setIsAddingProject(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setEditProjectColor(project.color);
  };

  const handleUpdateProject = () => {
    if (editingProject && editProjectName.trim()) {
      onUpdate(editingProject.id, editProjectName.trim(), editProjectColor);
      setEditingProject(null);
      setEditProjectName('');
      setEditProjectColor('');
    }
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? Time entries will be preserved but marked as "Deleted Project".')) {
      onDelete(id);
    }
  };

  const cancelAdd = () => {
    setIsAddingProject(false);
    setNewProjectName('');
    setNewProjectColor(defaultColors[0]);
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setEditProjectName('');
    setEditProjectColor('');
  };

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Project Management</CardTitle>
              <CardDescription>Create and manage your projects for time tracking</CardDescription>
            </div>
            <Button onClick={() => setIsAddingProject(true)} disabled={isAddingProject}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAddingProject && (
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <h4 className="font-medium mb-3">Add New Project</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-project-name">Project Name</Label>
                  <Input
                    id="new-project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                  />
                </div>
                <div>
                  <Label>Project Color</Label>
                  <div className="flex gap-2 mt-2">
                    {defaultColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newProjectColor === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewProjectColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddProject} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={cancelAdd} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {projects.length === 0 ? (
            <Alert>
              <AlertDescription>
                No projects yet. Create your first project to start tracking time.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-3">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  {editingProject?.id === project.id ? (
                    <div className="flex-1 space-y-3">
                      <div>
                        <Input
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateProject()}
                        />
                      </div>
                      <div>
                        <div className="flex gap-2">
                          {defaultColors.map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 ${
                                editProjectColor === color ? 'border-gray-900' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditProjectColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateProject} size="sm">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-500">
                            Created {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditProject(project)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProject(project.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}