/**
 * Touch Experience Demo - Phase 3C Implementation
 * Demonstrates professional touch interactions and mobile UX patterns
 */
import React, { useState, useCallback } from "react";
import {
  Star,
  MessageCircle,
  Settings,
  Search,
  Plus,
  Heart,
  Share2,
  Trash2,
  Edit3,
  RefreshCw,
} from "lucide-react";
import { Typography } from "./design-system/Typography";
import { TouchFeedback } from "./ui/TouchFeedback";
import {
  PullToRefresh,
  SwipeableItem,
  LongPressMenu,
} from "./ui/AdvancedGestures";
import {
  MobileListItem,
  MobileButtonGroup,
  MobileSearchInput,
  MobileBottomSheet,
  MobileFAB,
} from "./ui/MobileEnhanced";
import { HapticPatterns } from "../utils/touchUtils";

interface PlayItem {
  id: string;
  name: string;
  formation: string;
  category: string;
  favorite: boolean;
}

const TouchExperienceDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("offense");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<PlayItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [plays, setPlays] = useState<PlayItem[]>([
    {
      id: "1",
      name: "Quick Slant",
      formation: "I-Formation",
      category: "offense",
      favorite: true,
    },
    {
      id: "2",
      name: "Power Run",
      formation: "Singleback",
      category: "offense",
      favorite: false,
    },
    {
      id: "3",
      name: "Cover 2",
      formation: "4-3",
      category: "defense",
      favorite: true,
    },
    {
      id: "4",
      name: "Blitz Package",
      formation: "Nickel",
      category: "defense",
      favorite: false,
    },
    {
      id: "5",
      name: "Field Goal Block",
      formation: "Special",
      category: "special",
      favorite: false,
    },
  ]);

  const categories = [
    { id: "offense", label: "Offense", icon: <Star className="h-4 w-4" /> },
    {
      id: "defense",
      label: "Defense",
      icon: <MessageCircle className="h-4 w-4" />,
    },
    { id: "special", label: "Special", icon: <Settings className="h-4 w-4" /> },
  ];

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    HapticPatterns.medium();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update plays with new data simulation
    setPlays((prev) => [
      {
        id: Date.now().toString(),
        name: "New Play",
        formation: "Pistol",
        category: selectedCategory,
        favorite: false,
      },
      ...prev,
    ]);

    setIsRefreshing(false);
    HapticPatterns.success();
  }, [selectedCategory]);

  // Swipe actions
  const getSwipeActions = (play: PlayItem) => ({
    leftActions: [
      {
        label: "Favorite",
        icon: <Heart className="h-4 w-4" />,
        color: "red" as const,
        action: () => {
          setPlays((prev) =>
            prev.map((p) =>
              p.id === play.id ? { ...p, favorite: !p.favorite } : p
            )
          );
          HapticPatterns.success();
        },
      },
      {
        label: "Share",
        icon: <Share2 className="h-4 w-4" />,
        color: "blue" as const,
        action: () => {
          console.log("Sharing play:", play.name);
          HapticPatterns.light();
        },
      },
    ],
    rightActions: [
      {
        label: "Edit",
        icon: <Edit3 className="h-4 w-4" />,
        color: "yellow" as const,
        action: () => {
          setSelectedPlay(play);
          setIsBottomSheetOpen(true);
          HapticPatterns.medium();
        },
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        color: "red" as const,
        action: () => {
          setPlays((prev) => prev.filter((p) => p.id !== play.id));
          HapticPatterns.error();
        },
      },
    ],
  });

  // Long press menu items
  const getLongPressMenuItems = (play: PlayItem) => [
    {
      label: "View Details",
      icon: <Search className="h-4 w-4" />,
      action: () => {
        setSelectedPlay(play);
        setIsBottomSheetOpen(true);
      },
    },
    {
      label: play.favorite ? "Remove from Favorites" : "Add to Favorites",
      icon: <Heart className="h-4 w-4" />,
      action: () => {
        setPlays((prev) =>
          prev.map((p) =>
            p.id === play.id ? { ...p, favorite: !p.favorite } : p
          )
        );
      },
    },
    {
      label: "Share Play",
      icon: <Share2 className="h-4 w-4" />,
      action: () => console.log("Sharing play:", play.name),
    },
    {
      label: "Delete Play",
      icon: <Trash2 className="h-4 w-4" />,
      destructive: true,
      action: () => {
        setPlays((prev) => prev.filter((p) => p.id !== play.id));
      },
    },
  ];

  // Filter plays
  const filteredPlays = plays.filter((play) => {
    const matchesCategory = play.category === selectedCategory;
    const matchesSearch =
      play.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      play.formation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header with search */}
      <div className="bg-white shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="headline-lg" className="text-gray-900">
            Touch Experience Demo
          </Typography>
          <TouchFeedback
            ripple
            className="p-2 rounded-full bg-gray-100"
            onPress={() => HapticPatterns.light()}
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </TouchFeedback>
        </div>

        <MobileSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search plays..."
          className="mb-4"
        />

        <MobileButtonGroup
          options={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Scrollable play list with pull-to-refresh */}
      <PullToRefresh
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        className="flex-1"
      >
        <div className="space-y-2 p-4">
          {filteredPlays.length === 0 ? (
            <div className="text-center py-12">
              <Typography variant="body-md" className="text-gray-500">
                No plays found. Try adjusting your search or category.
              </Typography>
            </div>
          ) : (
            filteredPlays.map((play) => (
              <SwipeableItem
                key={play.id}
                {...getSwipeActions(play)}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <LongPressMenu items={getLongPressMenuItems(play)}>
                  <MobileListItem
                    title={play.name}
                    subtitle={`${play.formation} • ${play.category}`}
                    leading={
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          play.favorite ? "bg-red-100" : "bg-gray-100"
                        }`}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            play.favorite
                              ? "text-red-500 fill-current"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    }
                    trailing={
                      <Typography variant="body-sm" className="text-gray-400">
                        Swipe
                      </Typography>
                    }
                    onClick={() => {
                      setSelectedPlay(play);
                      setIsBottomSheetOpen(true);
                    }}
                  />
                </LongPressMenu>
              </SwipeableItem>
            ))
          )}
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <MobileFAB
        icon={<Plus className="h-6 w-6" />}
        onClick={() => {
          setSelectedPlay(null);
          setIsBottomSheetOpen(true);
        }}
        position="bottom-right"
      />

      {/* Bottom Sheet Modal */}
      <MobileBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title={selectedPlay ? `Edit ${selectedPlay.name}` : "Create New Play"}
        height="half"
      >
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <TouchFeedback
              className="p-4 bg-team-primary/10 rounded-lg text-center"
              onPress={() => HapticPatterns.light()}
            >
              <Typography
                variant="body-md"
                className="text-team-primary font-medium"
              >
                Quick Edit
              </Typography>
            </TouchFeedback>

            <TouchFeedback
              className="p-4 bg-gray-100 rounded-lg text-center"
              onPress={() => HapticPatterns.light()}
            >
              <Typography
                variant="body-md"
                className="text-gray-700 font-medium"
              >
                Full Editor
              </Typography>
            </TouchFeedback>
          </div>

          <div className="space-y-4">
            <div>
              <Typography variant="label-md" className="text-gray-700 mb-2">
                Formation
              </Typography>
              <MobileButtonGroup
                options={[
                  { id: "i-form", label: "I-Formation" },
                  { id: "singleback", label: "Singleback" },
                  { id: "shotgun", label: "Shotgun" },
                ]}
                selected="i-form"
                onSelect={(id) => console.log("Selected formation:", id)}
              />
            </div>

            <div className="flex space-x-4">
              <TouchFeedback
                className="flex-1 py-3 bg-red-500 text-white rounded-lg text-center"
                onPress={() => {
                  setIsBottomSheetOpen(false);
                  HapticPatterns.light();
                }}
              >
                <Typography variant="button" className="text-white">
                  Cancel
                </Typography>
              </TouchFeedback>

              <TouchFeedback
                className="flex-1 py-3 bg-team-primary text-white rounded-lg text-center"
                onPress={() => {
                  setIsBottomSheetOpen(false);
                  HapticPatterns.success();
                }}
              >
                <Typography variant="button" className="text-white">
                  Save Play
                </Typography>
              </TouchFeedback>
            </div>
          </div>
        </div>
      </MobileBottomSheet>

      {/* Instructions */}
      <div className="bg-gray-100 p-4 border-t">
        <Typography variant="body-sm" className="text-gray-600 text-center">
          Try: Pull to refresh • Swipe plays • Long press • Tap FAB
        </Typography>
      </div>
    </div>
  );
};

export default TouchExperienceDemo;
