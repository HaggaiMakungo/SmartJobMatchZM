'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Building2, FileText, DollarSign, Settings, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  department: z.string().min(1, 'Department is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  workArrangement: z.string().min(1, 'Work arrangement is required'),
  location: z.string().min(1, 'Location is required'),
  seniorityLevel: z.string().min(1, 'Seniority level is required'),
  summary: z.string().min(20, 'Summary must be at least 20 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  responsibilities: z.string().min(20, 'Responsibilities are required'),
  qualifications: z.string().min(20, 'Qualifications are required'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  showSalary: z.boolean().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function CreateJobModal({ open, onClose, job }: any) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [benefits, setBenefits] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: job || {}
  });

  useEffect(() => {
    if (open) {
      if (job) reset(job);
      setStep(1);
    }
  }, [open, job, reset]);

  if (!open) return null;

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(job ? 'Job updated successfully!' : 'Job posted successfully!');
      onClose();
      reset();
    } catch (error) {
      toast.error('Failed to save job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 5;

  const toggleBenefit = (benefit: string) => {
    setBenefits(prev => prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]);
  };

  const benefitsList = ['Health Insurance', 'Retirement Plan', 'Flexible Hours', 'Remote Work', 'Professional Development', 'Paid Time Off', 'Gym Membership', 'Meal Allowance'];

  return (
    <div className="fixed inset-0 bg-gunmetal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gunmetal rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage/10">
          <div>
            <h2 className="text-2xl font-bold text-gunmetal dark:text-peach">{job ? 'Edit Job' : 'Post New Job'}</h2>
            <p className="text-sm text-sage mt-1">Step {step} of {totalSteps}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-sage" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-sage/10">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex items-center ${i < 5 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= i ? 'bg-tangerine text-white' : 'bg-sage/20 text-sage'}`}>
                  {step > i ? <Check className="w-5 h-5" /> : i}
                </div>
                {i < 5 && <div className={`flex-1 h-1 mx-2 ${step > i ? 'bg-tangerine' : 'bg-sage/20'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-sage">
            <span>Basic Info</span>
            <span>Description</span>
            <span>Compensation</span>
            <span>Settings</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(90vh-280px)]">
          {step === 1 && <Step1BasicInfo register={register} errors={errors} />}
          {step === 2 && <Step2Description register={register} errors={errors} />}
          {step === 3 && <Step3Compensation register={register} errors={errors} benefits={benefits} toggleBenefit={toggleBenefit} benefitsList={benefitsList} />}
          {step === 4 && <Step4Settings register={register} errors={errors} />}
          {step === 5 && <Step5Preview watch={watch} benefits={benefits} />}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-sage/10">
          <button
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-2 px-6 py-2.5 border border-sage hover:bg-sage/10 text-gunmetal dark:text-peach rounded-lg font-medium transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium shadow-lg transition-all"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="flex items-center gap-2 px-6 py-2.5 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : (job ? 'Update Job' : 'Publish Job')}
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Step1BasicInfo({ register, errors }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-6 h-6 text-tangerine" />
        <h3 className="text-xl font-bold text-gunmetal dark:text-peach">Basic Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Job Title *</label>
          <input {...register('title')} placeholder="e.g., Senior Software Developer" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Department *</label>
          <select {...register('department')} className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach">
            <option value="">Select department</option>
            <option value="IT">IT</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
          {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Employment Type *</label>
          <select {...register('employmentType')} className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach">
            <option value="">Select type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
          {errors.employmentType && <p className="text-red-500 text-sm mt-1">{errors.employmentType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Work Arrangement *</label>
          <select {...register('workArrangement')} className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach">
            <option value="">Select arrangement</option>
            <option value="remote">Remote</option>
            <option value="on-site">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {errors.workArrangement && <p className="text-red-500 text-sm mt-1">{errors.workArrangement.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Location *</label>
          <input {...register('location')} placeholder="e.g., Lusaka or Remote" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Seniority Level *</label>
          <select {...register('seniorityLevel')} className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach">
            <option value="">Select level</option>
            <option value="entry">Entry Level</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid-Level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="manager">Manager</option>
            <option value="director">Director</option>
            <option value="executive">Executive</option>
          </select>
          {errors.seniorityLevel && <p className="text-red-500 text-sm mt-1">{errors.seniorityLevel.message}</p>}
        </div>
      </div>
    </div>
  );
}

function Step2Description({ register, errors }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-tangerine" />
        <h3 className="text-xl font-bold text-gunmetal dark:text-peach">Job Description</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Job Summary *</label>
        <textarea {...register('summary')} rows={3} placeholder="A brief 2-3 sentence overview of the role..." className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
        {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Full Description *</label>
        <textarea {...register('description')} rows={6} placeholder="Detailed job description..." className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Key Responsibilities *</label>
        <textarea {...register('responsibilities')} rows={5} placeholder="• Responsibility 1&#10;• Responsibility 2&#10;• Responsibility 3" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach font-mono text-sm" />
        {errors.responsibilities && <p className="text-red-500 text-sm mt-1">{errors.responsibilities.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Required Qualifications *</label>
        <textarea {...register('qualifications')} rows={5} placeholder="• Qualification 1&#10;• Qualification 2&#10;• Qualification 3" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach font-mono text-sm" />
        {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications.message}</p>}
      </div>
    </div>
  );
}

function Step3Compensation({ register, errors, benefits, toggleBenefit, benefitsList }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="w-6 h-6 text-tangerine" />
        <h3 className="text-xl font-bold text-gunmetal dark:text-peach">Compensation & Benefits</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Min Salary (ZMW)</label>
          <input {...register('salaryMin')} type="number" placeholder="50,000" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Max Salary (ZMW)</label>
          <input {...register('salaryMax')} type="number" placeholder="80,000" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input {...register('showSalary')} type="checkbox" className="w-4 h-4 text-tangerine rounded focus:ring-tangerine" />
        <span className="text-sm text-gunmetal dark:text-peach">Show salary publicly</span>
      </label>

      <div>
        <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Benefits & Perks</label>
        <div className="flex flex-wrap gap-2">
          {benefitsList.map((benefit: string) => (
            <button
              key={benefit}
              type="button"
              onClick={() => toggleBenefit(benefit)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${benefits.includes(benefit) ? 'bg-tangerine text-white' : 'bg-sage/10 text-gunmetal dark:text-peach hover:bg-sage/20'}`}
            >
              {benefit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4Settings({ register, errors }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="w-6 h-6 text-tangerine" />
        <h3 className="text-xl font-bold text-gunmetal dark:text-peach">Application Settings</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Application Deadline</label>
        <input type="date" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:ring-2 focus:ring-tangerine bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Required Documents</label>
        <div className="space-y-2">
          {['Resume/CV', 'Cover Letter', 'Portfolio', 'References'].map(doc => (
            <label key={doc} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked={doc === 'Resume/CV'} className="w-4 h-4 text-tangerine rounded focus:ring-tangerine" />
              <span className="text-sm text-gunmetal dark:text-peach">{doc}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" defaultChecked className="w-4 h-4 text-tangerine rounded focus:ring-tangerine" />
        <span className="text-sm text-gunmetal dark:text-peach">Email notifications for new applications</span>
      </label>
    </div>
  );
}

function Step5Preview({ watch, benefits }: any) {
  const data = watch();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Eye className="w-6 h-6 text-tangerine" />
        <h3 className="text-xl font-bold text-gunmetal dark:text-peach">Preview</h3>
      </div>

      <div className="bg-sage/5 rounded-xl p-6 border border-sage/10">
        <h2 className="text-2xl font-bold text-gunmetal dark:text-peach mb-2">{data.title || 'Job Title'}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-tangerine/10 text-tangerine rounded-full text-sm">{data.department}</span>
          <span className="px-3 py-1 bg-peach/10 text-gunmetal rounded-full text-sm">{data.workArrangement}</span>
          <span className="px-3 py-1 bg-sage/10 text-gunmetal dark:text-peach rounded-full text-sm">{data.location}</span>
        </div>
        <p className="text-sage mb-4">{data.summary}</p>
        <h3 className="font-bold text-gunmetal dark:text-peach mb-2">Description</h3>
        <p className="text-sage mb-4 whitespace-pre-line">{data.description}</p>
        {benefits.length > 0 && (
          <>
            <h3 className="font-bold text-gunmetal dark:text-peach mb-2">Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {benefits.map((b: string) => <span key={b} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{b}</span>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
