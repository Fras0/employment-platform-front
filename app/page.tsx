import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
          Connect with the best tech talent
        </h1>
        <p className="text-xl text-muted-foreground max-w-[800px] mb-8">
          DevConnect helps software developers find their dream jobs and companies hire the perfect candidates.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </section>

      <section className="py-12 grid md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6 border rounded-lg">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">For Developers</h3>
          <p className="text-muted-foreground">
            Create your profile, showcase your skills, and find jobs that match your expertise and career goals.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 border rounded-lg">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">For Employers</h3>
          <p className="text-muted-foreground">
            Post job openings, search for qualified candidates, and streamline your hiring process.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 border rounded-lg">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="m18 16 4-4-4-4"></path>
              <path d="m6 8-4 4 4 4"></path>
              <path d="m14.5 4-5 16"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
          <p className="text-muted-foreground">
            Our platform intelligently matches developers with jobs based on skills, experience level, and preferences.
          </p>
        </div>
      </section>
    </div>
  )
}
