/**
 * Design System Showcase
 * Comprehensive demonstration of all BoxCall design system features
 */

import { useState } from "react";
import { Button } from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Tooltip } from "../ui/Tooltip";
import { ProgressiveImage } from "../ui/ProgressiveImage";
import { LazyLoad } from "../ui/LazyLoad";
import { DarkModeToggle } from "../ui/DarkModeToggle";
import { useAdvancedTheme } from "./AdvancedThemeProvider";
import { ColorGenerationService } from "../../lib/colorGeneration";
import type { TeamColors } from "../../lib/colorGeneration";

export function DesignSystemShowcase() {
  const theme = useAdvancedTheme();
  const [selectedTeam, setSelectedTeam] = useState<TeamColors | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<
    "trust" | "energy" | "calm" | "achievement" | null
  >(null);
  const [selectedContext, setSelectedContext] = useState<
    "calm" | "energetic" | "professional" | null
  >(null);

  // Sample team colors for demonstration
  const sampleTeams: Record<string, TeamColors> = {
    "New England Patriots": { primary: "#002244", secondary: "#C8102E" },
    "Kansas City Chiefs": { primary: "#E31837", secondary: "#FFB612" },
    "San Francisco 49ers": { primary: "#AA0000", secondary: "#B3995D" },
    "Green Bay Packers": { primary: "#203731", secondary: "#FFB612" },
    "Dallas Cowboys": { primary: "#003594", secondary: "#869397" },
  };

  const handleTeamSelect = (_teamName: string, colors: TeamColors) => {
    setSelectedTeam(colors);
    theme.applyTeamTheme(colors);
    setSelectedEmotion(null);
    setSelectedContext(null);
  };

  const handleEmotionSelect = (
    emotion: "trust" | "energy" | "calm" | "achievement"
  ) => {
    setSelectedEmotion(emotion);
    theme.applyEmotionTheme(emotion);
    setSelectedTeam(null);
    setSelectedContext(null);
  };

  const handleContextSelect = (
    context: "calm" | "energetic" | "professional"
  ) => {
    setSelectedContext(context);
    theme.applyContextTheme(context);
    setSelectedTeam(null);
    setSelectedEmotion(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-text-primary">
            🎨 BoxCall Design System Showcase
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Experience our industry-leading design system with AI-powered
            theming, advanced animations, and comprehensive accessibility
            support.
          </p>
          <div className="flex justify-center gap-4">
            <DarkModeToggle />
            <Button
              variant="outline"
              onClick={() => theme.setShowcaseMode(!theme.showcaseMode)}
            >
              {theme.showcaseMode ? "Exit" : "Enter"} Showcase Mode
            </Button>
          </div>
        </div>

        {/* Theme Controls */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">
            🎯 Dynamic Theming
          </h2>

          {/* Team Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-text-primary">
              Team Colors (AI-Generated)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(sampleTeams).map(([teamName, colors]) => {
                const generatedPalette =
                  ColorGenerationService.generateTeamPalette(colors);
                return (
                  <Tooltip
                    key={teamName}
                    content={`${teamName} - AI Generated Palette`}
                  >
                    <button
                      onClick={() => handleTeamSelect(teamName, colors)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        selectedTeam?.primary === colors.primary
                          ? "border-electric-500 shadow-lg scale-105"
                          : "border-border hover:border-electric-300"
                      }`}
                    >
                      <div className="text-center space-y-2">
                        <div className="flex justify-center space-x-1">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{
                              backgroundColor: generatedPalette.primary,
                            }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{
                              backgroundColor: generatedPalette.secondary,
                            }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: generatedPalette.accent }}
                          />
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {teamName.split(" ")[1]}
                        </span>
                      </div>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Emotion Themes */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-text-primary">
              Emotion Themes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  key: "trust",
                  label: "Trust",
                  icon: "🛡️",
                  desc: "Reliability & Confidence",
                },
                {
                  key: "energy",
                  label: "Energy",
                  icon: "⚡",
                  desc: "Excitement & Action",
                },
                {
                  key: "calm",
                  label: "Calm",
                  icon: "🌊",
                  desc: "Focus & Tranquility",
                },
                {
                  key: "achievement",
                  label: "Achievement",
                  icon: "🏆",
                  desc: "Success & Progress",
                },
              ].map(({ key, label, icon, desc }) => (
                <Tooltip key={key} content={desc}>
                  <button
                    onClick={() => handleEmotionSelect(key as any)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedEmotion === key
                        ? "border-electric-500 shadow-lg scale-105 bg-electric-50"
                        : "border-border hover:border-electric-300"
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <span className="text-2xl">{icon}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {label}
                      </span>
                    </div>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Context Themes */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-text-primary">
              Context Themes
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "calm", label: "Calm", desc: "Admin & Dashboard" },
                { key: "energetic", label: "Energetic", desc: "Game Planning" },
                {
                  key: "professional",
                  label: "Professional",
                  desc: "Team Management",
                },
              ].map(({ key, label, desc }) => (
                <Tooltip key={key} content={desc}>
                  <button
                    onClick={() => handleContextSelect(key as any)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedContext === key
                        ? "border-electric-500 shadow-lg scale-105"
                        : "border-border hover:border-electric-300"
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <span className="text-sm font-medium text-text-primary">
                        {label}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {desc}
                      </span>
                    </div>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </Card>

        {/* Button Showcase */}
        <Card variant="glass" className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">
            🔘 Advanced Button System
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="link">Link</Button>
            <Button variant="link">Link</Button>
            <Button variant="brandLink">Brand Link</Button>
            <Button variant="neutralLink">Neutral Link</Button>
            <Button variant="infoLink">Info Link</Button>
            <Button variant="dangerLink">Danger Link</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-text-primary">
              Interactive Features
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" hapticType="success">
                Haptic Success
              </Button>
              <Button variant="warning" hapticType="warning">
                Haptic Warning
              </Button>
              <Button variant="danger" hapticType="error">
                Haptic Error
              </Button>
              <Tooltip content="This button has a tooltip!">
                <Button variant="primary">With Tooltip</Button>
              </Tooltip>
            </div>
          </div>
        </Card>

        {/* Card Showcase */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">
            📋 Advanced Card System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default" className="p-4">
              <h3 className="font-semibold mb-2">Default Card</h3>
              <p className="text-sm text-text-secondary">
                Standard card with subtle elevation.
              </p>
            </Card>

            <Card variant="glass" className="p-4">
              <h3 className="font-semibold mb-2">Glass Card</h3>
              <p className="text-sm text-text-secondary">
                Glassmorphism effect with backdrop blur.
              </p>
            </Card>

            <Card variant="elevated" className="p-4">
              <h3 className="font-semibold mb-2">Elevated Card</h3>
              <p className="text-sm text-text-secondary">
                Enhanced shadows and micro-animations.
              </p>
            </Card>

            <Card variant="outlined" className="p-4">
              <h3 className="font-semibold mb-2">Outlined Card</h3>
              <p className="text-sm text-text-secondary">
                Clean border with jade accent.
              </p>
            </Card>

            <Card variant="filled" className="p-4">
              <h3 className="font-semibold mb-2">Filled Card</h3>
              <p className="text-sm text-text-secondary">
                Background fill for emphasis.
              </p>
            </Card>

            <Card variant="accent" interactive className="p-4">
              <h3 className="font-semibold mb-2">Interactive Card</h3>
              <p className="text-sm text-text-secondary">
                Hover effects and animations.
              </p>
            </Card>
          </div>
        </Card>

        {/* Loading States */}
        <Card variant="glass" className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">
            ⏳ Advanced Loading States
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skeletons */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-text-primary">
                Skeleton Loading
              </h3>
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <div className="flex space-x-4">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </div>

            {/* Empty States */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-text-primary">
                Contextual Empty States
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <EmptyState
                  icon="target"
                  title="No plays yet"
                  description="Create your first play"
                  primaryAction={{
                    label: "Create Play",
                    onClick: () => {},
                  }}
                />
                <EmptyState
                  icon="users"
                  title="No team members"
                  description="Invite players to your team"
                  primaryAction={{
                    label: "Invite",
                    onClick: () => {},
                  }}
                />
              </div>
            </div>
          </div>

          {/* Progressive Loading */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4 text-text-primary">
              Progressive Image Loading
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <LazyLoad
                fallback={<Skeleton className="h-32 w-full rounded-lg" />}
              >
                <ProgressiveImage
                  src="https://picsum.photos/300/200?random=1"
                  alt="Sample image"
                  className="h-32 w-full object-cover rounded-lg"
                />
              </LazyLoad>
              <LazyLoad
                fallback={<Skeleton className="h-32 w-full rounded-lg" />}
              >
                <ProgressiveImage
                  src="https://picsum.photos/300/200?random=2"
                  alt="Sample image"
                  className="h-32 w-full object-cover rounded-lg"
                />
              </LazyLoad>
              <LazyLoad
                fallback={<Skeleton className="h-32 w-full rounded-lg" />}
              >
                <ProgressiveImage
                  src="https://picsum.photos/300/200?random=3"
                  alt="Sample image"
                  className="h-32 w-full object-cover rounded-lg"
                />
              </LazyLoad>
              <LazyLoad
                fallback={<Skeleton className="h-32 w-full rounded-lg" />}
              >
                <ProgressiveImage
                  src="https://picsum.photos/300/200?random=4"
                  alt="Sample image"
                  className="h-32 w-full object-cover rounded-lg"
                />
              </LazyLoad>
            </div>
          </div>
        </Card>

        {/* Color Palette Display */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">
            🎨 Current Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(theme.palette).map(([key, value]) => (
              <div key={key} className="text-center space-y-2">
                <div
                  className="h-16 w-full rounded-lg border-2 border-border"
                  style={{ backgroundColor: value }}
                />
                <span className="text-xs font-medium text-text-primary capitalize">
                  {key}
                </span>
                <span className="text-xs text-text-secondary font-mono">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Accessibility Showcase */}
        <Card variant="glass" className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">
            ♿ Accessibility Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4 text-text-primary">
                Color Blindness Support
              </h3>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  onClick={() =>
                    theme.generateAccessiblePalette("deuteranopia")
                  }
                >
                  Deuteranopia (Red-Green)
                </Button>
                <Button
                  variant="warning"
                  onClick={() => theme.generateAccessiblePalette("protanopia")}
                >
                  Protanopia (Red)
                </Button>
                <Button
                  variant="infoLink"
                  onClick={() => theme.generateAccessiblePalette("tritanopia")}
                >
                  Tritanopia (Blue)
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 text-text-primary">
                High Contrast Mode
              </h3>
              <Button
                variant="glass"
                onClick={() => theme.generateAccessiblePalette("highContrast")}
              >
                Enable High Contrast
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
