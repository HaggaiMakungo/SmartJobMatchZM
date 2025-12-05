'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Palette, Briefcase, CheckCircle, ArrowRight, ArrowLeft, Sparkles, Upload, Phone, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';

const step2Schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  recruiterName: z.string().min(2, 'Your name is required'),
  role: z.string().min(1, 'Please select your role'),
  companySize: z.string().min(1, 'Please select company size'),
});

const step4Schema = z.object({
  roleTypes: z.array(z.string()).min(1, 'Select at least one role type'),
  collarTypes: z.array(z.string()).min(1, 'Select at least one collar type'),
  seniorityLevels: z.array(z.string()).min(1, 'Select at least one seniority level'),
  workArrangements: z.array(z.string()).min(1, 'Select at least one work arrangement'),
});

const step5Schema = z.object({
  phone: z.string().min(10, 'Valid phone number required'),
});

type Step2Data = z.infer<typeof step2Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type Step5Data = z.infer<typeof step5Schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('/ZedSafeLogo.png');
  const [onboardingData, setOnboardingData] = useState<any>({});

  const totalSteps = 5;

  const skipOnboarding = () => {
    toast.info('You can complete onboarding later from Settings');
    router.push('/dashboard');
  };

  const handleFinalSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const completeData = { ...onboardingData, ...data };
      await axios.post('/api/recruiter/onboarding', completeData);
      toast.success('Onboarding complete! Welcome to ZedSafe');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal via-gunmetal to-gunmetal/90 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f2d492' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />

      <div className="relative w-full max-w-4xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-peach text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <button onClick={skipOnboarding} className="text-sage hover:text-peach text-sm transition-colors">Complete Later →</button>
          </div>
          <div className="h-2 bg-gunmetal/50 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-tangerine to-peach" initial={{width: '0%'}} animate={{width: `${(currentStep/totalSteps)*100}%`}} transition={{duration: 0.5}} />
          </div>
        </div>

        <motion.div className="bg-white dark:bg-gunmetal/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 md:p-12" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && <Step1Welcome key="1" onNext={() => setCurrentStep(2)} />}
            {currentStep === 2 && <Step2Identity key="2" onNext={(d) => {setOnboardingData({...onboardingData, ...d}); setCurrentStep(3);}} onBack={() => setCurrentStep(1)} />}
            {currentStep === 3 && <Step3Branding key="3" onNext={(d) => {setOnboardingData({...onboardingData, ...d}); setCurrentStep(4);}} onBack={() => setCurrentStep(2)} logoPreview={logoPreview} setLogoPreview={setLogoPreview} />}
            {currentStep === 4 && <Step4Preferences key="4" onNext={(d) => {setOnboardingData({...onboardingData, ...d}); setCurrentStep(5);}} onBack={() => setCurrentStep(3)} />}
            {currentStep === 5 && <Step5Verification key="5" onSubmit={handleFinalSubmit} onBack={() => setCurrentStep(4)} isSubmitting={isSubmitting} />}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function Step1Welcome({onNext}: {onNext: () => void}) {
  return (
    <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="text-center py-12">
      <Sparkles className="w-16 h-16 text-tangerine mx-auto mb-6" />
      <h1 className="text-4xl font-bold text-gunmetal dark:text-peach mb-4">The Best and the Brightest,</h1>
      <h2 className="text-3xl font-semibold text-tangerine mb-8">No Need to Light a Candle.</h2>
      <p className="text-lg text-sage mb-12 max-w-2xl mx-auto">Welcome to ZedSafe Recruiter Dashboard. Let's set up your account so you can start finding the perfect candidates.</p>
      <button onClick={onNext} className="px-8 py-4 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
        Let's Get Started <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function Step2Identity({onNext, onBack}: {onNext: (d: Step2Data) => void; onBack: () => void}) {
  const {register, handleSubmit, formState: {errors}} = useForm<Step2Data>({resolver: zodResolver(step2Schema)});
  
  return (
    <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
      <div className="flex items-center gap-3 mb-6"><Building2 className="w-8 h-8 text-tangerine" /><h2 className="text-3xl font-bold text-gunmetal dark:text-peach">Company Identity</h2></div>
      <p className="text-sage mb-8">Tell us about your organization</p>
      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Company Name *</label>
          <input {...register('companyName')} placeholder="e.g., Acme Corp" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:border-tangerine focus:ring-2 focus:ring-tangerine/20 bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
          {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Your Name *</label>
          <input {...register('recruiterName')} placeholder="Your full name" className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:border-tangerine focus:ring-2 focus:ring-tangerine/20 bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
          {errors.recruiterName && <p className="text-red-500 text-sm mt-1">{errors.recruiterName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Your Role *</label>
          <select {...register('role')} className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:border-tangerine focus:ring-2 focus:ring-tangerine/20 bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach">
            <option value="">Select role</option>
            <option value="hr_manager">HR Manager</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="owner">Owner</option>
            <option value="recruiter">Recruiter</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Company Size *</label>
          <select {...register('companySize')} className="w-full px-4 py-3 rounded-lg border border-sage/30 focus:border-tangerine focus:ring-2 focus:ring-tangerine/20 bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach">
            <option value="">Select size</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="501-1000">501-1000</option>
            <option value="1000+">1000+</option>
          </select>
          {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize.message}</p>}
        </div>
        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} className="flex-1 px-6 py-3 border border-sage hover:bg-sage/10 text-gunmetal dark:text-peach rounded-lg font-medium flex items-center justify-center gap-2"><ArrowLeft className="w-5 h-5" />Back</button>
          <button type="submit" className="flex-1 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium shadow-lg flex items-center justify-center gap-2">Continue<ArrowRight className="w-5 h-5" /></button>
        </div>
      </form>
    </motion.div>
  );
}

function Step3Branding({onNext, onBack, logoPreview, setLogoPreview}: any) {
  const {register, handleSubmit, setValue} = useForm();
  const handleLogoUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
      setValue('logo', e.target.files);
    }
  };

  return (
    <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
      <div className="flex items-center gap-3 mb-6"><Palette className="w-8 h-8 text-tangerine" /><h2 className="text-3xl font-bold text-gunmetal dark:text-peach">Branding Setup</h2></div>
      <p className="text-sage mb-8">Customize your dashboard appearance</p>
      <form onSubmit={handleSubmit(onNext)} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-4">Company Logo</label>
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-xl bg-white dark:bg-gunmetal/50 border-2 border-dashed border-sage/30 flex items-center justify-center overflow-hidden">
              {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <Upload className="w-12 h-12 text-sage" />}
            </div>
            <label className="cursor-pointer px-6 py-2 bg-sage/20 hover:bg-sage/30 text-gunmetal dark:text-peach rounded-lg">
              <span className="text-sm font-medium">Upload Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            <p className="text-xs text-sage text-center">Using ZedSafe logo for demo</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-4">Brand Color</label>
          <div className="flex items-center gap-4">
            <input {...register('brandColor')} type="color" defaultValue="#f29559" className="w-16 h-16 rounded-lg border border-sage/30 cursor-pointer" />
            <p className="text-sm text-sage">Personalize your dashboard theme</p>
          </div>
        </div>
        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} className="flex-1 px-6 py-3 border border-sage hover:bg-sage/10 text-gunmetal dark:text-peach rounded-lg font-medium flex items-center justify-center gap-2"><ArrowLeft className="w-5 h-5" />Back</button>
          <button type="submit" className="flex-1 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium shadow-lg flex items-center justify-center gap-2">Continue<ArrowRight className="w-5 h-5" /></button>
        </div>
      </form>
    </motion.div>
  );
}

function Step4Preferences({onNext, onBack}: {onNext: (d: Step4Data) => void; onBack: () => void}) {
  const {handleSubmit, formState: {errors}, watch, setValue} = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {roleTypes: [], collarTypes: [], seniorityLevels: [], workArrangements: []}
  });

  const roleTypes = ['IT', 'Hospitality', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'General Work'];
  const collarTypes = ['White Collar', 'Blue Collar', 'Grey Collar', 'Pink Collar', 'Green Collar'];
  const seniorityLevels = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager', 'Director', 'Executive'];
  const workArrangements = ['Remote', 'On-site', 'Hybrid'];

  const toggle = (field: keyof Step4Data, value: string) => {
    const current = watch(field) || [];
    setValue(field, current.includes(value) ? current.filter(v => v !== value) : [...current, value], {shouldValidate: true});
  };

  return (
    <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
      <div className="flex items-center gap-3 mb-6"><Briefcase className="w-8 h-8 text-tangerine" /><h2 className="text-3xl font-bold text-gunmetal dark:text-peach">Hiring Preferences</h2></div>
      <p className="text-sage mb-2">Help us understand your typical hiring needs</p>
      <p className="text-xs text-sage/70 mb-8">Powers CAMSS intelligence for better candidate matching</p>
      <form onSubmit={handleSubmit(onNext)} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Types of Roles *</label>
          <div className="flex flex-wrap gap-2">
            {roleTypes.map(t => <button key={t} type="button" onClick={() => toggle('roleTypes', t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${watch('roleTypes')?.includes(t) ? 'bg-tangerine text-white' : 'bg-sage/10 text-gunmetal dark:text-peach hover:bg-sage/20'}`}>{t}</button>)}
          </div>
          {errors.roleTypes && <p className="text-red-500 text-sm mt-2">{errors.roleTypes.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Collar Types *</label>
          <div className="flex flex-wrap gap-2">
            {collarTypes.map(t => <button key={t} type="button" onClick={() => toggle('collarTypes', t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${watch('collarTypes')?.includes(t) ? 'bg-tangerine text-white' : 'bg-sage/10 text-gunmetal dark:text-peach hover:bg-sage/20'}`}>{t}</button>)}
          </div>
          {errors.collarTypes && <p className="text-red-500 text-sm mt-2">{errors.collarTypes.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Seniority Levels *</label>
          <div className="flex flex-wrap gap-2">
            {seniorityLevels.map(t => <button key={t} type="button" onClick={() => toggle('seniorityLevels', t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${watch('seniorityLevels')?.includes(t) ? 'bg-tangerine text-white' : 'bg-sage/10 text-gunmetal dark:text-peach hover:bg-sage/20'}`}>{t}</button>)}
          </div>
          {errors.seniorityLevels && <p className="text-red-500 text-sm mt-2">{errors.seniorityLevels.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-3">Work Arrangements *</label>
          <div className="flex flex-wrap gap-2">
            {workArrangements.map(t => <button key={t} type="button" onClick={() => toggle('workArrangements', t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${watch('workArrangements')?.includes(t) ? 'bg-tangerine text-white' : 'bg-sage/10 text-gunmetal dark:text-peach hover:bg-sage/20'}`}>{t}</button>)}
          </div>
          {errors.workArrangements && <p className="text-red-500 text-sm mt-2">{errors.workArrangements.message}</p>}
        </div>
        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} className="flex-1 px-6 py-3 border border-sage hover:bg-sage/10 text-gunmetal dark:text-peach rounded-lg font-medium flex items-center justify-center gap-2"><ArrowLeft className="w-5 h-5" />Back</button>
          <button type="submit" className="flex-1 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium shadow-lg flex items-center justify-center gap-2">Continue<ArrowRight className="w-5 h-5" /></button>
        </div>
      </form>
    </motion.div>
  );
}

function Step5Verification({onSubmit, onBack, isSubmitting}: {onSubmit: (d: Step5Data) => void; onBack: () => void; isSubmitting: boolean}) {
  const {register, handleSubmit, formState: {errors}} = useForm<Step5Data>({resolver: zodResolver(step5Schema)});

  return (
    <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
      <div className="flex items-center gap-3 mb-6"><CheckCircle className="w-8 h-8 text-tangerine" /><h2 className="text-3xl font-bold text-gunmetal dark:text-peach">Verification</h2></div>
      <p className="text-sage mb-2">Protect candidates from fraudulent employers</p>
      <p className="text-xs text-sage/70 mb-8">Maintains trust and safety on the platform</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-peach/10 border border-peach/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-tangerine mt-0.5" />
            <div><p className="text-sm font-medium text-gunmetal dark:text-peach">Email Verified ✓</p><p className="text-xs text-sage mt-1">Verified during registration</p></div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Phone Number *</label>
          <div className="flex gap-2">
            <input {...register('phone')} type="tel" placeholder="+260 9XX XXX XXX" className="flex-1 px-4 py-3 rounded-lg border border-sage/30 focus:border-tangerine focus:ring-2 focus:ring-tangerine/20 bg-white dark:bg-gunmetal/50 text-gunmetal dark:text-peach" />
            <button type="button" className="px-6 py-3 bg-sage/20 hover:bg-sage/30 text-gunmetal dark:text-peach rounded-lg font-medium flex items-center gap-2"><Phone className="w-4 h-4" />Send OTP</button>
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gunmetal dark:text-peach mb-2">Company Document (Optional)</label>
          <label className="cursor-pointer block">
            <div className="border-2 border-dashed border-sage/30 rounded-lg p-6 text-center hover:border-tangerine transition-colors">
              <Upload className="w-8 h-8 text-sage mx-auto mb-2" />
              <p className="text-sm text-gunmetal dark:text-peach">Upload company registration or license</p>
              <p className="text-xs text-sage mt-1">Earns trust badge on your profile</p>
            </div>
            <input type="file" accept=".pdf,.jpg,.png" className="hidden" />
          </label>
        </div>
        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onBack} disabled={isSubmitting} className="flex-1 px-6 py-3 border border-sage hover:bg-sage/10 text-gunmetal dark:text-peach rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"><ArrowLeft className="w-5 h-5" />Back</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-tangerine hover:bg-tangerine/90 text-white rounded-lg font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {isSubmitting ? 'Completing...' : 'Complete Setup'} <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
