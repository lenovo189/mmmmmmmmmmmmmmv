"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { trackUserEngagement } from "@/lib/analytics";

interface FeedbackFormProps {
  onClose?: () => void;
}

export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Insert feedback into Supabase
      const { error } = await supabase.from("feedback").insert([
        {
          name,
          email,
          feedback,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Track feedback submission
      trackUserEngagement("feedback_submitted", {
        feedback_length: feedback.length,
      });

      setSubmitStatus("success");
      setName("");
      setEmail("");
      setFeedback("");
      
      // Close the form after a short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus("error");
      
      // Track feedback submission error
      trackUserEngagement("feedback_submission_error", {
        error_message: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name (Optional)</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="feedback">Feedback or Bug Report *</Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please describe the bug you encountered or share your feedback..."
            required
            rows={5}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting || !feedback.trim()}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
          {onClose && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
      
      {submitStatus === "success" && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
          Thank you for your feedback! We appreciate you helping us improve.
        </div>
      )}
      
      {submitStatus === "error" && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
          There was an error submitting your feedback. Please try again.
        </div>
      )}
    </div>
  );
}