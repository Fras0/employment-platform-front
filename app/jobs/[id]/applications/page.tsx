"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export default function JobApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated or not an employer
    if (
      !isLoading &&
      (!isAuthenticated || (user && user.role !== "employer"))
    ) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      try {
        setIsLoading(true);

        // Fetch job details
        const jobResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`
        );
        setJob(jobResponse.data.data);

        // Fetch applications for this job
        const applicationsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/applications/job/${id}`
        );
        setApplications(applicationsResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching job applications:", error);

        // Mock data if API fails
        setJob({
          id,
          title: "Senior React Developer",
          company: "TechCorp",
          location: "San Francisco, CA",
          postedDate: new Date().toISOString(),
        });

        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJobAndApplications();
    }
  }, [id]);

  const updateApplicationStatus = async (
    applicationId: string,
    status: string
  ) => {
    try {
      if (status === "rejected") {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/reject`
        );
      } else if (status === "accepted") {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/accept`
        );
      }

      // Update local state
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      );

      toast({
        title: "Status updated",
        description: `Application status changed to ${status}`,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the application status",
      });
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Job not found.</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="mb-4 -ml-3 text-muted-foreground"
        >
          <Link href="/dashboard?tab=postings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Postings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          Applications for {job.title}
        </h1>
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Posted on {formatDate(job.postedDate)}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicants ({applications.length})</CardTitle>
          <CardDescription>
            Review and manage applications for this position
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No applications received yet.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-6">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onStatusChange={updateApplicationStatus}
                    />
                  ))}
                </div>
              </TabsContent>

              {["pending", "reviewed", "accepted", "rejected"].map((status) => (
                <TabsContent key={status} value={status}>
                  <div className="space-y-6">
                    {applications
                      .filter((app) => app.status === status)
                      .map((application) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          onStatusChange={updateApplicationStatus}
                        />
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ApplicationCardProps {
  application: any;
  onStatusChange: (id: string, status: string) => void;
}

function ApplicationCard({
  application,
  onStatusChange,
}: ApplicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-medium">{application.employee.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {application.employee.experienceLevel} •{" "}
              {application.employee.city}
            </p>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Applied on {new Date(application.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge
              variant={
                application.status === "accepted"
                  ? "success"
                  : application.status === "rejected"
                  ? "destructive"
                  : application.status === "reviewed"
                  ? "secondary"
                  : "outline"
              }
              className="capitalize mb-2"
            >
              {application.status}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Details" : "View Details"}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-4 bg-muted/30">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Cover Letter</h4>
              <p className="text-sm whitespace-pre-line">
                {application.coverLetter}
              </p>
            </div>

            <div className="flex items-center">
              <Button size="sm" variant="outline" className="mr-2" asChild>
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Resume
                </a>
              </Button>

              <Button size="sm" variant="outline" asChild>
                <Link href={`/profile/${application.employee.user.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Profile
                </Link>
              </Button>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {application.status !== "accepted" && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onStatusChange(application.id, "accepted")}
                  >
                    Accept
                  </Button>
                )}
                {application.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onStatusChange(application.id, "rejected")}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
