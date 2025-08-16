'use client';

import { useState, useEffect } from 'react';

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  userSubscription: {
    monthlyPrice: number; // in cents (2500 for $25, 2900 for $29)
  };
}

type FlowStep = 
  | 'initial'
  | 'congrats-form'
  | 'used-migratemate'
  | 'feedback-form'
  | 'visa-help'
  | 'visa-type-selection'
  | 'partner-visa-selection'
  | 'all-done'
  | 'founder-message'
  | 'offer'
  | 'offer-accepted'
  | 'usage-questions'
  | 'detailed-reasons'
  | 'sorry-to-go'
  | 'job-without-migratemate';

interface FormData {
  foundJob: boolean | null;
  companyName: string;
  roleTitle: string;
  startDate: string;
  jobThroughMigrateMate: boolean | null;
  usedMigrateMate: boolean | null;
  rolesApplied: string;
  companiesEmailed: string;
  companiesInterviewed: string;
  feedback: string;
  visaHelp: boolean | null;
  selectedVisa: string;
  // Usage questions
  usageFrequency: string;
  helpfulFeatures: string[];
  improvements: string;
  // Detailed reasons
  cancellationReason: string;
  reasonDetails: string;
}

export default function CancellationFlow({ isOpen, onClose, userSubscription }: CancellationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('initial');
  const [downsellVariant, setDownsellVariant] = useState<'A' | 'B'>('A');
  const [formData, setFormData] = useState<FormData>({
    foundJob: null,
    companyName: '',
    roleTitle: '',
    startDate: '',
    jobThroughMigrateMate: null,
    usedMigrateMate: null,
    rolesApplied: '',
    companiesEmailed: '',
    companiesInterviewed: '',
    feedback: '',
    visaHelp: null,
    selectedVisa: '',
    usageFrequency: '',
    helpfulFeatures: [],
    improvements: '',
    cancellationReason: '',
    reasonDetails: '',
  });

  // A/B Test Assignment (deterministic based on user ID)
  useEffect(() => {
    if (isOpen) {
      // For now, simple random assignment - we'll make this deterministic with user ID later
      const variant = Math.random() < 0.5 ? 'A' : 'B';
      setDownsellVariant(variant);
    }
  }, [isOpen]);

  // Calculate discounted price for variant B
  const getDiscountedPrice = (originalPrice: number) => {
    return originalPrice - 1000; // $10 off in cents
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const handleInitialChoice = (foundJob: boolean) => {
    setFormData({ ...formData, foundJob });
    if (foundJob) {
      setCurrentStep('congrats-form');
    } else {
      setCurrentStep('offer');
    }
  };

  const handleUsedMigrateMate = (used: boolean) => {
    setFormData({ ...formData, usedMigrateMate: used });
    if (used) {
      setCurrentStep('feedback-form');
    } else {
      setCurrentStep('job-without-migratemate');
    }
  };

  const handleVisaHelp = (hasHelp: boolean) => {
    setFormData({ ...formData, visaHelp: hasHelp });
    if (hasHelp) {
      setCurrentStep('visa-type-selection');
    } else {
      setCurrentStep('partner-visa-selection');
    }
  };

  const handleVisaSelection = (visa: string, isPartner: boolean = false) => {
    setFormData({ ...formData, selectedVisa: visa });
    if (isPartner) {
      setCurrentStep('founder-message');
    } else {
      setCurrentStep('all-done');
    }
  };

  const handleOfferResponse = (accepted: boolean) => {
    if (accepted) {
      setCurrentStep('offer-accepted');
    } else {
      setCurrentStep('usage-questions');
    }
  };

  const renderInitialStep = () => (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
        Hey mate,<br />
        Quick one before you go.
      </h2>
      
      <div className="mb-8">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 md:h-64 object-cover rounded-lg"
        />
      </div>

      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
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
  );

  const renderCongratsForm = () => (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Congrats on the new role! 🎉
        </h2>
        <div className="mb-4">
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-32 md:h-48 object-cover rounded-lg"
          />
        </div>
        <p className="text-gray-600 md:text-lg">
          Can you help us with a bit of information?
        </p>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
              Company name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
              Role title *
            </label>
            <input
              type="text"
              value={formData.roleTitle}
              onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
              className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
              placeholder="Role title"
            />
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

        <button
          onClick={() => setCurrentStep('used-migratemate')}
          disabled={!formData.companyName || !formData.roleTitle || !formData.rolesApplied || !formData.companiesEmailed || !formData.companiesInterviewed}
          className="w-full py-3 md:py-4 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderUsedMigrateMate = () => (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Did you find this job using MigrateMate?
      </h2>
      
      <div className="mb-8">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 md:h-64 object-cover rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleUsedMigrateMate(true)}
          className="py-3 md:py-4 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-base md:text-lg"
        >
          Yes
        </button>
        <button
          onClick={() => handleUsedMigrateMate(false)}
          className="py-3 md:py-4 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base md:text-lg"
        >
          No
        </button>
      </div>
    </div>
  );

  const renderJobWithoutMigrateMate = () => (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        You landed the job, that's what we live for!
      </h2>
      
      <div className="mb-6">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 md:h-64 object-cover rounded-lg"
        />
      </div>

      <p className="text-gray-600 mb-8 md:text-lg">
        Even if it wasn't through MigrateMate, let us help get your visa started.
      </p>

      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">
        Is your company providing an immigration lawyer to help you with your visa?
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleVisaHelp(true)}
          className="py-3 md:py-4 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-base md:text-lg"
        >
          Yes
        </button>
        <button
          onClick={() => handleVisaHelp(false)}
          className="py-3 md:py-4 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base md:text-lg"
        >
          No
        </button>
      </div>
    </div>
  );

  const renderOffer = () => {
    const originalPrice = userSubscription.monthlyPrice;
    const discountedPrice = downsellVariant === 'B' ? getDiscountedPrice(originalPrice) : originalPrice;
    const isDiscounted = downsellVariant === 'B';

    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          We built this to help you land the job, this makes it a little easier.
        </h2>
        
        <div className="mb-6">
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            {isDiscounted ? "Here's 50% off until you find a job." : "Special offer just for you!"}
          </h3>
          <div className="text-2xl font-bold text-green-800">
            {isDiscounted && (
              <span className="text-lg line-through text-gray-500 mr-2">
                {formatPrice(originalPrice)}
              </span>
            )}
            {formatPrice(discountedPrice)}/month
          </div>
          {isDiscounted && (
            <p className="text-sm text-green-700 mt-1">Save $10/month</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOfferResponse(true)}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Yes, please
          </button>
          <button
            onClick={() => handleOfferResponse(false)}
            className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            No, thanks
          </button>
        </div>
      </div>
    );
  };

  const renderFeedbackForm = () => (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What's one thing you wish we could've helped you with?
        </h2>
        <div className="mb-4">
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
        <p className="text-gray-600 mb-8 md:text-lg">
          We're always looking to improve, your thoughts can help us make Migrate Mate more useful for others.*
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          value={formData.feedback}
          onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
          placeholder="Your feedback helps us improve..."
        />

        <button
          onClick={() => setCurrentStep('visa-help')}
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderVisaHelp = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        We've helped you land the job, now let's secure the visa.
      </h2>
      
      <div className="mb-6">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Is your company providing an immigration lawyer to help you with your visa?
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleVisaHelp(true)}
          className="py-3 md:py-4 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-base md:text-lg"
        >
          Yes
        </button>
        <button
          onClick={() => handleVisaHelp(false)}
          className="py-3 md:py-4 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base md:text-lg"
        >
          No
        </button>
      </div>
    </div>
  );

  const renderVisaTypeSelection = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        What visa are you applying for?
      </h2>
      
      <div className="mb-6">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <div className="space-y-3">
        {['H-1B', 'O-1', 'E-3', 'TN', 'L-1', 'Other'].map((visa) => (
          <button
            key={visa}
            onClick={() => handleVisaSelection(visa)}
            className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {visa}
          </button>
        ))}
      </div>
    </div>
  );

  const renderPartnerVisaSelection = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        We can connect you with one of our trusted partners.
      </h2>
      
      <div className="mb-6">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Which visa would you like to apply for?
      </h3>

      <div className="space-y-3">
        {['H-1B', 'O-1', 'E-3', 'TN', 'L-1', 'Other'].map((visa) => (
          <button
            key={visa}
            onClick={() => handleVisaSelection(visa, true)}
            className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {visa}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAllDone = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        All done, your cancellation's been processed.
      </h2>
      
      <div className="mb-8">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <p className="text-gray-600 mb-8">
        We're stoked to hear you've landed a job and sorted your visa. <br/>
        Big congrats from the team!
      </p>

      <button
        onClick={onClose}
        className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
      >
        Finish
      </button>
    </div>
  );

  const renderFounderMessage = () => (
    <div className="text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Your cancellation is all sorted, mate, no more charges.
        </h2>
      </div>
      
      <div className="mb-6">
        <img 
          src="/empire-state-compressed.jpg" 
          alt="Empire State Building" 
          className="w-full h-32 object-cover rounded-lg"
        />
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
  );

  const renderOfferAccepted = () => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    const daysLeft = Math.ceil((futureDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Great choice, mate!
        </h2>
        
        <div className="mb-6">
          <img 
            src="/empire-state-compressed.jpg" 
            alt="Empire State Building" 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>

        <p className="text-gray-900 mb-2">
          You're still on the path to your dream role.
        </p>
        <p className="text-purple-600 font-semibold mb-6">
          Let's make it happen together!
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800 mb-2">
            You've got <strong>{daysLeft} days</strong> left on your current plan.
          </p>
          <p className="text-sm text-green-800">
            On <strong>{futureDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong> you'll get your 50% off.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Land your dream role
        </button>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'initial':
        return renderInitialStep();
      case 'congrats-form':
        return renderCongratsForm();
      case 'used-migratemate':
        return renderUsedMigrateMate();
      case 'job-without-migratemate':
        return renderJobWithoutMigrateMate();
      case 'feedback-form':
        return renderFeedbackForm();
      case 'visa-help':
        return renderVisaHelp();
      case 'visa-type-selection':
        return renderVisaTypeSelection();
      case 'partner-visa-selection':
        return renderPartnerVisaSelection();
      case 'all-done':
        return renderAllDone();
      case 'founder-message':
        return renderFounderMessage();
      case 'offer':
        return renderOffer();
      case 'offer-accepted':
        return renderOfferAccepted();
      // Add more cases as we build them
      default:
        return renderInitialStep();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h1 className="text-sm md:text-base font-medium text-gray-500">Subscription Cancellation</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}