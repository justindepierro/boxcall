import "./App.css";
import { DevHealthCheck } from "./components/ui/DevHealthCheck";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Design System Components
import { Typography } from "./components/design-system";
import { Auth } from "./components/ui/Auth";
import { Breadcrumb } from "./components/ui/Breadcrumb";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";

// Supabase Integration
import { Input } from "./components/ui/Input";
import { Modal } from "./components/ui/Modal";
import { NavBar } from "./components/ui/NavBar";
import { Select } from "./components/ui/Select";
import { Sidebar } from "./components/ui/Sidebar";
import { Table } from "./components/ui/Table";
import { TextArea } from "./components/ui/TextArea";

// Store hooks - simplified
import { useEffect, useState } from "react";
import { useUI } from "./app/store";
import type { BreadcrumbItem } from "./components/ui/Breadcrumb";
import type { NavBarItem } from "./components/ui/NavBar";
import type { SidebarItem } from "./components/ui/Sidebar";
import type { TableColumn } from "./components/ui/Table";
import { testDatabaseConnection } from "./lib/database-helpers";

function App() {
  const { theme, setTheme } = useUI();

  // Test database connection on app start
  useEffect(() => {
    const initBoxCall = async () => {
      console.log("🚀 Initializing BoxCall database...");

      const connectionOk = await testDatabaseConnection();
      if (connectionOk) {
        console.log("✅ BoxCall database connected successfully!");
      } else {
        console.log(
          "❌ Database connection failed - check your .env.local configuration"
        );
      }
    };

    initBoxCall();
  }, []);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Modal states
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Apply dark class to document root for Tailwind dark mode
  useEffect(() => {
    // Force remove any cached dark state
    document.documentElement.classList.remove("dark");

    // Apply theme based on store state
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }

    // Force all elements with problematic background classes to update
    setTimeout(() => {
      const elements = document.querySelectorAll(
        '[style*="background-color: rgb(31, 41, 55)"], [style*="background-color: rgb(17, 24, 39)"]'
      );
      elements.forEach((el) => {
        if (theme === "light") {
          (el as HTMLElement).style.backgroundColor = "white";
          (el as HTMLElement).style.color = "rgb(17, 24, 39)";
        }
      });
    }, 100);
  }, [theme]);

  // Force theme reset on component mount
  useEffect(() => {
    console.log("App mounted, forcing theme reset to:", theme);
    // Force light mode if theme is light
    if (theme === "light") {
      document.documentElement.className = "";
      console.log("Forced light mode - cleared all classes");
    }
  }, [theme]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Navigation configuration
  const navItems: NavBarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      onClick: () => console.log("Dashboard clicked"),
      active: true,
    },
    {
      id: "team",
      label: "Team",
      icon: "👥",
      onClick: () => console.log("Team clicked"),
      children: [
        {
          id: "roster",
          label: "Roster",
          icon: "📋",
          onClick: () => console.log("Roster clicked"),
        },
        {
          id: "stats",
          label: "Statistics",
          icon: "📈",
          onClick: () => console.log("Stats clicked"),
          badge: "3",
        },
      ],
    },
    {
      id: "playbook",
      label: "Playbook",
      icon: "📘",
      onClick: () => console.log("Playbook clicked"),
      badge: "NEW",
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: "📅",
      onClick: () => console.log("Schedule clicked"),
    },
  ];

  // Sidebar configuration
  const sidebarItems: SidebarItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "📊",
      onClick: () => console.log("Overview clicked"),
      active: true,
    },
    {
      id: "team-management",
      label: "Team Management",
      icon: "👥",
      children: [
        {
          id: "players",
          label: "Players",
          icon: "🏃‍♂️",
          onClick: () => console.log("Players clicked"),
          badge: "23",
        },
        {
          id: "coaches",
          label: "Coaches",
          icon: "👨‍💼",
          onClick: () => console.log("Coaches clicked"),
        },
        {
          id: "staff",
          label: "Support Staff",
          icon: "👷‍♀️",
          onClick: () => console.log("Staff clicked"),
        },
      ],
    },
    {
      id: "divider-1",
      label: "",
      divider: true,
    },
    {
      id: "playbook-management",
      label: "Playbook",
      icon: "📘",
      children: [
        {
          id: "offensive-plays",
          label: "Offensive Plays",
          icon: "⚡",
          onClick: () => console.log("Offensive plays clicked"),
          badge: "NEW",
        },
        {
          id: "defensive-plays",
          label: "Defensive Plays",
          icon: "🛡️",
          onClick: () => console.log("Defensive plays clicked"),
        },
        {
          id: "special-teams",
          label: "Special Teams",
          icon: "🏆",
          onClick: () => console.log("Special teams clicked"),
        },
      ],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "📈",
      onClick: () => console.log("Analytics clicked"),
      badge: "5",
    },
    {
      id: "divider-2",
      label: "",
      divider: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      onClick: () => console.log("Settings clicked"),
    },
    {
      id: "help",
      label: "Help & Support",
      icon: "❓",
      onClick: () => console.log("Help clicked"),
    },
  ];

  // Breadcrumb configuration
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      id: "home",
      label: "Home",
      icon: "🏠",
      onClick: () => console.log("Home clicked"),
    },
    {
      id: "team",
      label: "Team Management",
      icon: "👥",
      onClick: () => console.log("Team clicked"),
    },
    {
      id: "players",
      label: "Players",
      icon: "🏃‍♂️",
      onClick: () => console.log("Players clicked"),
    },
    {
      id: "roster",
      label: "Roster Configuration",
      icon: "📋",
      onClick: () => console.log("Roster clicked"),
    },
    {
      id: "current",
      label: "Player Details",
      icon: "👤",
      current: true,
    },
  ];

  // Sample football player data for Table showcase
  const playerData = [
    {
      id: "1",
      name: "Marcus Johnson",
      position: "QB",
      jersey: 12,
      grade: "Senior",
      height: "6'2\"",
      weight: 185,
      gpa: 3.8,
      active: true,
    },
    {
      id: "2",
      name: "Tyler Williams",
      position: "RB",
      jersey: 23,
      grade: "Junior",
      height: "5'10\"",
      weight: 175,
      gpa: 3.6,
      active: true,
    },
    {
      id: "3",
      name: "James Rodriguez",
      position: "WR",
      jersey: 85,
      grade: "Sophomore",
      height: "6'1\"",
      weight: 170,
      gpa: 3.9,
      active: false,
    },
    {
      id: "4",
      name: "David Thompson",
      position: "TE",
      jersey: 88,
      grade: "Senior",
      height: "6'4\"",
      weight: 220,
      gpa: 3.4,
      active: true,
    },
    {
      id: "5",
      name: "Michael Davis",
      position: "OL",
      jersey: 76,
      grade: "Junior",
      height: "6'5\"",
      weight: 285,
      gpa: 3.2,
      active: true,
    },
    {
      id: "6",
      name: "Chris Wilson",
      position: "DL",
      jersey: 95,
      grade: "Senior",
      height: "6'3\"",
      weight: 265,
      gpa: 3.5,
      active: true,
    },
    {
      id: "7",
      name: "Brandon Lee",
      position: "LB",
      jersey: 54,
      grade: "Sophomore",
      height: "6'0\"",
      weight: 210,
      gpa: 3.7,
      active: true,
    },
    {
      id: "8",
      name: "Alex Garcia",
      position: "CB",
      jersey: 21,
      grade: "Junior",
      height: "5'11\"",
      weight: 180,
      gpa: 3.3,
      active: false,
    },
    {
      id: "9",
      name: "Ryan Martinez",
      position: "S",
      jersey: 32,
      grade: "Senior",
      height: "6'0\"",
      weight: 190,
      gpa: 3.6,
      active: true,
    },
    {
      id: "10",
      name: "Kevin Anderson",
      position: "K",
      jersey: 7,
      grade: "Sophomore",
      height: "5'9\"",
      weight: 165,
      gpa: 3.8,
      active: true,
    },
  ];

  // Table columns configuration
  const playerColumns: TableColumn<(typeof playerData)[0]>[] = [
    {
      id: "jersey",
      header: "#",
      accessorKey: "jersey",
      sortable: true,
      width: "60px",
      align: "center",
    },
    {
      id: "name",
      header: "Player Name",
      accessorKey: "name",
      sortable: true,
      filterable: true,
    },
    {
      id: "position",
      header: "Position",
      accessorKey: "position",
      sortable: true,
      filterable: true,
      width: "100px",
      align: "center",
      cell: (value) => (
        <span
          className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${
            value === "QB"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              : value === "RB"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : value === "WR"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : value === "TE"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : value === "OL"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }
        `}
        >
          {String(value)}
        </span>
      ),
    },
    {
      id: "grade",
      header: "Grade",
      accessorKey: "grade",
      sortable: true,
      width: "100px",
      align: "center",
    },
    {
      id: "height",
      header: "Height",
      accessorKey: "height",
      width: "80px",
      align: "center",
    },
    {
      id: "weight",
      header: "Weight",
      accessorKey: "weight",
      sortable: true,
      width: "80px",
      align: "center",
      cell: (value) => `${value} lbs`,
    },
    {
      id: "gpa",
      header: "GPA",
      accessorKey: "gpa",
      sortable: true,
      width: "80px",
      align: "center",
      cell: (value) => Number(value).toFixed(1),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "active",
      width: "100px",
      align: "center",
      cell: (value) => (
        <span
          className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }
        `}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // Table selection state
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <DevHealthCheck />

        {/* Navigation Bar */}
        <NavBar
          items={navItems}
          brand={
            <div className="flex items-center space-x-3">
              <Typography variant="headline-md" as="h1" color="primary">
                🏈 BoxCall
              </Typography>
              <Typography
                variant="caption"
                color="muted"
                className="hidden sm:block"
              >
                Professional Football Management Platform
              </Typography>
            </div>
          }
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                Menu
              </Button>
              <Button variant="outline" size="sm" onClick={handleThemeToggle}>
                Theme: {theme}
              </Button>
            </div>
          }
          sticky={true}
        />

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={toggleSidebar}
          items={sidebarItems}
          header={
            <div>
              <Typography variant="headline-md" color="primary">
                🏈 Navigation
              </Typography>
              <Typography variant="caption" color="muted">
                Team Management
              </Typography>
            </div>
          }
          footer={
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                📊 Quick Stats
              </Button>
              <Button variant="ghost" size="sm" className="w-full">
                ⚙️ Settings
              </Button>
            </div>
          }
          width="md"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <Typography
                variant="headline-md"
                as="h2"
                className="mb-4 text-gray-900 dark:text-white font-semibold"
              >
                Breadcrumb Navigation
              </Typography>

              <div className="space-y-4">
                <div>
                  <Typography variant="body-sm" color="muted" className="mb-2">
                    Standard Breadcrumb:
                  </Typography>
                  <Breadcrumb items={breadcrumbItems} />
                </div>

                <div>
                  <Typography variant="body-sm" color="muted" className="mb-2">
                    Small Size (max 3 items):
                  </Typography>
                  <Breadcrumb items={breadcrumbItems} size="sm" maxItems={3} />
                </div>

                <div>
                  <Typography variant="body-sm" color="muted" className="mb-2">
                    Large Size without Icons:
                  </Typography>
                  <Breadcrumb
                    items={breadcrumbItems}
                    size="lg"
                    showIcons={false}
                    separator="→"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Design System Showcase */}
          <section className="mb-12">
            <Typography
              variant="headline-lg"
              className="mb-6"
              color={theme === "dark" ? "inverse" : "primary"}
            >
              🎨 Design System Foundation
            </Typography>

            {/* Typography Showcase */}
            <div
              className={`rounded-lg p-6 shadow-sm mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            >
              <Typography
                variant="headline-md"
                className="mb-4"
                color={theme === "dark" ? "inverse" : "primary"}
              >
                Typography System
              </Typography>

              <div className="space-y-3">
                <Typography
                  variant="headline-xl"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  Headline XL - Major Page Headers
                </Typography>
                <Typography
                  variant="headline-lg"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  Headline LG - Section Headers
                </Typography>
                <Typography
                  variant="headline-md"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  Headline MD - Subsection Headers
                </Typography>
                <Typography
                  variant="headline-sm"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  Headline SM - Component Headers
                </Typography>
                <Typography
                  variant="body-lg"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  Body LG - Large body text for emphasis
                </Typography>
                <Typography
                  variant="body-md"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  Body MD - Standard body text for content
                </Typography>
                <Typography
                  variant="body-sm"
                  color={theme === "dark" ? "inverse" : "secondary"}
                >
                  Body SM - Secondary body text
                </Typography>
                <Typography
                  variant="body-xs"
                  color={theme === "dark" ? "inverse" : "secondary"}
                >
                  Body XS - Small body text
                </Typography>
                <Typography
                  variant="label-lg"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  LABEL LG - Form labels
                </Typography>
                <Typography
                  variant="label-md"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  LABEL MD - Small labels
                </Typography>
                <Typography
                  variant="button"
                  color={theme === "dark" ? "inverse" : "primary"}
                >
                  Button Text - UI Elements
                </Typography>
                <Typography variant="caption" color="muted">
                  Caption - Supplementary information
                </Typography>
              </div>
            </div>

            {/* Button Showcase */}

            {/* Button Showcase */}
            <div
              className={`rounded-lg p-6 shadow-sm mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            >
              <Typography
                variant="headline-md"
                className="mb-4"
                color={theme === "dark" ? "inverse" : "primary"}
              >
                Button System
              </Typography>

              <div className="space-y-6">
                {/* Primary Buttons */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    Primary Actions
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" size="lg">
                      Start Game
                    </Button>
                    <Button variant="primary" size="md">
                      Submit Play
                    </Button>
                    <Button variant="primary" size="sm">
                      Quick Action
                    </Button>
                  </div>
                </div>

                {/* Secondary Buttons */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    Secondary Actions
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary">View Stats</Button>
                    <Button variant="outline">Edit Formation</Button>
                    <Button variant="ghost">Cancel</Button>
                  </div>
                </div>

                {/* State Buttons */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    State Variants
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="success">Touchdown!</Button>
                    <Button variant="warning">Flag on Play</Button>
                    <Button variant="danger">Turnover</Button>
                    <Button variant="outline">Game Info</Button>
                  </div>
                </div>

                {/* Loading States */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    Loading States
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" loading>
                      Processing Play...
                    </Button>
                    <Button variant="secondary" loading>
                      Loading Stats...
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Components Showcase */}
            <div
              className={`rounded-lg p-6 shadow-sm mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            >
              <Typography
                variant="headline-md"
                className="mb-4"
                color={theme === "dark" ? "inverse" : "primary"}
              >
                Input & Form Components
              </Typography>

              <div className="space-y-6">
                {/* Text Inputs */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    Text Inputs
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Player Name"
                      placeholder="Enter player name"
                      helperText="First and last name required"
                      required
                    />
                    <Input
                      variant="email"
                      label="Email Address"
                      placeholder="coach@example.com"
                      status="success"
                      successMessage="Valid email format"
                    />
                    <Input
                      variant="password"
                      label="Password"
                      placeholder="Enter password"
                      status="error"
                      errorMessage="Password must be at least 8 characters"
                      showPasswordToggle
                    />
                    <Input
                      variant="number"
                      label="Jersey Number"
                      placeholder="1-99"
                      status="warning"
                      warningMessage="Number 23 is already taken"
                    />
                  </div>
                </div>

                {/* TextArea */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    Text Areas
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextArea
                      label="Play Notes"
                      placeholder="Describe the play strategy..."
                      autoResize
                      showCharacterCount
                      maxLength={500}
                      helperText="Add detailed notes about this play"
                    />
                    <TextArea
                      label="Game Summary"
                      placeholder="Write game summary..."
                      rows={4}
                      showCharacterCount
                      status="success"
                      successMessage="Summary saved successfully"
                    />
                  </div>
                </div>

                {/* Select Components */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    Select Components
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Player Position"
                      placeholder="Select position..."
                      options={[
                        { value: "QB", label: "Quarterback" },
                        { value: "RB", label: "Running Back" },
                        { value: "WR", label: "Wide Receiver" },
                        { value: "TE", label: "Tight End" },
                        { value: "OL", label: "Offensive Line" },
                        { value: "DL", label: "Defensive Line" },
                        { value: "LB", label: "Linebacker" },
                        { value: "DB", label: "Defensive Back" },
                        { value: "K", label: "Kicker" },
                        { value: "P", label: "Punter" },
                      ]}
                      searchable
                      clearable
                      helperText="Choose the player's primary position"
                    />
                    <Select
                      label="Formation Type"
                      placeholder="Select formation..."
                      options={[
                        {
                          value: "I-formation",
                          label: "I-Formation",
                          description: "Traditional power running formation",
                        },
                        {
                          value: "shotgun",
                          label: "Shotgun",
                          description: "Quarterback stands back from center",
                        },
                        {
                          value: "pistol",
                          label: "Pistol",
                          description:
                            "Hybrid between shotgun and under center",
                        },
                        {
                          value: "spread",
                          label: "Spread",
                          description: "Wide receiver spacing formation",
                        },
                        {
                          value: "west-coast",
                          label: "West Coast",
                          description: "Short passing game formation",
                        },
                      ]}
                      status="success"
                      successMessage="Formation selected successfully"
                    />
                    <Select
                      label="Team Players"
                      placeholder="Select multiple players..."
                      options={[
                        {
                          value: "player1",
                          label: "Mike Johnson (#12)",
                          description: "Quarterback, Senior",
                        },
                        {
                          value: "player2",
                          label: "David Smith (#22)",
                          description: "Running Back, Junior",
                        },
                        {
                          value: "player3",
                          label: "Chris Brown (#88)",
                          description: "Wide Receiver, Sophomore",
                        },
                        {
                          value: "player4",
                          label: "Alex Wilson (#44)",
                          description: "Linebacker, Senior",
                        },
                        {
                          value: "player5",
                          label: "Sam Davis (#7)",
                          description: "Safety, Junior",
                        },
                      ]}
                      multiple
                      searchable
                      clearable
                      helperText="Select players for the play"
                    />
                    <Select
                      label="Play Category"
                      placeholder="Select category..."
                      options={[
                        { value: "run", label: "Running Plays" },
                        { value: "pass", label: "Passing Plays" },
                        { value: "special", label: "Special Teams" },
                        { value: "trick", label: "Trick Plays" },
                      ]}
                      status="error"
                      errorMessage="Please select a play category"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Components Showcase */}
            <div
              className={`rounded-lg p-6 shadow-sm mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            >
              <Typography
                variant="headline-md"
                className="mb-4"
                color={theme === "dark" ? "inverse" : "primary"}
              >
                Card Components
              </Typography>

              <div className="space-y-6">
                {/* Card Variants */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    Card Variants
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="default">
                      <Typography variant="headline-sm" className="mb-2">
                        Default Card
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        Standard card with border and background
                      </Typography>
                    </Card>

                    <Card variant="elevated">
                      <Typography variant="headline-sm" className="mb-2">
                        Elevated Card
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        Card with shadow for emphasis
                      </Typography>
                    </Card>

                    <Card variant="outlined">
                      <Typography variant="headline-sm" className="mb-2">
                        Outlined Card
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        Card with border only
                      </Typography>
                    </Card>

                    <Card variant="filled">
                      <Typography variant="headline-sm" className="mb-2">
                        Filled Card
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        Card with filled background
                      </Typography>
                    </Card>
                  </div>
                </div>

                {/* Interactive Cards */}
                <div>
                  <Typography
                    variant="label-lg"
                    className="mb-3"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    Interactive Cards
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                      variant="elevated"
                      interactive
                      onClick={() => alert("Offense playbook clicked!")}
                      header={
                        <div className="flex items-center justify-between">
                          <Typography variant="headline-sm">
                            🏈 Offense
                          </Typography>
                          <Typography variant="body-xs" color="success">
                            24 Plays
                          </Typography>
                        </div>
                      }
                      footer={
                        <Button variant="outline" size="sm" className="w-full">
                          View Playbook
                        </Button>
                      }
                    >
                      <Typography variant="body-sm" color="muted">
                        Complete offensive playbook with formations and routes
                      </Typography>
                    </Card>

                    <Card
                      variant="elevated"
                      interactive
                      onClick={() => alert("Defense playbook clicked!")}
                      header={
                        <div className="flex items-center justify-between">
                          <Typography variant="headline-sm">
                            🛡️ Defense
                          </Typography>
                          <Typography variant="body-xs" color="warning">
                            18 Plays
                          </Typography>
                        </div>
                      }
                      footer={
                        <Button variant="outline" size="sm" className="w-full">
                          View Playbook
                        </Button>
                      }
                    >
                      <Typography variant="body-sm" color="muted">
                        Defensive schemes and coverage packages
                      </Typography>
                    </Card>

                    <Card
                      variant="elevated"
                      interactive
                      onClick={() => alert("Special teams clicked!")}
                      header={
                        <div className="flex items-center justify-between">
                          <Typography variant="headline-sm">
                            ⚡ Special Teams
                          </Typography>
                          <Typography variant="body-xs" color="primary">
                            12 Plays
                          </Typography>
                        </div>
                      }
                      footer={
                        <Button variant="outline" size="sm" className="w-full">
                          View Playbook
                        </Button>
                      }
                    >
                      <Typography variant="body-sm" color="muted">
                        Kicking game and special situations
                      </Typography>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Application Status */}
          <section className="mb-8">
            <div
              className={`rounded-lg p-6 shadow-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            >
              <Typography
                variant="headline-md"
                className="mb-4"
                color={theme === "dark" ? "inverse" : "primary"}
              >
                🏟️ Application Status
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
                >
                  <Typography
                    variant="label-lg"
                    className="mb-2"
                    color="success"
                  >
                    SYSTEM STATUS
                  </Typography>
                  <Typography
                    variant="body-lg"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    ✅ All Systems Operational
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    React 19 + TypeScript + Vite
                  </Typography>
                </div>

                <div
                  className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
                >
                  <Typography
                    variant="label-lg"
                    className="mb-2"
                    color="warning"
                  >
                    THEME MODE
                  </Typography>
                  <Typography
                    variant="body-lg"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    🌙 {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    Professional UI Theme
                  </Typography>
                </div>

                <div
                  className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
                >
                  <Typography
                    variant="label-lg"
                    className="mb-2"
                    color="primary"
                  >
                    ENVIRONMENT
                  </Typography>
                  <Typography
                    variant="body-lg"
                    color={theme === "dark" ? "inverse" : "primary"}
                  >
                    🛠️ Development
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    Hot Reload Active
                  </Typography>
                </div>
              </div>
            </div>
          </section>

          {/* Table Showcase */}
          <section className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <Typography
                variant="headline-md"
                as="h2"
                className="mb-4 text-gray-900 dark:text-white font-semibold"
              >
                Table Component
              </Typography>

              <Typography variant="body-md" color="muted" className="mb-6">
                Professional data tables with sorting, filtering, selection, and
                pagination. Perfect for team rosters, player stats, and game
                schedules.
              </Typography>

              <div className="space-y-8">
                {/* Basic Table */}
                <div>
                  <Typography variant="body-md" className="mb-4 font-medium">
                    📊 Team Roster - Interactive Data Table
                  </Typography>
                  <Table
                    columns={playerColumns}
                    data={playerData}
                    selectable={true}
                    selectedRows={selectedPlayers}
                    onSelectionChange={setSelectedPlayers}
                    pagination={true}
                    pageSize={5}
                    size="md"
                    striped={true}
                    bordered={true}
                    emptyMessage="No players found"
                  />
                </div>

                {/* Compact Table */}
                <div>
                  <Typography variant="body-md" className="mb-4 font-medium">
                    📋 Compact View - Small Size
                  </Typography>
                  <Table
                    columns={playerColumns.slice(0, 5)}
                    data={playerData.slice(0, 4)}
                    size="sm"
                    striped={false}
                    bordered={false}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Authentication Showcase */}
          <section className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <Typography
                variant="headline-md"
                as="h2"
                className="mb-4 text-gray-900 dark:text-white font-semibold"
              >
                Authentication System
              </Typography>

              <Typography variant="body-md" color="muted" className="mb-6">
                Complete authentication flows ready for Supabase integration.
                Includes login, signup, and password reset forms with
                validation.
              </Typography>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Login Form */}
                <div>
                  <Typography variant="body-md" className="mb-4 font-medium">
                    🔐 Login Form
                  </Typography>
                  <Auth
                    mode="login"
                    onLogin={(data) => {
                      console.log("Login attempt:", data);
                      alert(`Login: ${data.email}`);
                    }}
                    variant="card"
                  />
                </div>

                {/* Signup Form */}
                <div>
                  <Typography variant="body-md" className="mb-4 font-medium">
                    📝 Signup Form
                  </Typography>
                  <Auth
                    mode="signup"
                    onSignup={(data) => {
                      console.log("Signup attempt:", data);
                      alert(`Signup: ${data.email} as ${data.role}`);
                    }}
                    variant="card"
                  />
                </div>

                {/* Password Reset Form */}
                <div>
                  <Typography variant="body-md" className="mb-4 font-medium">
                    🔄 Password Reset
                  </Typography>
                  <Auth
                    mode="reset"
                    onResetPassword={(data) => {
                      console.log("Reset attempt:", data);
                      alert(`Reset password for: ${data.email}`);
                    }}
                    variant="card"
                  />
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-gray-600">
                <Typography
                  variant="body-sm"
                  className="text-blue-800 dark:text-blue-200"
                >
                  <strong>🚀 Supabase Ready:</strong> These forms are designed
                  to integrate seamlessly with your existing Supabase
                  authentication setup. Simply connect the onLogin, onSignup,
                  and onResetPassword handlers to your Supabase auth methods.
                </Typography>
              </div>
            </div>
          </section>

          {/* Modal Showcase */}
          <section>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <Typography
                variant="headline-md"
                as="h2"
                className="mb-4 text-gray-900 dark:text-white font-semibold"
              >
                Modal System
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button
                  variant="primary"
                  onClick={() => setIsDefaultModalOpen(true)}
                  className="w-full"
                >
                  Open Default Modal
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsAlertModalOpen(true)}
                  className="w-full"
                >
                  Open Alert Modal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="w-full"
                >
                  Open Confirm Modal
                </Button>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div
              className={`rounded-lg p-6 shadow-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            >
              <Typography
                variant="headline-md"
                className="mb-4"
                color={theme === "dark" ? "inverse" : "primary"}
              >
                🎮 Quick Actions
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="primary" className="w-full">
                  🏈 New Game
                </Button>
                <Button variant="secondary" className="w-full">
                  📊 View Analytics
                </Button>
                <Button variant="outline" className="w-full">
                  👥 Manage Team
                </Button>
                <Button variant="ghost" className="w-full">
                  ⚙️ Settings
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Modals */}
        <Modal
          isOpen={isDefaultModalOpen}
          onClose={() => setIsDefaultModalOpen(false)}
          title="Default Modal"
          size="md"
        >
          <Typography variant="body-md" className="mb-4">
            This is a standard modal dialog. You can include any content here.
          </Typography>
          <Typography variant="body-sm" color="muted">
            Click the backdrop or press Escape to close.
          </Typography>
        </Modal>

        <Modal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          title="Alert Dialog"
          type="alert"
          size="sm"
          footer={
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsAlertModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsAlertModalOpen(false)}
              >
                Confirm
              </Button>
            </div>
          }
        >
          <Typography variant="body-md">
            This is an alert modal. Are you sure you want to proceed with this
            action?
          </Typography>
        </Modal>

        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirmation Required"
          type="confirm"
          size="lg"
          footer={
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Publish
              </Button>
            </div>
          }
        >
          <Typography variant="body-md" className="mb-4">
            You have unsaved changes. What would you like to do?
          </Typography>
          <Typography variant="body-sm" color="muted">
            Your changes will be lost if you don't save them.
          </Typography>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}

export default App;
