"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckCircleIcon, BuildingLibraryIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';

const STEPS_CONFIG = [
  { id: 1, name: 'Personal Info' },
  { id: 2, name: 'Academics' },
  { id: 3, name: 'Test Scores' },
  { id: 4, name: 'Documents' },
  { id: 5, name: 'Review & Submit' },
];

export default function UnifiedApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [qualifications, setQualifications] = useState([
    { id: Date.now(), institution: 'Delhi University', degree: 'B.Tech Computer Science', passingYear: '2023', cgpa: '8.9' }
  ]);
  
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    testScores: {
      ielts: '',
      gre: '',
      gmat: ''
    }
  });

  // Pre-fill form with logged-in user's data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await api.get('/auth/me');
        setFormData(prev => ({
          ...prev,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone ? `${userData.countryCode || '+91'} ${userData.phone}` : '',
          testScores: {
            ielts: userData.testScores?.ielts?.toString() || '',
            gre: userData.testScores?.gre?.toString() || '',
            gmat: userData.testScores?.gmat?.toString() || ''
          }
        }));
      } catch (err) {
        // Fallback to auth context user data
        if (user) {
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
          }));
        }
      }
    };
    loadUserProfile();
  }, [user]);

  const addQualification = () => {
    setQualifications([...qualifications, { id: Date.now(), institution: '', degree: '', passingYear: '2024', cgpa: '' }]);
  };

  const removeQualification = (id: number) => {
    if (qualifications.length > 1) {
      setQualifications(qualifications.filter(q => q.id !== id));
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(1, prev - 1));
  const handleNext = () => setCurrentStep(prev => Math.min(5, prev + 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Pull selected universities from cart/localStorage or state
      let applicationsToSubmit: any[] = [];
      const storedCart = localStorage.getItem('mec_application_cart');
      
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        applicationsToSubmit = cartItems.map((item: any) => ({
          universityId: item.universityId,
          course: item.course || 'Selected Course',
          academics: qualifications,
          testScores: formData.testScores
        }));
      } else {
        // DEMO BYPASS: If no universities selected, use one as a demo
        const demoUnis = [
          { universityId: '69e387e72feb44f2c611c66c', course: 'Project Management' }
        ];
        
        applicationsToSubmit = demoUnis.map(item => ({
          universityId: item.universityId,
          course: item.course,
          academics: qualifications,
          testScores: formData.testScores
        }));
        
        alert("Demo Mode Information: You haven't selected any universities from the Search page, so we added a demo entry (Karnavati University) for this submission test.");
      }

      await api.post('/applications/bulk', { applications: applicationsToSubmit });
      
      router.push('/student?submitted=true');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit applications');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 fade-in h-auto lg:h-[calc(100vh-64px)] flex flex-col relative pb-24">
      
      {/* Page Header */}
      <div>
        <h1 className="text-h1 text-heading">Unified Application Form</h1>
        <p className="text-body text-muted mt-1">Apply to multiple partner universities using this single, smart form.</p>
      </div>

      <nav aria-label="Progress" className="hidden lg:block pb-10">
        <ol role="list" className="flex items-center w-full">
          {STEPS_CONFIG.map((step, stepIdx) => {
            const isComplete = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <li key={step.name} className={`relative flex-1 ${stepIdx === STEPS_CONFIG.length - 1 ? 'flex-grow-0' : ''}`}>
                {stepIdx !== STEPS_CONFIG.length - 1 && (
                  <div className="absolute inset-x-0 top-4 flex items-center" aria-hidden="true">
                    <div className={`h-[2px] w-full ${isComplete ? 'bg-primary' : 'bg-border'}`} />
                  </div>
                )}
                <div className="relative flex flex-col items-center group">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                      isComplete ? 'bg-primary hover:bg-primary-dark text-white' : 
                      isCurrent ? 'bg-surface border-2 border-primary shadow-[0_0_0_4px_#FFF0E6] text-primary' : 
                      'bg-surface border-2 border-border hover:border-muted text-muted'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <span className="text-[12px] font-bold">{step.id}</span>
                    )}
                  </button>
                  <span className={`absolute top-10 text-[11px] font-semibold transition-colors text-center w-32 ${isCurrent ? 'text-heading' : 'text-muted'}`}>
                    {step.name}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 lg:mt-8 h-full min-h-0">
        
        {/* Main Form Area (Left 70%) */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-sm grid grid-rows-[auto,1fr] min-h-0 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-border bg-bg/5 shrink-0 z-10">
            <h3 className="text-h3">{STEPS_CONFIG.find(s => s.id === currentStep)?.name}</h3>
            <p className="text-sm text-muted mt-1">Please provide accurate information to expedite your application.</p>
          </div>
          
          {/* Card Content */}
          <div className="overflow-y-auto min-h-0 p-6">
            <div className="space-y-6">
                
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-label">First Name</label>
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full h-11 px-3 bg-bg/50 border border-border rounded-lg text-body" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label">Last Name</label>
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full h-11 px-3 bg-bg/50 border border-border rounded-lg text-body" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label">Email Address</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        className="w-full h-11 px-3 bg-bg/20 border border-border rounded-lg text-muted cursor-not-allowed" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label">Phone Number</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-11 px-3 bg-bg/50 border border-border rounded-lg text-body" 
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Academics */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {qualifications.map((q, idx) => (
                      <div key={q.id} className="p-5 border border-border rounded-lg bg-bg/50 space-y-4 relative">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="text-[14px] font-semibold text-heading flex items-center gap-2">
                             <BuildingLibraryIcon className="w-4 h-4 text-primary" /> Qualification {idx + 1}
                           </h4>
                           {qualifications.length > 1 && (
                             <button 
                               onClick={() => removeQualification(q.id)}
                               className="text-danger text-[12px] font-medium hover:underline flex items-center gap-1"
                             >
                               <XMarkIcon className="w-3 h-3" /> Remove
                             </button>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-label">Institution Name <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              value={q.institution}
                              onChange={(e) => {
                                const newQuals = [...qualifications];
                                newQuals[idx].institution = e.target.value;
                                setQualifications(newQuals);
                              }}
                              placeholder="e.g. Gujarat University"
                              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-[14px] focus:outline-none focus:border-primary" 
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-label">Degree Name <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              value={q.degree}
                              onChange={(e) => {
                                const newQuals = [...qualifications];
                                newQuals[idx].degree = e.target.value;
                                setQualifications(newQuals);
                              }}
                              placeholder="e.g. B.Com"
                              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-[14px] focus:outline-none focus:border-primary" 
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-label">Passing Year <span className="text-danger">*</span></label>
                            <select 
                              value={q.passingYear}
                              onChange={(e) => {
                                const newQuals = [...qualifications];
                                newQuals[idx].passingYear = e.target.value;
                                setQualifications(newQuals);
                              }}
                              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-[14px] focus:outline-none focus:border-primary"
                            >
                               <option>2020</option>
                               <option>2021</option>
                               <option>2022</option>
                               <option>2023</option>
                               <option>2024</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-label">CGPA / Percentage <span className="text-danger">*</span></label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={q.cgpa}
                                onChange={(e) => {
                                  const newQuals = [...qualifications];
                                  newQuals[idx].cgpa = e.target.value;
                                  setQualifications(newQuals);
                                }}
                                className="w-full h-10 pl-3 pr-12 bg-surface border border-border rounded-lg text-[14px] focus:outline-none focus:border-primary" 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">/ 10</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-4 border border-dashed border-border rounded-lg bg-surface flex flex-col items-center justify-center gap-2 hover:bg-bg/50 transition-colors cursor-pointer">
                          <DocumentArrowUpIcon className="w-6 h-6 text-muted" />
                          <span className="text-sm font-medium text-heading">Upload Transcript (PDF)</span>
                          <span className="text-xs text-muted">Max size: 5MB</span>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={addQualification}
                      className="w-full py-3 border border-border border-dashed rounded-lg text-[14px] font-medium text-heading hover:bg-bg hover:border-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4 text-primary" /> Add Another Qualification
                    </button>
                  </div>
                )}

                {/* Step 3: Test Scores */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 border border-border rounded-xl bg-bg/30">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
                                 <ChartBarIcon className="w-6 h-6" />
                              </div>
                              <h4 className="font-bold text-heading">IELTS / TOEFL</h4>
                           </div>
                           <input 
                             type="text" 
                             placeholder="Overall Score (e.g. 7.5)"
                             className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body focus:border-primary" 
                           />
                        </div>
                        <div className="p-5 border border-border rounded-xl bg-bg/30">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                                 <TicketIcon className="w-6 h-6" />
                              </div>
                              <h4 className="font-bold text-heading">GRE / GMAT</h4>
                           </div>
                           <input 
                             type="text" 
                             placeholder="Score (if applicable)"
                             className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body focus:border-primary" 
                           />
                        </div>
                     </div>
                  </div>
                )}

                {/* Step 4: Documents */}
                {currentStep === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {['Passport (Bio Page)', 'Updated Resume', 'Statement of Purpose', 'LOR 1', 'LOR 2'].map(doc => (
                        <div key={doc} className="p-4 border border-border rounded-lg flex items-center justify-between group hover:border-primary transition-colors cursor-pointer">
                           <div className="flex items-center gap-3">
                              <DocumentTextIcon className="w-5 h-5 text-muted group-hover:text-primary" />
                              <span className="text-sm font-medium text-heading">{doc}</span>
                           </div>
                           <button className="text-[11px] font-bold text-primary px-3 py-1 bg-primary/5 rounded border border-primary/20">UPLOAD</button>
                        </div>
                     ))}
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                     <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl mb-4">
                        <div className="flex items-center gap-3 mb-3">
                           <SparklesIcon className="w-5 h-5 text-primary" />
                           <h4 className="font-bold text-heading text-[15px]">Ready for submission?</h4>
                        </div>
                        <p className="text-[13px] text-muted leading-relaxed">Review all your entries carefully. This form will be sent to 2 partner universities simultaneously.</p>
                     </div>

                     {submitError && (
                       <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm font-medium mb-4">
                         {submitError}
                       </div>
                     )}
                     
                     <div className="space-y-4">
                        <div className="flex justify-between text-sm py-2 border-b border-border">
                           <span className="text-muted">Applicant Name</span>
                           <span className="font-bold text-heading">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-border">
                           <span className="text-muted">Qualifications</span>
                           <span className="font-bold text-heading">{qualifications.length} Entries</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-border">
                           <span className="text-muted">Documents</span>
                           <span className="font-bold text-heading">4/5 Uploaded</span>
                        </div>
                     </div>
                  </div>
                )}

              </div>
          </div>
        </div>

        {/* Requirements Context Panel (Right 30%) */}
        <div className="bg-surface rounded-xl border border-border shadow-sm p-6 grid grid-rows-[auto,1fr] min-h-0 overflow-hidden">
          <h3 className="text-h3 mb-4 shrink-0">Applying To (0)</h3>
          <div className="overflow-y-auto min-h-0">
            <div className="space-y-4">
            
            <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted bg-bg/50">
               <p className="text-[13px] font-bold text-heading">No Universities Selected</p>
               <p className="text-[11px] mt-1">Please select universities from the search page to apply.</p>
            </div>
            
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <div className="bg-bg/50 p-4 rounded-lg flex items-start gap-3 border border-border/50">
                <div className="text-primary mt-0.5"><SparklesIcon className="w-4 h-4" /></div>
                <p className="text-[12px] text-muted leading-relaxed"><strong>AI Tip:</strong> {currentStep === 2 ? 'Upload high-quality PDFs. Blurred transcripts often lead to immediate rejections.' : 'Ensure your phone number has the correct country code for counsellor reachouts.'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 h-20 bg-surface border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.05)] px-6 lg:px-8 flex items-center justify-between z-20">
        <button 
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-4 h-10 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${currentStep === 1 ? 'text-muted opacity-20 pointer-events-none' : 'text-heading hover:bg-bg'}`}
        >
          <ChevronLeftIcon className="w-4 h-4" /> Back
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={() => alert('Draft saved successfuly!')}
            className="px-6 h-10 rounded-lg border border-border text-sm font-semibold text-heading hover:bg-bg transition-colors hidden sm:block"
          >
            Save Draft
          </button>
          
          {currentStep < 5 ? (
            <button 
              onClick={handleNext}
              className="px-8 h-10 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              Continue <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 h-10 rounded-lg bg-success hover:bg-success-dark text-white text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'} <CheckCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
