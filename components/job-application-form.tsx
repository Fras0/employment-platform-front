"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface JobApplicationFormProps {
  jobId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function JobApplicationForm({
  jobId,
  onSuccess,
  onCancel,
}: JobApplicationFormProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept PDF files
    if (file.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file",
      });
      return;
    }
    setResume(file)

    try {
      setIsUploading(true);

      // In a real application, you would upload the file to your server or a storage service
      // For this example, we'll simulate an upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate a successful upload with a fake URL
      setResumeUrl(`resume-${1 / 1}.pdf`);

      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          "There was an error uploading your resume. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeUrl) {
      toast({
        variant: "destructive",
        title: "Resume required",
        description:
          "Please upload your resume before submitting your application",
      });
      return;
    }

    setIsSubmitting(true);


    const formData = new FormData();
    if (resume instanceof File) {
      console.log("im heeeeeere")
      formData.append("resume", resume);
    }
    try {
      // Submit application to API
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/apply/${jobId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }
      );

      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description:
          "There was an error submitting your application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resume">Resume (PDF)</Label>
        <div className="flex items-center gap-4">
          <Input
            id="resume"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isUploading || isSubmitting}
            className="flex-1"
          />
          {isUploading && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
        {resumeUrl && (
          <p className="text-sm text-muted-foreground">
            Resume uploaded successfully
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverLetter">Cover Letter</Label>
        <Textarea
          id="coverLetter"
          placeholder="Introduce yourself and explain why you're a good fit for this position"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[200px]"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </form>
  );
}
