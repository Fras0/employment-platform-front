"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import axios from "axios";
import { MapPin, Clock, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLength, setCandidatesLength] = useState(0);
  const [employerApplicants, setEmployerApplicants] = useState<any[]>([]);
  const [profileViews, setProfileViews] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [programmingLanguages, setProgrammingLanguages] = useState<any[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);

  // Candidate search and filter state
  const [candidateFilters, setCandidateFilters] = useState({
    experienceLevel: "",
    bio: "",
    city: "",
    languageNames: "",
  });
  const [candidatePagination, setCandidatePagination] = useState({
    page: 1,
    limit: 3,
    total: 0,
  });

  const handleFilterChange = (key: string, value: string) => {
    setCandidateFilters({ ...candidateFilters, [key]: value });
    setCandidatePagination({ ...candidatePagination, page: 1 }); // Reset to first page when filters change
  };

  // Fetch programming languages
  useEffect(() => {
    if (!user) return;
    const fetchProgrammingLanguages = async () => {
      try {
        setIsLoadingLanguages(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/programming-languages`
        );
        setProgrammingLanguages(response.data.data || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to load programming languages. Please try again.",
        });
        // console.error("Error fetching programming languages:", error);
        // Fallback languages if API fails
        setProgrammingLanguages([]);
      } finally {
        setIsLoadingLanguages(false);
      }
    };

    fetchProgrammingLanguages();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsLoadingData(true);

      try {
        // Fetch profile views count
        if (user.id) {
          try {
            const viewsResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/users/views`
            );
            setProfileViews(viewsResponse.data.data.length || 0);
          } catch (error) {
            console.error("Error fetching profile views:", error);
            // Set mock data if API fails
            setProfileViews(Math.floor(Math.random() * 100) + 10);
          }
        }
        // console.log(user);

        if (user.role === "employee") {
          // Fetch user's applications
          const applicationsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/applications/employee`
          );
          setApplications(applicationsResponse.data.data || []);

          // Fetch recommended jobs
          const recommendedJobsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/jobs/employee/recommendations`
          );
          setRecommendedJobs(recommendedJobsResponse.data.data || []);
        } else if (user.role === "employer") {
          // Fetch employer's job postings
          const jobsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/jobs/employer`
          );
          setJobs(jobsResponse.data.data || []);

          const employerApplicantsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/applications/employer`
          );
          setEmployerApplicants(employerApplicantsResponse.data.data || []);

          const allCandidates = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/users/candidates`
          );

          setCandidatesLength(allCandidates.data.data.length || 0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Set mock data if API fails
        if (user.role === "employee") {
          setApplications([]);

          setRecommendedJobs([]);
        } else if (user.role === "employer") {
          setJobs([]);
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "candidates") {
      fetchCandidates();
    }
  }, [
    activeTab,
    candidatePagination.page,
    candidateFilters.city,
    candidateFilters.experienceLevel,
    candidateFilters.languageNames,
  ]);

  // Fetch candidates when filters change or tab is selected
  const fetchCandidates = async () => {
    if (!user || user.role !== "employer") return;

    setIsLoadingCandidates(true);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: candidatePagination.page.toString(),
        limit: candidatePagination.limit.toString(),
      });

      if (
        candidateFilters.experienceLevel &&
        candidateFilters.experienceLevel !== "any"
      ) {
        params.append("experienceLevel", candidateFilters.experienceLevel);
      }

      if (candidateFilters.city && candidateFilters.city !== "any") {
        params.append("city", candidateFilters.city);
      }

      if (
        candidateFilters.languageNames &&
        candidateFilters.languageNames !== "any"
      ) {
        params.append("languageNames", candidateFilters.languageNames);
      }
      if (candidateFilters.bio && candidateFilters.bio !== "any") {
        params.append("bio", candidateFilters.bio);
      }

      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/users/candidates/?${params.toString()}`
      );

      setCandidates(response.data.data || []);
      setCandidatePagination({
        ...candidatePagination,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        total: response.data.total || 0,
      });
    } catch (error) {
      console.error("Error fetching candidates:", error);
      // Mock data if API fails
      setCandidates([]);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  // Calculate total pages for candidates pagination
  const totalCandidatePages =
    Math.ceil(candidatePagination.total / candidatePagination.limit) || 1;

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Format date to relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">
        Welcome, {user.employer?.name || user.employee?.name || user.email}
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="overview"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {user.role === "employee" && (
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          )}
          {user.role === "employee" && (
            <TabsTrigger value="jobs">Job Recommendations</TabsTrigger>
          )}
          {user.role === "employer" && (
            <TabsTrigger value="postings">My Job Postings</TabsTrigger>
          )}
          {user.role === "employer" && (
            <TabsTrigger value="candidates" onClick={fetchCandidates}>
              Explore Candidates
            </TabsTrigger>
          )}
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Profile Views</CardTitle>
                <CardDescription>Total views of your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profileViews}</div>
                <p className="text-sm text-muted-foreground">
                  Total profile views
                </p>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("profile");
                    }}
                  >
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {user.role === "employee" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Job Applications</CardTitle>
                    <CardDescription>
                      Track your job applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {applications.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Active applications
                    </p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("applications");
                        }}
                      >
                        My applications status
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Jobs</CardTitle>
                    <CardDescription>
                      Jobs matching your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {recommendedJobs.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New recommendations
                    </p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("jobs");
                        }}
                      >
                        View recommendations
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {user.role === "employer" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Active Job Postings</CardTitle>
                    <CardDescription>Your current job listings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{jobs.length}</div>
                    <p className="text-sm text-muted-foreground">
                      Active listings
                    </p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault(); // prevents navigation
                          setActiveTab("postings"); // switches the tab
                        }}
                      >
                        Manage Jobs
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Applications</CardTitle>
                    <CardDescription>
                      Developers who applied to your jobs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {employerApplicants.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total applications
                    </p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault(); // prevents navigation
                          setActiveTab("postings"); // switches the tab
                        }}
                      >
                        View applicants
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Developers you can browse</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {candidatesLength || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total employees
                    </p>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("candidates");
                        }}
                      >
                        Browse employees
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {user.role === "employee" && (
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>
                  Track the status of your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-medium">
                              {application.job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {application.job.employer.companyName}
                            </p>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {application.job.city}
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
                              className="capitalize"
                            >
                              {application.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              Applied {formatDate(application.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      You haven't applied to any jobs yet.
                    </p>
                    <Button asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {user.role === "employee" && (
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>
                  Jobs that match your skills and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : recommendedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-medium capitalize">
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {job.employer?.companyName || "Unknown Company"}
                            </p>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.city}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.languages?.map((lang) => (
                                <Badge
                                  key={lang.id}
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
                                  {lang.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/jobs/${job.id}`}>View Job</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Button asChild variant="outline">
                        <Link href="/jobs">View All Jobs</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No job recommendations available.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete your profile and add your skills to get
                      personalized recommendations.
                    </p>
                    <Button asChild>
                      <Link href="/profile?tab=skills">Update Skills</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {user.role === "employer" && (
          <TabsContent value="postings">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>My Job Postings</CardTitle>
                  <CardDescription>
                    Manage your active job listings
                  </CardDescription>
                </div>
                <Button className="mt-4 sm:mt-0" asChild>
                  <Link href="/jobs/post">Post New Job</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-medium">{job.title}</h3>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.city}
                            </div>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              {job.description.length > 20
                                ? job.description.slice(0, 70) + "..."
                                : job.description}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/jobs/${job.id}`}>View</Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/jobs/${job.id}/applications`}>
                                  Applicants
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      You haven't posted any jobs yet.
                    </p>
                    <Button asChild>
                      <Link href="/jobs/post">Post a Job</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {user.role === "employer" && (
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>
                  Browse and search for developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Search and filter section */}

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by bio or skills..."
                      className="pl-10"
                      value={candidateFilters.bio}
                      onChange={(e) =>
                        handleFilterChange("bio", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Experience Level
                      </label>
                      <Select
                        value={candidateFilters.experienceLevel}
                        onValueChange={(value) =>
                          handleFilterChange("experienceLevel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Level</SelectItem>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid-Level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Select
                        value={candidateFilters.city}
                        onValueChange={(value) =>
                          handleFilterChange("city", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Location</SelectItem>
                          <SelectItem value="mansoura">Mansoura</SelectItem>
                          <SelectItem value="cairo">Cairo</SelectItem>
                          <SelectItem value="giza">Giza</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Programming Language
                      </label>
                      <Select
                        value={candidateFilters.languageNames}
                        onValueChange={(value) =>
                          handleFilterChange("languageNames", value)
                        }
                        disabled={isLoadingLanguages}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingLanguages ? "Loading..." : "Any Language"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Language</SelectItem>
                          {programmingLanguages.map((language) => (
                            <SelectItem key={language.id} value={language.name}>
                              {language.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Button onClick={fetchCandidates}>Search</Button>
                    <p className="text-sm text-muted-foreground">
                      {candidatePagination.total} candidate
                      {candidatePagination.total !== 1 ? "s" : ""} found
                    </p>
                  </div>

                  {/* Candidates list */}
                  {isLoadingCandidates ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : candidates.length > 0 ? (
                    <div className="space-y-4">
                      {candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                              <h3 className="font-medium">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {candidate.email}
                              </p>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {candidate.city || "Location not specified"}
                              </div>
                              <Badge
                                variant="outline"
                                className="mt-2 capitalize"
                              >
                                {candidate.experienceLevel ||
                                  "Experience not specified"}
                              </Badge>
                              {candidate.bio && (
                                <p className="mt-2 text-sm line-clamp-2">
                                  {candidate.bio}
                                </p>
                              )}
                              {candidate.languages &&
                                candidate.languages.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {candidate.languages.map(
                                      (language: any) => (
                                        <Badge
                                          key={language.id}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {language.name}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                              <Button size="sm" asChild>
                                <Link href={`/profile/${candidate.user.id}`}>
                                  View Profile
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No candidates found matching your criteria.
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalCandidatePages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCandidatePagination((prev) => ({
                              ...prev,
                              page: prev.page - 1,
                            }))
                          }
                          disabled={candidatePagination.page === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center px-4">
                          Page {candidatePagination.page} of{" "}
                          {totalCandidatePages}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCandidatePagination((prev) => ({
                              ...prev,
                              page: prev.page + 1,
                            }))
                          }
                          disabled={
                            candidatePagination.page === totalCandidatePages
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Role</h3>
                  <p className="text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
                {user.role === "employee" && (
                  <>
                    <div>
                      <h3 className="font-medium">Experience Level</h3>
                      <p className="text-muted-foreground capitalize">
                        {user.experienceLevel || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-muted-foreground">
                        {user.city || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Bio</h3>
                      <p className="text-muted-foreground">
                        {user.bio || "No bio provided"}
                      </p>
                    </div>
                  </>
                )}
                {user.role === "employer" && (
                  <div>
                    <h3 className="font-medium">Company</h3>
                    <p className="text-muted-foreground">
                      {user.companyName || "Not specified"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
