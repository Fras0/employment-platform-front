"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import SkillsInput from "@/components/skills-input";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nationalId: "",
    city: "",
    bio: "",
    experienceLevel: "",
    companyName: "",
  });

  // const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        nationalId: user.nationalId || "",
        city: user.city || "",
        bio: user.bio || "",
        experienceLevel: user.experienceLevel || "",
        companyName: user.companyName || "",
      });
    }
  }, [isLoading, isAuthenticated, router, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExperienceLevelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, experienceLevel: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setIsUpdating(true);

    try {
      // This would be an API call to update the user profile
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile",
      });
    } finally {
      // setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">Personal Information</TabsTrigger>
          {/* <TabsTrigger value="security">Security</TabsTrigger> */}
          {/* {user.role === "employee" && (
            <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
          )} */}
        </TabsList>

        <TabsContent value="info">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    // onChange={handleChange}
                    disabled
                  />
                </div>

                {user.role === "employee" && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nationalId">National ID</Label>
                        <Input
                          id="nationalId"
                          name="nationalId"
                          value={formData.nationalId}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                    </div>
                  </>
                )}

                {user.role === "employer" && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {/* <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button> */}
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {user.role === "employee" && (
          <TabsContent value="skills">
            <Card>
              <form onSubmit={handleSubmit}>
                {/* <CardHeader>
                  <CardTitle>Skills & Experience</CardTitle>
                  <CardDescription>
                    Update your professional information
                  </CardDescription>
                </CardHeader> */}
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={handleExperienceLevelChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell employers about your skills and experience"
                      value={formData.bio}
                      onChange={handleChange}
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Programming Languages & Skills</Label>
                    <SkillsInput
                      initialSkills={["JavaScript", "React"]}
                    />
                    <p className="text-sm text-muted-foreground">
                      Add the programming languages and technologies you're
                      proficient in.
                    </p>
                  </div>
                </CardContent>
                {/* <CardFooter>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter> */}
              </form>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
