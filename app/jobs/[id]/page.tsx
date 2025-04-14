"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import JobApplicationForm from "@/components/job-application-form"
import axios from "axios"

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  // Fetch job details and check if user has applied
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true)
        const jobResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`)
        setJob(jobResponse.data.data)

        // Check if user has already applied to this job
        if (isAuthenticated && user?.role === "employee") {
          try {
            const applicationResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/applications/check/${id}`)
            setHasApplied(applicationResponse.data.hasApplied)
          } catch (error) {
            console.error("Error checking application status:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load job details. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchJobDetails()
    }
  }, [id, isAuthenticated, user, toast])

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    setShowApplicationForm(true)
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <div className="mb-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Job not found.</p>
            <Button asChild>
              <Link href="/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-3 text-muted-foreground">
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {job.city}
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {job.experienceLevel}
          </Badge>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{job.description}</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Required Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {job.languages.map((language: any) => (
              <Badge key={language.id} variant="secondary">
                {language.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {showApplicationForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Apply for this Position</CardTitle>
            <CardDescription>Submit your application to be considered for this role</CardDescription>
          </CardHeader>
          <CardContent>
            <JobApplicationForm
              jobId={id as string}
              onSuccess={() => {
                setShowApplicationForm(false)
                setHasApplied(true)
              }}
              onCancel={() => setShowApplicationForm(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Apply for this Position</CardTitle>
            <CardDescription>Submit your application to be considered for this role</CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated && user?.role === "employee" ? (
              hasApplied ? (
                <div className="text-center py-4">
                  <p className="text-green-600 font-medium mb-2">You have already applied for this job</p>
                  <p className="text-muted-foreground">
                    The employer will contact you if they're interested in your profile
                  </p>
                </div>
              ) : (
                <Button onClick={handleApply} className="w-full">
                  Apply Now
                </Button>
              )
            ) : isAuthenticated && user?.role === "employer" ? (
              <p className="text-muted-foreground">Employers cannot apply for jobs.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">Please log in as a developer to apply for this job.</p>
                <Button asChild className="w-full">
                  <Link href="/login">Login to Apply</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
