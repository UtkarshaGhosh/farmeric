import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitRiskAssessment, listMyFarms } from "@/integrations/firebase/api";

interface Question {
  id: string;
  text: string;
  help?: string;
  type: "yesno" | "multi";
  weight: number; // risk weight (higher = more risk if bad answer)
  options?: { value: string; label: string; risk: number }[]; // risk 0-1 per option
}

const QUESTIONS: Question[] = [
  { id: "q1", text: "Are visitors and vehicles logged at entry?", type: "yesno", weight: 12 },
  { id: "q2", text: "Do you maintain a 48-hour downtime for visitors from other farms?", type: "yesno", weight: 12 },
  { id: "q3", text: "What is your boot/gear hygiene protocol?", type: "multi", weight: 14, options: [
    { value: "none", label: "No protocol", risk: 1 },
    { value: "basic", label: "Boot dip only", risk: 0.6 },
    { value: "good", label: "Boot + gear sanitization", risk: 0.3 },
    { value: "excellent", label: "Dedicated gear + showers", risk: 0.05 },
  ]},
  { id: "q4", text: "How often are pens/houses disinfected?", type: "multi", weight: 14, options: [
    { value: "rarely", label: "Only after outbreaks", risk: 1 },
    { value: "monthly", label: "Monthly", risk: 0.6 },
    { value: "weekly", label: "Weekly", risk: 0.3 },
    { value: "perbatch", label: "Between batches", risk: 0.15 },
  ]},
  { id: "q5", text: "Are feed and water sources secure from contamination?", type: "yesno", weight: 12 },
  { id: "q6", text: "Is there a vaccination schedule in practice?", type: "yesno", weight: 12 },
  { id: "q7", text: "How is new stock introduced?", type: "multi", weight: 12, options: [
    { value: "direct", label: "Directly mixed", risk: 1 },
    { value: "briefiso", label: "Brief isolation (<7 days)", risk: 0.6 },
    { value: "quarantine", label: "14+ days quarantine + testing", risk: 0.15 },
  ]},
  { id: "q8", text: "Do farm workers and visitors use protective clothing (PPE)?", type: "yesno", weight: 12 },
  { id: "q9", text: "Are sick animals isolated from healthy stock?", type: "yesno", weight: 12 },
];

function computeRiskScore(answers: Record<string, string>): number {
  const maxTotal = QUESTIONS.reduce((s, q) => s + q.weight, 0);
  let riskPoints = 0;
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    if (q.type === "yesno") {
      // yes = good (low risk), no = bad (high risk)
      const risk = a === "yes" ? 0 : 1;
      riskPoints += risk * q.weight;
    } else if (q.type === "multi" && q.options) {
      const opt = q.options.find(o => o.value === a);
      const risk = opt ? opt.risk : 1;
      riskPoints += risk * q.weight;
    }
  }
  // Normalize 0..100 (higher = worse)
  return Math.round((riskPoints / maxTotal) * 100);
}

export function RiskAssessmentForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const score = useMemo(() => computeRiskScore(answers), [answers]);

  function setAnswer(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const farms = await listMyFarms();
      const farm = farms[0];
      if (!farm) throw new Error("No farm found for user");
      await submitRiskAssessment({ farm_id: farm.id, score, assessment_details: answers });
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Risk Assessment</DialogTitle>
          <DialogDescription>Answer the questions below to calculate your risk score.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 max-h-[60vh] overflow-auto pr-1">
          {QUESTIONS.map(q => (
            <div key={q.id} className="space-y-2">
              <Label className="text-sm font-medium">{q.text}</Label>
              {q.type === 'yesno' ? (
                <RadioGroup value={answers[q.id] || ''} onValueChange={(v) => setAnswer(q.id, v)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id={`${q.id}-yes`} value="yes" />
                    <Label htmlFor={`${q.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id={`${q.id}-no`} value="no" />
                    <Label htmlFor={`${q.id}-no`}>No</Label>
                  </div>
                </RadioGroup>
              ) : (
                <RadioGroup value={answers[q.id] || ''} onValueChange={(v) => setAnswer(q.id, v)}>
                  {q.options!.map(o => (
                    <div key={o.value} className="flex items-center space-x-2">
                      <RadioGroupItem id={`${q.id}-${o.value}`} value={o.value} />
                      <Label htmlFor={`${q.id}-${o.value}`}>{o.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Calculated Risk Score</div>
          <div className="font-semibold">{score}/100</div>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={onSubmit} disabled={submitting}>Submit Assessment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
