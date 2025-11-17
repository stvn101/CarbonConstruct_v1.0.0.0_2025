import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building, Crown } from "lucide-react";
import { UpgradeModal } from "./UpgradeModal";
import { Badge } from "./ui/badge";

const ProjectSelector = () => {
  const { currentProject, projects, createProject, selectProject } = useProject();
  const { canPerformAction, projectCount } = useUsageTracking();
  const [isCreating, setIsCreating] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    location: "",
    project_type: "construction"
  });

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    
    setIsCreating(true);
    const success = await createProject({
      ...newProject,
      status: "draft"
    }, () => canPerformAction('projects'));
    
    if (success) {
      setNewProject({
        name: "",
        description: "",
        location: "",
        project_type: "construction"
      });
    }
    setIsCreating(false);
  };

  if (!currentProject) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center px-4 sm:px-6">
          <Building className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <CardTitle className="text-lg sm:text-xl">No Project Selected</CardTitle>
          <CardDescription className="text-sm">
            Create a new project or select an existing one to start calculating emissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {projects.length > 0 && (
            <div className="space-y-2">
              <Label>Select Existing Project:</Label>
              <div className="grid gap-2">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => selectProject(project.id)}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    {project.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or create new
              </span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={!canPerformAction('projects').allowed}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
                {!canPerformAction('projects').allowed && (
                  <Crown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new carbon assessment project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-type">Project Type</Label>
                  <Select
                    value={newProject.project_type}
                    onValueChange={(value) => setNewProject({ ...newProject, project_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="renovation">Renovation</SelectItem>
                      <SelectItem value="operation">Operation</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-location">Location</Label>
                  <Input
                    id="project-location"
                    placeholder="Enter project location"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Enter project description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateProject}
                  disabled={!newProject.name.trim() || isCreating}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {!canPerformAction('projects').allowed && (
            <div className="text-sm text-center">
              <p className="text-muted-foreground mb-2">
                {canPerformAction('projects').reason}
              </p>
              <Button 
                variant="link" 
                size="sm" 
                className="gap-1"
                onClick={() => setUpgradeModalOpen(true)}
              >
                <Crown className="h-3 w-3" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border mb-4 md:mb-6">
        <Building className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Current Project:</p>
            {projectCount !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {projectCount} projects
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm sm:text-base truncate">{currentProject.name}</h3>
          {currentProject.description && (
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{currentProject.description}</p>
          )}
        </div>
      </div>
      
      <UpgradeModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        limitType="projects"
      />
    </>
  );
};

export default ProjectSelector;