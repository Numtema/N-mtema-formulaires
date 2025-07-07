"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DesignerWidget } from "@/components/designer-widget"
import { FormTester } from "@/components/form-tester"
import { Dashboard } from "@/components/dashboard"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { ThemeToggle } from "@/components/theme-toggle"
import { ApiConfig } from "@/components/api-config"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"designer" | "tester" | "dashboard">("designer")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ApiConfig />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Hero />
      <Features />

      {/* Widgets Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Plateforme Nümtema Formulaires
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Créez, testez et gérez vos formulaires intelligents
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="glass-card p-2 rounded-2xl">
              <div className="flex space-x-2">
                <Button
                  onClick={() => setActiveTab("designer")}
                  variant={activeTab === "designer" ? "default" : "ghost"}
                  className="rounded-xl transition-all duration-300"
                >
                  🎨 Designer
                </Button>
                <Button
                  onClick={() => setActiveTab("tester")}
                  variant={activeTab === "tester" ? "default" : "ghost"}
                  className="rounded-xl transition-all duration-300"
                >
                  🧪 Test Forms
                </Button>
                <Button
                  onClick={() => setActiveTab("dashboard")}
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  className="rounded-xl transition-all duration-300"
                >
                  📊 Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Widget Display */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              {activeTab === "designer" && <DesignerWidget />}
              {activeTab === "tester" && <FormTester />}
              {activeTab === "dashboard" && <Dashboard />}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
