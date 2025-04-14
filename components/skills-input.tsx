"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"

interface SkillsInputProps {
  initialSkills?: string[]
  onChange: (skills: string[]) => void
}

export default function SkillsInput({ initialSkills = [], onChange }: SkillsInputProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills)
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch available programming languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/programming-languages`)
        if (response.data && response.data.data) {
          setAvailableLanguages(response.data.data.map((lang: any) => lang.name))
        }
      } catch (error) {
        console.error("Error fetching programming languages:", error)
        // Fallback languages if API fails
        setAvailableLanguages([
          "JavaScript",
          "TypeScript",
          "Python",
          "Java",
          "C#",
          "C++",
          "Ruby",
          "PHP",
          "Swift",
          "Kotlin",
          "Go",
          "Rust",
          "HTML",
          "CSS",
          "React",
          "Angular",
          "Vue",
          "Node.js",
          "Express",
          "Django",
          "Flask",
          "Spring",
          "ASP.NET",
          "Ruby on Rails",
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([])
      return
    }

    const filtered = availableLanguages
      .filter((lang) => lang.toLowerCase().includes(inputValue.toLowerCase()) && !skills.includes(lang))
      .slice(0, 5)

    setSuggestions(filtered)
  }, [inputValue, availableLanguages, skills])

  const addSkill = (skill: string) => {
    const trimmedValue = skill.trim()
    if (trimmedValue && !skills.includes(trimmedValue)) {
      const newSkills = [...skills, trimmedValue]
      setSkills(newSkills)
      onChange(newSkills)
      setInputValue("")
      setSuggestions([])
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter((skill) => skill !== skillToRemove)
    setSkills(newSkills)
    onChange(newSkills)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions.length > 0) {
        addSkill(suggestions[0])
      } else {
        addSkill(inputValue)
      }
    }
    // Add skill when comma is typed
    if (e.key === ",") {
      e.preventDefault()
      addSkill(inputValue)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Loading languages..." : "Add a skill (e.g. React, JavaScript)"}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={() => addSkill(inputValue)}
            variant="secondary"
            disabled={isLoading || !inputValue.trim()}
          >
            Add
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md">
            <ul className="py-1">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="px-3 py-2 hover:bg-muted cursor-pointer"
                  onClick={() => addSkill(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
              {skill}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeSkill(skill)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {skill}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
