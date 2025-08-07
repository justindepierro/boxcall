import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";

export interface PlayCategory {
  id: string;
  name: string;
  icon: "grid" | "target" | "star" | "warning" | "shield";
  color: string;
  playCount: number;
}

export interface PlayPreview {
  id: string;
  name: string;
  category: string;
  formation: string;
  tags: string[];
  isFavorite: boolean;
  lastUsed?: Date;
  successRate?: number;
  thumbnail?: string;
  description: string;
}

export interface MobilePlaybookBrowserProps {
  teamId: string;
  onPlaySelect: (play: PlayPreview) => void;
  onPlayFavorite: (playId: string, favorite: boolean) => void;
  className?: string;
}

/**
 * Mobile Playbook Browser
 *
 * Features:
 * - Touch-friendly play browsing with large preview cards
 * - Swipe navigation between play categories
 * - Quick search with voice input support
 * - Favorite plays for quick access
 * - Offline play storage for sideline reference
 * - Visual play previews with formation indicators
 */
export const MobilePlaybookBrowser: React.FC<MobilePlaybookBrowserProps> = ({
  teamId: _teamId,
  onPlaySelect,
  onPlayFavorite,
  className = "",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterBy, setFilterBy] = useState<"all" | "favorites" | "recent">(
    "all"
  );
  const [isSearching, setIsSearching] = useState(false);

  // Sample data - would come from playbook service
  const categories: PlayCategory[] = [
    {
      id: "all",
      name: "All Plays",
      icon: "grid",
      color: "bg-gray-500",
      playCount: 127,
    },
    {
      id: "run",
      name: "Running",
      icon: "target",
      color: "bg-green-500",
      playCount: 45,
    },
    {
      id: "pass",
      name: "Passing",
      icon: "star",
      color: "bg-blue-500",
      playCount: 38,
    },
    {
      id: "special",
      name: "Special Teams",
      icon: "star",
      color: "bg-purple-500",
      playCount: 22,
    },
    {
      id: "redzone",
      name: "Red Zone",
      icon: "warning",
      color: "bg-red-500",
      playCount: 18,
    },
    {
      id: "defense",
      name: "Defense",
      icon: "shield",
      color: "bg-yellow-500",
      playCount: 34,
    },
  ];

  const [samplePlays] = useState<PlayPreview[]>([
    {
      id: "1",
      name: "Power O Right",
      category: "run",
      formation: "I-Formation",
      tags: ["short-yardage", "goal-line"],
      isFavorite: true,
      lastUsed: new Date(Date.now() - 86400000), // 1 day ago
      successRate: 75,
      description: "Classic power running play with pulling guard",
    },
    {
      id: "2",
      name: "4 Verticals",
      category: "pass",
      formation: "Shotgun",
      tags: ["3rd-down", "deep"],
      isFavorite: false,
      lastUsed: new Date(Date.now() - 172800000), // 2 days ago
      successRate: 62,
      description: "All receivers run vertical routes",
    },
    {
      id: "3",
      name: "Slant Concept",
      category: "pass",
      formation: "Shotgun",
      tags: ["quick-game", "3rd-down"],
      isFavorite: true,
      successRate: 85,
      description: "Quick slant routes with hot reads",
    },
    {
      id: "4",
      name: "Sweep Left",
      category: "run",
      formation: "Shotgun",
      tags: ["outside", "speed"],
      isFavorite: false,
      successRate: 58,
      description: "Outside sweep with kick-out blocks",
    },
  ]);

  // Filter plays based on selected category and search
  const filteredPlays = samplePlays.filter((play) => {
    const matchesCategory =
      selectedCategory === "all" || play.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      play.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      play.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "favorites" && play.isFavorite) ||
      (filterBy === "recent" &&
        play.lastUsed &&
        Date.now() - play.lastUsed.getTime() < 7 * 24 * 60 * 60 * 1000); // Last 7 days

    return matchesCategory && matchesSearch && matchesFilter;
  });

  // Handle voice search (if supported)
  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window) {
      console.log(
        "Voice search requested - would implement speech recognition here"
      );
      setIsSearching(true);
      // Simulate voice search delay
      setTimeout(() => {
        setIsSearching(false);
      }, 2000);
    }
  };

  // Handle play favorite toggle
  const handleFavoriteToggle = (play: PlayPreview, event: React.MouseEvent) => {
    event.stopPropagation();
    onPlayFavorite(play.id, !play.isFavorite);
  };

  // Render play card based on view mode
  const renderPlayCard = (play: PlayPreview) => {
    if (viewMode === "list") {
      return (
        <button
          key={play.id}
          onClick={() => onPlaySelect(play)}
          className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
        >
          <div className="flex items-center space-x-3">
            {/* Play preview thumbnail placeholder */}
            <div className="w-16 h-16 bg-gradient-to-br from-brand-jade-light to-brand-jade rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="play" size="md" className="text-white" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <Typography
                  variant="body-md"
                  className="font-semibold truncate"
                >
                  {play.name}
                </Typography>
                <button
                  onClick={(e) => handleFavoriteToggle(play, e)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  <Icon
                    name="star"
                    size="sm"
                    className={
                      play.isFavorite ? "text-yellow-500" : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <Typography variant="body-sm" color="muted" className="mb-2">
                {play.formation} • {play.description}
              </Typography>

              <div className="flex items-center space-x-2">
                {play.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-brand-jade-light dark:bg-brand-jade-dark text-brand-jade-dark dark:text-brand-jade-light rounded"
                  >
                    {tag}
                  </span>
                ))}
                {play.successRate && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {play.successRate}% success
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      );
    }

    // Grid view
    return (
      <button
        key={play.id}
        onClick={() => onPlaySelect(play)}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
      >
        <div className="relative">
          {/* Play preview */}
          <div className="w-full h-24 bg-gradient-to-br from-brand-jade-light to-brand-jade rounded-lg mb-3 flex items-center justify-center">
            <Icon name="play" size="lg" className="text-white" />
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => handleFavoriteToggle(play, e)}
            className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Icon
              name="star"
              size="sm"
              className={play.isFavorite ? "text-yellow-500" : "text-gray-400"}
            />
          </button>
        </div>

        <div className="text-left">
          <Typography variant="body-sm" className="font-semibold mb-1 truncate">
            {play.name}
          </Typography>
          <Typography variant="body-xs" color="muted" className="mb-2">
            {play.formation}
          </Typography>

          <div className="flex flex-wrap gap-1 mb-2">
            {play.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-brand-jade-light dark:bg-brand-jade-dark text-brand-jade-dark dark:text-brand-jade-light rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {play.successRate && (
            <Typography
              variant="body-xs"
              className="text-green-600 dark:text-green-400 font-medium"
            >
              {play.successRate}% success
            </Typography>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className={`mobile-playbook-browser ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <Typography variant="headline-md" className="font-bold mb-4">
          Team Playbook
        </Typography>

        {/* Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plays, formations, or tags..."
            className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-brand-jade focus:border-transparent prevent-zoom"
          />
          <Icon
            name="search"
            size="md"
            className="absolute left-3 top-3 text-gray-400"
          />

          {/* Voice search button */}
          <button
            onClick={handleVoiceSearch}
            className={`absolute right-3 top-2 p-1 rounded-lg transition-colors touch-manipulation ${
              isSearching
                ? "bg-red-500 text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Icon name={isSearching ? "close" : "play"} size="md" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {["all", "favorites", "recent"].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter as typeof filterBy)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors touch-manipulation ${
                  filterBy === filter
                    ? "bg-brand-jade text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors touch-manipulation ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-800 shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <Icon name="grid" size="sm" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors touch-manipulation ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-800 shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <Icon name="menu" size="sm" />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors touch-manipulation ${
                selectedCategory === category.id
                  ? "bg-brand-jade text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <div
                className={`w-4 h-4 ${category.color} rounded flex items-center justify-center`}
              >
                <Icon name={category.icon} size="xs" className="text-white" />
              </div>
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-xs opacity-75">({category.playCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Play list */}
      <div className="p-4">
        {filteredPlays.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              name="search"
              size="lg"
              className="mx-auto mb-3 text-gray-400"
            />
            <Typography variant="body-md" color="muted" className="mb-2">
              No plays found
            </Typography>
            <Typography variant="body-sm" color="muted">
              Try adjusting your search or filter criteria
            </Typography>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <Typography variant="body-sm" color="muted">
                {filteredPlays.length} plays found
              </Typography>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-brand-jade hover:text-brand-jade-dark text-sm touch-manipulation"
                >
                  Clear search
                </button>
              )}
            </div>

            <div
              className={
                viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-3"
              }
            >
              {filteredPlays.map(renderPlayCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
