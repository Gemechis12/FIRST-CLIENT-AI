"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    skill: "",
    customSkill: "",
    experienceLevel: "",
    hasClientsBefore: null as boolean | null,
    targetClients: [] as string[],
    mainGoal: "",
    currency: "USD",
  });

  const skills = [
    "Graphic Design", "Video Editing", "Web Development", 
    "Social Media Management", "Copywriting", "Photography", 
    "Virtual Assistance", "Other"
  ];
  
  const experienceLevels = ["Beginner", "Some experience", "Experienced"];
  const targetClientOptions = [
    "Small businesses", "Startups", "Creators", "Coaches",
    "Restaurants", "Real estate", "E-commerce", "Agencies", "Other"
  ];
  const mainGoals = [
    "Get my first client", "Build side income", 
    "Become a full-time freelancer", "Build a freelance agency"
  ];
  const currencies = ["USD", "EUR", "GBP", "ETB", "Other"];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const toggleTargetClient = (client: string) => {
    setFormData(prev => {
      const current = prev.targetClients;
      if (current.includes(client)) {
        return { ...prev, targetClients: current.filter(c => c !== client) };
      } else {
        return { ...prev, targetClients: [...current, client] };
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skill: formData.skill === "Other" ? formData.customSkill : formData.skill,
      };
      
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        console.error("Failed to save onboarding");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="px-6 h-20 flex items-center border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">FIRST CLIENT AI</span>
        </div>
        <div className="ml-auto text-sm font-medium text-[var(--muted-foreground)]">
          Step {step} of 6
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-8 md:p-12">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold mb-2">What skill do you have?</h1>
              <p className="text-[var(--muted-foreground)] mb-8">Select your main skill to start building your service.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {skills.map(s => (
                  <button
                    key={s}
                    onClick={() => setFormData({...formData, skill: s})}
                    className={`p-4 text-left rounded-xl border ${formData.skill === s ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'} transition-all`}
                  >
                    <span className="font-medium">{s}</span>
                  </button>
                ))}
              </div>
              
              {formData.skill === "Other" && (
                <div className="mb-8">
                  <input 
                    type="text" 
                    placeholder="Type your skill..." 
                    className="w-full p-4 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                    value={formData.customSkill}
                    onChange={(e) => setFormData({...formData, customSkill: e.target.value})}
                  />
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={!formData.skill || (formData.skill === "Other" && !formData.customSkill)}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-bold mb-2">How experienced are you?</h1>
              <p className="text-[var(--muted-foreground)] mb-8">This helps us tailor your service offerings.</p>
              
              <div className="flex flex-col gap-4 mb-8">
                {experienceLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setFormData({...formData, experienceLevel: level})}
                    className={`p-5 text-left rounded-xl border ${formData.experienceLevel === level ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'} transition-all`}
                  >
                    <span className="font-medium text-lg">{level}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button onClick={handleBack} className="px-6 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium flex items-center gap-2 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!formData.experienceLevel}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-bold mb-2">Have you worked with clients before?</h1>
              <p className="text-[var(--muted-foreground)] mb-8">Be honest, there is no wrong answer!</p>
              
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setFormData({...formData, hasClientsBefore: false})}
                  className={`flex-1 p-6 text-center rounded-xl border ${formData.hasClientsBefore === false ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'} transition-all`}
                >
                  <span className="font-medium text-xl">No</span>
                </button>
                <button
                  onClick={() => setFormData({...formData, hasClientsBefore: true})}
                  className={`flex-1 p-6 text-center rounded-xl border ${formData.hasClientsBefore === true ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'} transition-all`}
                >
                  <span className="font-medium text-xl">Yes</span>
                </button>
              </div>
              
              <div className="flex justify-between">
                <button onClick={handleBack} className="px-6 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium flex items-center gap-2 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={formData.hasClientsBefore === null}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-bold mb-2">What type of clients interest you?</h1>
              <p className="text-[var(--muted-foreground)] mb-8">Select all that apply.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {targetClientOptions.map(client => (
                  <button
                    key={client}
                    onClick={() => toggleTargetClient(client)}
                    className={`p-3 text-sm text-center rounded-lg border ${formData.targetClients.includes(client) ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'} transition-all`}
                  >
                    {client}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button onClick={handleBack} className="px-6 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium flex items-center gap-2 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={formData.targetClients.length === 0}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-bold mb-2">What's your main freelance goal?</h1>
              <p className="text-[var(--muted-foreground)] mb-8">Knowing this helps us guide your journey.</p>
              
              <div className="flex flex-col gap-4 mb-8">
                {mainGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => setFormData({...formData, mainGoal: goal})}
                    className={`p-4 text-left rounded-xl border ${formData.mainGoal === goal ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'} transition-all`}
                  >
                    <span className="font-medium text-lg">{goal}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button onClick={handleBack} className="px-6 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium flex items-center gap-2 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!formData.mainGoal}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-bold mb-2">Preferred currency</h1>
              <p className="text-[var(--muted-foreground)] mb-8">What currency will you bill your clients in?</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {currencies.map(currency => (
                  <button
                    key={currency}
                    onClick={() => setFormData({...formData, currency})}
                    className={`p-4 text-center rounded-xl border ${formData.currency === currency ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary font-bold text-lg' : 'border-[var(--border)] hover:border-[var(--muted-foreground)] text-lg'} transition-all`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button onClick={handleBack} className="px-6 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium flex items-center gap-2 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !formData.currency}
                  className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-bold hover:bg-[var(--foreground)]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? "Saving..." : "Finish Onboarding"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
