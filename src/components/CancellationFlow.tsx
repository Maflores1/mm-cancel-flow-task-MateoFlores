'use client';

import { useState, useEffect } from 'react';

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  userSubscription: {
    monthlyPrice: number; // in cents (2500 for $25, 2900 for $29)
  };
  // Add userId for deterministic A/B testing
  userId?: string;
}

type FlowStep = 
  | 'initial'
  | 'congrats-form'
  | 'feedback-form'
  | 'visa-help'
  | 'all-done'
  | 'founder-message'
  | 'offer'
  | 'offer-accepted'
  | 'usage-questions'
  | 'detailed-reasons'
  | 'sorry-to-go';

interface FormData {
  foundJob: boolean | null;
  usedMigrateMate: boolean | null;
  rolesApplied: string;
  companiesEmailed: string;
  companiesInterviewed: string;
  feedback: string;
  visaHelp: boolean | null;
  visaType: string;
  // Usage questions
  usageRolesApplied: string;
  usageCompaniesEmailed: string;
  usageCompaniesInterviewed: string;
  // Detailed reasons
  cancellationReason: string;
  reasonDetails: string;
  // Form errors
  congratsError: string;
  usageError: string;
  reasonError: string;
  detailsError: string;
  visaError: string;
}

export default function CancellationFlow({ isOpen, onClose, userSubscription, userId }: CancellationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('initial');
  const [downsellVariant, setDownsellVariant] = useState<'A' | 'B'>('A');
  const [stepHistory, setStepHistory] = useState<FlowStep[]>(['initial']);
  const [formData, setFormData] = useState<FormData>({
    foundJob: null,
    usedMigrateMate: null,
    rolesApplied: '',
    companiesEmailed: '',
    companiesInterviewed: '',
    feedback: '',
    visaHelp: null,
    visaType: '',
    usageRolesApplied: '',
    usageCompaniesEmailed: '',
    usageCompaniesInterviewed: '',
    cancellationReason: '',
    reasonDetails: '',
    congratsError: '',
    usageError: '',
    reasonError: '',
    detailsError: '',
    visaError: '',
  });

  /**
   * A/B Test Implementation
   * 
   * We implement a deterministic A/B test assignment based on userId.
   * This ensures users always see the same variant across sessions.
   * 
   * Variant A: Standard pricing offer
   * Variant B: Discounted pricing offer ($10 off)
   * 
   * The assignment uses a simple hash of the userId to determine variant:
   * - If no userId provided, falls back to random assignment
   * - Hash ensures consistent assignment for same user
   */
  useEffect(() => {
    if (isOpen) {
      let variant: 'A' | 'B' = 'A';
      
      if (userId) {
        // Deterministic assignment based on userId
        // Simple hash function to convert userId to number
        const hash = userId.split('').reduce((acc, char) => {
          return acc + char.charCodeAt(0);
        }, 0);
        
        // Assign variant based on even/odd hash
        variant = hash % 2 === 0 ? 'A' : 'B';
      } else {
        // Fallback to random assignment if no userId
        variant = Math.random() < 0.5 ? 'A' : 'B';
      }
      
      setDownsellVariant(variant);
      
      // Log A/B test assignment for analytics
      console.log(`A/B Test - User: ${userId || 'anonymous'}, Variant: ${variant}`);
    }
  }, [isOpen, userId]);

  // Navigation helpers
  const navigateToStep = (step: FlowStep) => {
    setStepHistory([...stepHistory, step]);
    setCurrentStep(step);
  };

  const goBack = () => {
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setStepHistory(newHistory);
      setCurrentStep(previousStep);
    }
  };

  const resetToInitial = () => {
    setCurrentStep('initial');
    setStepHistory(['initial']);
    // Reset form data
    setFormData({
      foundJob: null,
      usedMigrateMate: null,
      rolesApplied: '',
      companiesEmailed: '',
      companiesInterviewed: '',
      feedback: '',
      visaHelp: null,
      visaType: '',
      usageRolesApplied: '',
      usageCompaniesEmailed: '',
      usageCompaniesInterviewed: '',
      cancellationReason: '',
      reasonDetails: '',
      congratsError: '',
      usageError: '',
      reasonError: '',
      detailsError: '',
      visaError: '',
    });
  };

  // Progress calculation
  const getProgressInfo = () => {
    const progressMap: Record<FlowStep, { current: number; total: number }> = {
      'initial': { current: 1, total: 3 },
      'congrats-form': { current: 1, total: 3 },
      'feedback-form': { current: 2, total: 3 },
      'visa-help': { current: 2, total: 3 },
      'all-done': { current: 3, total: 3 },
      'founder-message': { current: 3, total: 3 },
      'offer': { current: 1, total: 3 },
      'offer-accepted': { current: 3, total: 3 },
      'usage-questions': { current: 2, total: 3 },
      'detailed-reasons': { current: 2, total: 3 },
      'sorry-to-go': { current: 3, total: 3 },
    };
    return progressMap[currentStep] || { current: 1, total: 3 };
  };

  // Price calculation helpers
  const getDiscountedPrice = (originalPrice: number) => {
    return originalPrice / 2; // $10 off in cents
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  // Check if current step should show Empire State photo on mobile
  const shouldShowEmpireStateOnMobile = () => {
    return ['initial', 'all-done', 'offer-accepted', 'sorry-to-go'].includes(currentStep);
  };

  // Event handlers
  const handleInitialChoice = (foundJob: boolean) => {
    setFormData({ ...formData, foundJob });
    if (foundJob) {
      navigateToStep('congrats-form');
    } else {
      navigateToStep('offer');
    }
  };

  const handleOfferResponse = (accepted: boolean) => {
    if (accepted) {
      navigateToStep('offer-accepted');
    } else {
      navigateToStep('usage-questions');
    }
  };

  const handleUsageQuestionsResponse = (getDiscount: boolean) => {
    if (getDiscount) {
      navigateToStep('offer');
    } else {
      navigateToStep('detailed-reasons');
    }
  };

  const handleDetailedReasonsResponse = (getDiscount: boolean) => {
    if (getDiscount) {
      navigateToStep('offer');
    } else {
      navigateToStep('sorry-to-go');
    }
  };

  const handleVisaSelection = (visa: string, isPartner: boolean = false) => {
    setFormData({ ...formData, visaType: visa });
    if (isPartner) {
      navigateToStep('founder-message');
    } else {
      navigateToStep('all-done');
    }
  };

  // Render functions
  const renderInitialStep = () => (
    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
      {/* Mobile Empire State Image - Show at top on mobile */}
      <div className={`mb-8 lg:mb-0 lg:flex-1 lg:max-w-md ${shouldShowEmpireStateOnMobile() ? 'lg:order-2' : 'hidden lg:block lg:order-2'}`}>
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 md:h-64 lg:h-90 object-cover rounded-lg"
        />
      </div>

      <div className="lg:flex-1 lg:order-1">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
          Hey mate,<br />
          Quick one before you go.
        </h2>

        <h3 className="text-xl md:text-3xl font-semibold italic text-gray-900 mb-6">
          Have you found a job yet?
        </h3>
    
        <p className="text-gray-600 mb-8 md:text-lg">
          Whatever your answer, we just want to help you take the next step.
          With visa support, or by hearing how we can do better.
        </p>

        <div className="space-y-3 md:space-y-4">
          <button
            onClick={() => handleInitialChoice(true)}
            className="w-full py-3 md:py-4 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-base md:text-lg"
          >
            Yes, I've found a job
          </button>
          <button
            onClick={() => handleInitialChoice(false)}
            className="w-full py-3 md:py-4 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base md:text-lg"
          >
            Not yet - I'm still looking
          </button>
        </div>
      </div>
    </div>
  );

  const renderCongratsForm = () => {
    const validateCongratsForm = () => {
      if (formData.usedMigrateMate === null || !formData.rolesApplied || !formData.companiesEmailed || !formData.companiesInterviewed) {
        setFormData({ ...formData, congratsError: 'Please answer all questions to continue' });
        return false;
      }
      setFormData({ ...formData, congratsError: '' });
      return true;
    };

    const handleContinue = () => {
      if (validateCongratsForm()) {
        navigateToStep('feedback-form');
      }
    };

    return (
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:flex-1">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Congrats on the new role! 🎉
            </h2>
            <p className="text-gray-600 md:text-lg">
              Can you help us with a bit of information?
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                Did you find this role with MigrateMate? *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, usedMigrateMate: true })}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                    formData.usedMigrateMate === true
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setFormData({ ...formData, usedMigrateMate: false })}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                    formData.usedMigrateMate === false
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                How many roles did you apply for through Migrate Mate? *
              </label>
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {['0', '1-5', '6-20', '20+'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, rolesApplied: option })}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      formData.rolesApplied === option
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                How many companies did you email directly? *
              </label>
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {['0', '1-5', '6-20', '20+'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, companiesEmailed: option })}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      formData.companiesEmailed === option
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                How many different companies did you interview with? *
              </label>
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {['0', '1-2', '3-5', '5+'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, companiesInterviewed: option })}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      formData.companiesInterviewed === option
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {formData.congratsError && (
              <div className="text-red-600 text-sm font-medium">
                {formData.congratsError}
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full py-3 md:py-4 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg"
            >
              Continue
            </button>
          </div>
        </div>
        
        <div className="mb-6 lg:mb-0 lg:flex-1 lg:max-w-md hidden lg:block">
          <img 
            src="/empire-state-compressed.jpg"
            alt="Empire State Building" 
            className="w-full h-32 md:h-48 lg:h-150 object-cover rounded-lg"
          />
        </div>
      </div>
    );
  };

  const renderOffer = () => {
  const originalPrice = userSubscription.monthlyPrice;
  const discountedPrice = downsellVariant === 'B' ? getDiscountedPrice(originalPrice) : originalPrice;
  const isDiscounted = downsellVariant === 'B';

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
      <div className="lg:flex-1">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          We built this to help you land the job, this makes it a little easier.
        </h2>
        <p className="text-gray-600 mb-8 md:text-lg">
          We've been there and we're here to help you.
        </p>

        <div className="bg-purple-100 border border-purple-400 rounded-lg p-6 mb-6 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            {isDiscounted ? "Here's 50% off until you find a job." : "Special offer just for you!"}
          </h3>
          <div className="text-2xl font-bold text-purple-600 mb-2 text-center">
            {formatPrice(discountedPrice)}/month
        
            {isDiscounted && (
              <span className="text-lg line-through text-gray-500 ml-2">
                {formatPrice(originalPrice)}/month
              </span>
            )}
            
          </div>
          <button
            onClick={() => handleOfferResponse(true)}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium mb-2"
          >
            Get 50% off
          </button>
          <p className="text-gray-600 italic md:text-sm">
          You won't be charged until your next billing date.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOfferResponse(false)}
            className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            No, thanks
          </button>
        </div>
      </div>
        
        <div className="mb-6 lg:mb-0 lg:flex-1 lg:max-w-md hidden lg:block">
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-48 lg:h-100 object-cover rounded-lg"
          />
        </div>
      </div>
    );
  };

  const renderFeedbackForm = () => (
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
      <div className="lg:flex-1">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What's one thing you wish we could've helped you with?
          </h2>
          <p className="text-gray-600 mb-8 md:text-lg">
            We're always looking to improve, your thoughts can help us make Migrate Mate more useful for others.*
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            value={formData.feedback}
            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            // Added text-black to the textarea's className
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none text-black"
            placeholder="Your feedback helps us improve..."
          />

          <button
            onClick={() => navigateToStep('visa-help')}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
      
      <div className="mb-6 lg:mb-0 lg:flex-1 lg:max-w-md hidden lg:block">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-32 lg:h-95 object-cover rounded-lg"
        />
      </div>
    </div>
  );


  const renderVisaHelp = () => {
    const validateVisaForm = () => {
      if (formData.visaHelp === null) {
        setFormData({ ...formData, visaError: 'Please select an option' });
        return false;
      }
      if (formData.visaType.trim() === '') {
        setFormData({ ...formData, visaError: 'Please specify the visa type' });
        return false;
      }
      setFormData({ ...formData, visaError: '' });
      return true;
    };

    const handleContinue = () => {
      if (validateVisaForm()) {
        if (formData.visaHelp) {
          navigateToStep('all-done');
        } else {
          navigateToStep('founder-message');
        }
      }
    };

    return (
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            We've helped you land the job, now let's secure the visa.
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Is your company providing an immigration lawyer to help you with your visa?
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, visaHelp: true, visaError: '' })}
                className={`py-3 md:py-4 px-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                  formData.visaHelp === true
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setFormData({ ...formData, visaHelp: false, visaError: '' })}
                className={`py-3 md:py-4 px-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                  formData.visaHelp === false
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                No
              </button>
            </div>

            {formData.visaHelp === true && (
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                  What type of visa are you applying for? *
                </label>
                <input
                  type="text"
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value, visaError: '' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  placeholder="e.g., H-1B, O-1, E-3, TN, L-1..."
                />
              </div>
            )}

            {formData.visaHelp === false && (
              <div>
                <p className="text-gray-600 mb-3">
                  We can connect you with one of our trusted partners.
                </p>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                  What type of visa would you like to apply for? *
                </label>
                <input
                  type="text"
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value, visaError: '' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  placeholder="e.g., H-1B, O-1, E-3, TN, L-1..."
                />
              </div>
            )}

            {formData.visaError && (
              <div className="text-red-600 text-sm font-medium">
                {formData.visaError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Complete Cancellation
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6 lg:mb-0 lg:flex-1 lg:max-w-md hidden lg:block">
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-48 lg:h-90 object-cover rounded-lg"
          />
        </div>
      </div>
    );
  };

  const renderAllDone = () => (
    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
      {/* Mobile Empire State Image - Show at top on mobile */}
      <div className={`mb-8 lg:mb-0 lg:flex-1 lg:max-w-md ${shouldShowEmpireStateOnMobile() ? 'lg:order-2' : 'hidden lg:block lg:order-2'}`}>
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg"
        />
      </div>

      <div className="lg:flex-1 lg:order-1">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          All done, your cancellation's been processed.
        </h2>

        <p className="text-gray-600 mb-8">
          We're stoked to hear you've landed a job and sorted your visa. <br/>
          Big congrats from the team! 🙌
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Finish
        </button>
      </div>
    </div>
  );

  const renderFounderMessage = () => (
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
      <div className="lg:flex-1">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Your cancellation is all sorted, mate, no more charges.
          </h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start justify-center">
          <img 
            src="/mihailo-profile.jpeg" 
            alt="Mihailo" 
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div className="text-left">
            <p className="text-sm text-blue-800 font-bold">
              Mihailo Bozic
            </p>
            <p className="text-xs text-blue-600">
              mihailo@migratemate.co
            </p>
            <p className="text-sm text-blue-800 mt-2 leading-relaxed">
              I'll be reaching out soon to help with the visa side of things. 🎉 <br/>
              We've got your back, whether it's questions, paperwork, or just figuring out your options. <br/>
              <br/>
              Keep an eye on your inbox, I'll be in touch shortly!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Finish
        </button>
      </div>
      
      {/*  Modified: Add `hidden` and `lg:block` classes to the image container */}
      <div className="mb-6 lg:mb-0 lg:flex-1 lg:max-w-md hidden lg:block"> 
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-32 lg:h-90 object-cover rounded-lg"
        />
      </div>
    </div>
  );

  const renderOfferAccepted = () => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    const daysLeft = Math.ceil((futureDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
        {/* Empire State Image - Shown at top on mobile, second on larger screens */}
        <div className="mb-6 lg:mb-0 lg:flex-1 lg:max-w-md lg:order-2"> 
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-48 lg:h-90 object-cover rounded-lg"
          />
        </div>

        {/* Content - Second on mobile, first on larger screens */}
        <div className="lg:flex-1 lg:order-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Great choice, mate!
          </h2>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            You're still on the path to your dream role.
          </h2>
          <h2 className="text-3xl text-purple-600 font-semibold mb-6">
            Let's make it happen together!
          </h2>

          <div className="mb-6">
            <p className="text-lg text-gray-800 mb-2">
              You've got <strong>{daysLeft} days</strong> left on your current plan.
            </p>
            <p className="text-lg text-gray-800 mb-2">
              Starting from <strong>{futureDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong> you'll get your 50% off.
            </p>
            <p className="text-gray-500 italic text-sm">
            You won't be charged until your next billing date.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Land your dream role
          </button>
        </div>
      </div>
    );
  };


  const renderUsageQuestions = () => {
    const validateUsageForm = () => {
      if (!formData.usageRolesApplied || !formData.usageCompaniesEmailed || !formData.usageCompaniesInterviewed) {
        setFormData({ ...formData, usageError: 'To help us understand, please pick an option for all questions' });
        return false;
      }
      setFormData({ ...formData, usageError: '' });
      return true;
    };

    const handleGetDiscount = () => {
      if (validateUsageForm()) {
        handleUsageQuestionsResponse(true);
      }
    };

    const handleContinue = () => {
      if (validateUsageForm()) {
        handleUsageQuestionsResponse(false);
      }
    };

    return (
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:flex-1">
          <div className="mb-6">
            <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-4">
              Help us understand how you were using Migrate Mate
            </h2>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                How many roles did you apply for through Migrate Mate? *
              </label>
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {['0', '1-5', '6-20', '20+'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, usageRolesApplied: option })}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      formData.usageRolesApplied === option
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                How many companies did you email directly? *
              </label>
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {['0', '1-5', '6-20', '20+'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, usageCompaniesEmailed: option })}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      formData.usageCompaniesEmailed === option
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                How many different companies did you interview with? *
              </label>
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {['0', '1-2', '3-5', '5+'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, usageCompaniesInterviewed: option })}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      formData.usageCompaniesInterviewed === option
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {formData.usageError && (
              <div className="text-red-600 text-sm font-medium">
                {formData.usageError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGetDiscount}
                className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Get 50% off
              </button>
              <button
                onClick={handleContinue}
                className="py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6 lg:mb-0 lg:flex-1 lg:max-w-md hidden lg:block">
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-32 md:h-48 lg:h-115 object-cover rounded-lg"
          />
        </div>
      </div>
    );
  };

  const renderDetailedReasons = () => {
    const reasonOptions = [
      { value: 'too-expensive', label: 'Too expensive' },
      { value: 'platform-not-helpful', label: 'Platform not helpful' },
      { value: 'not-enough-jobs', label: 'Not enough relevant jobs' },
      { value: 'decided-not-to-move', label: 'Decided not to move' },
      { value: 'other', label: 'Other' }
    ];

    const getReasonQuestion = () => {
      switch (formData.cancellationReason) {
        case 'too-expensive':
          return 'What would be the maximum you would be willing to pay?';
        case 'platform-not-helpful':
          return 'What can we change to make the platform more helpful?';
        case 'not-enough-jobs':
          return 'In which way can we make the jobs more relevant?';
        case 'decided-not-to-move':
          return 'What changed for you to decide not to move?';
        case 'other':
          return 'What would have helped you the most?';
        default:
          return '';
      }
    };

    const validateReasonsForm = () => {
      if (!formData.cancellationReason) {
        setFormData({ ...formData, reasonError: 'To help us understand, please pick an option' });
        return false;
      }

      // Check if the reasonDetails is a valid number for the "too-expensive" reason
      if (formData.cancellationReason === 'too-expensive') {
        const amount = parseFloat(formData.reasonDetails); // Convert string to number
        if (isNaN(amount) || formData.reasonDetails.trim() === '') {
          setFormData({ ...formData, detailsError: 'Please enter a valid number' });
          return false;
        }
      } else if (formData.reasonDetails.length < 25) {
        setFormData({ ...formData, detailsError: 'Please type 25 characters min' });
        return false;
      }

      setFormData({ ...formData, reasonError: '', detailsError: '' });
      return true;
    };


    const handleGetDiscount = () => {
      if (validateReasonsForm()) {
        handleDetailedReasonsResponse(true);
      }
    };

    const handleCompleteCancel = () => {
      if (validateReasonsForm()) {
        handleDetailedReasonsResponse(false);
      }
    };

    return (
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:flex-1">
          <div className="mb-6">
            <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-4">
              What's the main reason for cancelling?
            </h2>
            <p className="text-gray-600 md:text-lg">
              Please take a minute to let us know why.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="space-y-3">
                {reasonOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        cancellationReason: option.value, 
                        reasonDetails: '',
                        reasonError: '',
                        detailsError: '' 
                      });
                    }}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors text-left ${
                      formData.cancellationReason === option.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {formData.reasonError && (
                <div className="text-red-600 text-sm font-medium p-3 mt-3">
                  {formData.reasonError}
                </div>
              )}
            </div>

            {formData.cancellationReason && (
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">
                  {getReasonQuestion()} *
                </label>
                <textarea
                  value={formData.reasonDetails}
                  onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value, detailsError: '' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none text-black"
                  placeholder="Your answer helps us improve..."
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {formData.reasonDetails.length}/25 minimum characters
                  </span>
                  {formData.detailsError && (
                    <span className="text-red-600 text-xs font-medium">
                      {formData.detailsError}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGetDiscount}
                className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Get 50% off
              </button>
              <button
                onClick={handleCompleteCancel}
                className="py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Complete cancellation
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6 lg:mb-0 lg:flex-1 lg:max-w-md hidden lg:block">
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-32 md:h-48 lg:h-100 object-cover rounded-lg"
          />
        </div>
      </div>
    );
  };

  const renderSorryToGo = () => {
    const currentDate = new Date();
    const endDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now

    return (
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
        {/* Empire State Image - Shown at top on mobile, second on larger screens */}
        <div className="mb-8 lg:mb-0 lg:flex-1 lg:max-w-md lg:order-2">
          <img
            src="/empire-state-compressed.jpg"
            alt="Empire State Building"
            className="w-full h-48 md:h-64 lg:h-90 object-cover rounded-lg"
          />
        </div>

        {/* Content - Second on mobile, first on larger screens */}
        <div className="lg:flex-1 lg:order-1">
          <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-4">
            Sorry to see you go, mate.
          </h2>

          <h2 className="ttext-2xl md:text-2xl font-bold text-gray-900 mb-4">
            Thanks for being with us, and you're always welcome back.
          </h2>

          <div className="mb-6">
            <p className="text-lg text-gray-800 mb-2">
              Your subscription is set to end on{' '}
              <strong>{endDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}</strong>
            </p>
            <p className="text-lg text-gray-800 mb-2">
              You'll still have full access until then, no further charges after that.
            </p>
            <p className="text-gray-500 italic text-sm">
            Changed your mind? You can always reactive anytime before your end date.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 md:py-4 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-base md:text-lg"
          >
            Finish
          </button>
        </div>
      </div>
    );
  };


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'initial':
        return renderInitialStep();
      case 'congrats-form':
        return renderCongratsForm();
      case 'feedback-form':
        return renderFeedbackForm();
      case 'visa-help':
        return renderVisaHelp();
      case 'all-done':
        return renderAllDone();
      case 'founder-message':
        return renderFounderMessage();
      case 'offer':
        return renderOffer();
      case 'offer-accepted':
        return renderOfferAccepted();
      case 'usage-questions':
        return renderUsageQuestions();
      case 'detailed-reasons':
        return renderDetailedReasons();
      case 'sorry-to-go':
        return renderSorryToGo();
      default:
        return renderInitialStep();
    }
  };

  if (!isOpen) return null;

  const progress = getProgressInfo();

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          {/* Back Button */}
          <button
            onClick={goBack}
            className={`text-gray-400 hover:text-gray-600 transition-colors ${
              stepHistory.length <= 1 ? 'invisible' : ''
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Title and Progress */}
          <div className="flex items-center space-x-4">
            <h1 className="text-sm md:text-base font-medium text-gray-500">Subscription Cancellation</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Step {progress.current} of {progress.total}</span>
              <div className="flex space-x-1">
                {Array.from({ length: progress.total }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < progress.current ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              resetToInitial();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 lg:p-12">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}