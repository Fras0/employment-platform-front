"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search } from "lucide-react"
import axios from "axios"

export default function JobsPage() {
  const { user, isAuthenticated } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    experienceLevel: "",
    city: "",
    languageNames: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // Fetch jobs with filters
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true)

        // Build query parameters
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        })

        if (filters.experienceLevel && filters.experienceLevel !== "any") {
          params.append("experienceLevel", filters.experienceLevel)
        }

        if (filters.city) {
          params.append("city", filters.city)
        }

        if (filters.languageNames) {
          params.append("languageNames", filters.languageNames)
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs?${params.toString()}`)

        setJobs(response.data.data || [])
        setPagination({
          ...pagination,
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
        })
      } catch (error) {
        console.error("Error fetching jobs:", error)
        // Mock data if API fails
        setJobs([
          {
            id: 1,
            title: "Senior React Developer",
            description: "We are looking for a senior React developer...",
            city: "San Francisco",
            experienceLevel: "senior",
            languages: [
              { id: 1, name: "JavaScript" },
              { id: 2, name: "TypeScript" },
              { id: 3, name: "React" },
            ],
          },
          {
            id: 2,
            title: "Junior Frontend Developer",
            description: "Great opportunity for a junior developer...",
            city: "New York",
            experienceLevel: "junior",
            languages: [
              { id: 1, name: "HTML" },
              { id: 2, name: "CSS" },
              { id: 3, name: "JavaScript" },
            ],
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [filters, pagination.page, pagination.limit])

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((job) => {
    // Search term filter
    if (!searchTerm) return true

    return (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.languages.some((lang: any) => lang.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPagination({ ...pagination, page: 1 }) // Reset to first page when filters change
  }

  // Calculate total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Job Listings</h1>
          <p className="text-muted-foreground">Find your next opportunity</p>
        </div>
        {isAuthenticated && user?.role === "employer" && (
          <Button asChild>
            <Link href="/jobs/post">Post a Job</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title, description, or programming languages..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.experienceLevel}
            onValueChange={(value) => handleFilterChange("experienceLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Level</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid-Level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Location</SelectItem>
              <SelectItem value="San Francisco">San Francisco</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
              <SelectItem value="Austin">Austin</SelectItem>
              <SelectItem value="Seattle">Seattle</SelectItem>
              <SelectItem value="giza">Giza</SelectItem>
              <SelectItem value="cairo">Cairo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div>
                      <h2 className="text-xl font-bold">{job.title}</h2>
                      <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {job.city}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {job.experienceLevel}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.languages.map((language: any) => (
                        <Badge key={language.id} variant="secondary">
                          {language.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end items-end gap-2">
                    <Button asChild>
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center px-4">
              Page {pagination.page} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
