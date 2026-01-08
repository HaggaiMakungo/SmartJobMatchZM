import { useState } from 'react';
import { 
  X, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  FileText,
  Tag,
  Users,
  Mail,
  Building2,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api/client';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface JobFormData {
  title: string;
  category: string;
  location: string;
  contract_type: string;
  description: string;
  requirements: string;
  salary_min: string;
  salary_max: string;
  remote_option: string;
  deadline: string;
  positions: string;
  contact_email: string;
  skills: string[];
}

const initialFormData: JobFormData = {
  title: '',
  category: '',
  location: '',
  contract_type: 'Full-time',
  description: '',
  requirements: '',
  salary_min: '',
  salary_max: '',
  remote_option: 'On-site',
  deadline: '',
  positions: '1',
  contact_email: '',
  skills: []
};

const categories = [
  'Engineering',
  'Healthcare',
  'Finance',
  'Marketing',
  'Sales',
  'Education',
  'IT & Software',
  'Customer Service',
  'Operations',
  'Human Resources',
  'Legal',
  'Administration',
  'Other'
];

const contractTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Temporary'
];

const remoteOptions = [
  'On-site',
  'Remote',
  'Hybrid'
];

export default function PostJobModal({ isOpen, onClose, onSuccess }: PostJobModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Details, 3: Preview

  if (!isOpen) return null;

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) return 'Job title is required';
    if (!formData.category) return 'Category is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.contract_type) return 'Contract type is required';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.description.trim()) return 'Job description is required';
    if (!formData.requirements.trim()) return 'Requirements are required';
    if (formData.skills.length === 0) return 'At least one skill is required';
    return null;
  };

  const nextStep = () => {
    if (step === 1) {
      const error = validateStep1();
      if (error) {
        setError(error);
        return;
      }
    } else if (step === 2) {
      const error = validateStep2();
      if (error) {
        setError(error);
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Prepare job data for API
      const jobData = {
        title: formData.title,
        company: user?.company_name || '',
        category: formData.category,
        location: formData.location,
        contract_type: formData.contract_type,
        description: formData.description,
        requirements: formData.requirements,
        skills: formData.skills,
        salary_range: formData.salary_min && formData.salary_max 
          ? `${formData.salary_min} - ${formData.salary_max}` 
          : null,
        remote_option: formData.remote_option,
        application_deadline: formData.deadline || null,
        positions_available: parseInt(formData.positions) || 1,
        contact_email: formData.contact_email || user?.email || ''
      };

      await apiClient.createJob(jobData);
      
      // Reset form
      setFormData(initialFormData);
      setStep(1);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create job:', err);
      setError(err.response?.data?.detail || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Job Title *
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tangerine"
          />
        </div>
      </div>

      {/* Company (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={user?.company_name || ''}
            disabled
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-tangerine"
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Location *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Lusaka, Zambia"
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tangerine"
          />
        </div>
      </div>

      {/* Contract Type & Remote Option */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract Type *
          </label>
          <select
            value={formData.contract_type}
            onChange={(e) => handleInputChange('contract_type', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-tangerine"
          >
            {contractTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Remote Option
          </label>
          <select
            value={formData.remote_option}
            onChange={(e) => handleInputChange('remote_option', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-tangerine"
          >
            {remoteOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Job Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
          rows={4}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tangerine resize-none"
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Requirements *
        </label>
        <textarea
          value={formData.requirements}
          onChange={(e) => handleInputChange('requirements', e.target.value)}
          placeholder="List required qualifications, experience, and skills..."
          rows={4}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tangerine resize-none"
        />
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Required Skills *
        </label>
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Type a skill and press Enter"
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tangerine"
            />
          </div>
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg transition"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1 bg-tangerine/10 text-tangerine border border-tangerine/20 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-tangerine/70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Salary Range (Optional)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.salary_min}
              onChange={(e) => handleInputChange('salary_min', e.target.value)}
              placeholder="Min"
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tangerine"
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.salary_max}
              onChange={(e) => handleInputChange('salary_max', e.target.value)}
              placeholder="Max"
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tangerine"
            />
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Application Deadline
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-tangerine"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of Positions
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              value={formData.positions}
              onChange={(e) => handleInputChange('positions', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-tangerine"
            />
          </div>
        </div>
      </div>

      {/* Contact Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Contact Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleInputChange('contact_email', e.target.value)}
            placeholder={user?.email || 'contact@company.com'}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tangerine"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Preview Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-4">{formData.title}</h3>
        
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Building2 className="w-4 h-4" />
            <span>{user?.company_name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{formData.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Briefcase className="w-4 h-4" />
            <span>{formData.contract_type}</span>
          </div>
          {formData.salary_min && formData.salary_max && (
            <div className="flex items-center gap-2 text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span>{formData.salary_min} - {formData.salary_max}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-2">Description</h4>
            <p className="text-gray-400 whitespace-pre-wrap">{formData.description}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Requirements</h4>
            <p className="text-gray-400 whitespace-pre-wrap">{formData.requirements}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-tangerine/10 text-tangerine border border-tangerine/20 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">Ready to post this job?</p>
            <p className="text-gray-400">
              Once posted, the job will be visible to candidates and AI matching will begin automatically.
              You can edit or close the job at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Post New Job</h2>
            <p className="text-sm text-gray-400 mt-1">
              Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Job Details' : 'Review & Post'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition ${
                  s <= step ? 'bg-tangerine' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={step === 1 ? onClose : prevStep}
            className="px-4 py-2 text-gray-400 hover:text-white transition"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Post Job
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
