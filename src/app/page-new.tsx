"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Shirt, Users, Zap } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

const features = [
  {
    icon: Shirt,
    title: "Virtual Try-On",
    description: "Experience realistic virtual try-on with AI-powered technology",
    href: "/generate-image"
  },
  {
    icon: Users,
    title: "Body Parts Composer",
    description: "Create custom avatars with our advanced body composition tools",
    href: "/body-parts"
  },
  {
    icon: Sparkles,
    title: "Style Recommendations",
    description: "Get personalized fashion recommendations based on your preferences",
    href: "/recommend"
  },
  {
    icon: Zap,
    title: "Product Catalog",
    description: "Browse our extensive collection of fashion items and accessories",
    href: "/products"
  }
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-12 md:py-24 lg:py-32">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                AI-Powered
                <span className="text-primary"> Style Hub</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                Transform your fashion experience with cutting-edge AI technology. 
                Create, customize, and discover your perfect style.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/generate-image">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Features
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground sm:text-lg">
                Discover the tools that make AIStyleHub the ultimate fashion technology platform
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="mb-4">
                      {feature.description}
                    </CardDescription>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={feature.href}>
                        Learn More
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border-2">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center space-y-6 text-center">
                <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                  Ready to Transform Your Style?
                </h3>
                <p className="text-muted-foreground sm:text-lg">
                  Join thousands of users who are already experiencing the future of fashion with AIStyleHub
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Start Free Trial
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}