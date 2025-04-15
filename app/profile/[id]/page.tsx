"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Briefcase, Mail } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`
        );
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(
          "Failed to load user profile. The user may not exist or you may not have permission to view this profile."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <div className="mb-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">User not found.</p>
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
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
        <div className="flex items-center text-muted-foreground">
          <Mail className="mr-1 h-4 w-4" />
          {user.email}
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              {user.role === "employee"
                ? "Developer profile"
                : "Employer profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.role === "employee" ? (
              <>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.city || "Location not specified"}</span>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Experience Level</h3>
                  <Badge variant="outline" className="capitalize">
                    {user.experienceLevel || "Not specified"}
                  </Badge>
                </div>

                {user.bio && (
                  <div>
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {user.bio}
                    </p>
                  </div>
                )}

                {user.languages && user.languages.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((language: any) => (
                        <Badge key={language.id} variant="secondary">
                          {language.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{user.companyName || "Company not specified"}</span>
                </div>

                {user.bio && (
                  <div>
                    <h3 className="font-medium mb-2">About the Company</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {user.bio}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {currentUser &&
          currentUser.role === "employer" &&
          user.role === "employee" && (
            <Card>
              <CardHeader>
                <CardTitle>Contact this Developer</CardTitle>
                <CardDescription>
                  Reach out about job opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Send Message</Button>
              </CardContent>
            </Card>
          )}

        {currentUser &&
          currentUser.role === "employee" &&
          user.role === "employer" && (
            <Card>
              <CardHeader>
                <CardTitle>View Job Postings</CardTitle>
                <CardDescription>
                  See open positions at {user.companyName || "this company"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
