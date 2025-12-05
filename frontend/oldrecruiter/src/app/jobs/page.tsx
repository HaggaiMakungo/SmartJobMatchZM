'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Plus, Edit, Trash2, BarChart3, MapPin, Briefcase, Search } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  category?: string;
  company?: string;
  location?: string;
  job_type?: string;
  date_posted?: string;
  is_active: boolean;
  requirements?: string;
  education_level?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  new_applications?: number;
}

interface JobFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  job_type: string;
  requirements: string;
  education_level: string;
  experience_level: string;
  salary_min: string;
  salary_max: string;
}

export default function JobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    job_type: 'Full-time',
    requirements: '',
    education_level: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadJobs();
    }
  }, [user, authLoading, router]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterActive !== null) {
        params.is_active = filterActive;
      }
      const response = await api.get('/recruiter/jobs', { params });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      await api.post('/recruiter/jobs', {
        ...formData,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
      });
      setIsCreateOpen(false);
      resetForm();
      loadJobs();
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedJob) return;
    
    try {
      setFormLoading(true);
      await api.put(`/recruiter/jobs/${selectedJob.id}`, {
        ...formData,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
      });
      setIsEditOpen(false);
      setSelectedJob(null);
      resetForm();
      loadJobs();
    } catch (error) {
      console.error('Failed to update job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    
    try {
      setFormLoading(true);
      await api.delete(`/recruiter/jobs/${selectedJob.id}`);
      setIsDeleteOpen(false);
      setSelectedJob(null);
      loadJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (job: Job) => {
    try {
      await api.put(`/recruiter/jobs/${job.id}`, {
        is_active: !job.is_active,
      });
      loadJobs();
    } catch (error) {
      console.error('Failed to toggle job status:', error);
    }
  };

  const openEditDialog = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      category: job.category || '',
      location: job.location || '',
      job_type: job.job_type || 'Full-time',
      requirements: job.requirements || '',
      education_level: job.education_level || '',
      experience_level: job.experience_level || '',
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      job_type: 'Full-time',
      requirements: '',
      education_level: '',
      experience_level: '',
      salary_min: '',
      salary_max: '',
    });
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your active and inactive job listings
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search jobs by title, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterActive === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilterActive(null);
                  loadJobs();
                }}
              >
                All
              </Button>
              <Button
                variant={filterActive === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilterActive(true);
                  loadJobs();
                }}
              >
                Active
              </Button>
              <Button
                variant={filterActive === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilterActive(false);
                  loadJobs();
                }}
              >
                Inactive
              </Button>
            </div>
          </div>
        </Card>

        {/* Jobs Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No jobs found. Create your first job posting!
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.company}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-1 h-3 w-3" />
                        {job.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="mr-1 h-3 w-3" />
                        {job.job_type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={job.is_active ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(job)}
                      >
                        {job.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{job.new_applications || 0}</span>
                      {job.new_applications && job.new_applications > 0 && (
                        <span className="ml-1 text-xs text-green-600">new</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/jobs/${job.id}/analytics`)}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(job)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(job)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Create Job Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post New Job</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new job posting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Job Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Python Developer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Job Type *</label>
                  <Input
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                    placeholder="e.g., Full-time"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Location *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Lusaka, Zambia"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and expectations..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Requirements</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List the required skills and qualifications..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Education Level</label>
                  <Input
                    value={formData.education_level}
                    onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                    placeholder="e.g., Bachelor's degree"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Experience Level</label>
                  <Input
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    placeholder="e.g., 3-5 years"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Min Salary (ZMW)</label>
                  <Input
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="e.g., 10000"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Max Salary (ZMW)</label>
                  <Input
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="e.g., 20000"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={formLoading || !formData.title}>
                {formLoading ? 'Creating...' : 'Create Job'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Update the job posting details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Job Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Python Developer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Job Type *</label>
                  <Input
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                    placeholder="e.g., Full-time"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Location *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Lusaka, Zambia"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and expectations..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Requirements</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List the required skills and qualifications..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Education Level</label>
                  <Input
                    value={formData.education_level}
                    onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                    placeholder="e.g., Bachelor's degree"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Experience Level</label>
                  <Input
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    placeholder="e.g., 3-5 years"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Min Salary (ZMW)</label>
                  <Input
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="e.g., 10000"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Max Salary (ZMW)</label>
                  <Input
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="e.g., 20000"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedJob(null); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={formLoading || !formData.title}>
                {formLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Job</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setSelectedJob(null); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
                {formLoading ? 'Deleting...' : 'Delete Job'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
