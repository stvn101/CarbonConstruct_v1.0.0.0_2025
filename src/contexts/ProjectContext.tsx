import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  project_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  selectProject: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      
      // If no current project and we have projects, select the first one
      if (!currentProject && data && data.length > 0) {
        setCurrentProject(data[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error loading projects",
        description: "Failed to load your projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await refreshProjects();
      setCurrentProject(data);
      
      toast({
        title: "Project created",
        description: `${projectData.name} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error creating project",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user]);

  const value = {
    currentProject,
    projects,
    loading,
    createProject,
    selectProject,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};