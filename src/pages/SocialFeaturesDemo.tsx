// Social Features Demo Page
// Showcases all social features working together

import React from "react";
import { ReactionButton } from "../components/social/ReactionButton";
import { FollowButton } from "../components/social/FollowButton";
import { CommentSection } from "../components/social/CommentSection";
import { NotificationsBell } from "../components/social/NotificationsBell";
import { ActivityFeed } from "../components/social/ActivityFeed";

const SocialFeaturesDemo: React.FC = () => {
  // Demo content IDs - in a real app these would come from your data
  const demoPlayId = "demo-play-123";
  const demoTeamId = "demo-team-456";
  const demoUserId = "demo-user-789";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center relative">
        <div className="absolute top-0 right-0">
          <NotificationsBell userId={demoUserId} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Social Features Demo
        </h1>
        <p className="text-gray-600">
          Experience the new social interactions in BoxCall
        </p>
      </div>

      {/* Demo Play Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Triple Option Play
            </h2>
            <p className="text-gray-600 mt-1">
              A classic triple option with multiple read options for the QB.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ReactionButton
              contentType="play"
              contentId={demoPlayId}
              size="md"
              variant="button"
            />
            <FollowButton
              followingType="team"
              followingId={demoTeamId}
              variant="button"
              size="md"
            />
          </div>
        </div>

        {/* Play visualization placeholder */}
        <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
          <span className="text-gray-500">Play Diagram Would Go Here</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Formation: Shotgun</span>
          <span>Personnel: 11 Personnel</span>
          <span>Play Type: Run</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h3>
        <CommentSection
          contentType="play"
          contentId={demoPlayId}
          maxDepth={3}
          showReactions={true}
        />
      </div>

      {/* Team Profile Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">BC</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                BoxCall High School
              </h3>
              <p className="text-gray-600">Varsity Football Team • Est. 2024</p>
            </div>
          </div>
          <FollowButton
            followingType="team"
            followingId={demoTeamId}
            variant="button"
            size="lg"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">156</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-sm text-gray-600">Plays</div>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">JD</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">John Doe</h3>
              <p className="text-gray-600">Head Coach • BoxCall High School</p>
            </div>
          </div>
          <FollowButton
            followingType="user"
            followingId={demoUserId}
            variant="button"
            size="md"
          />
        </div>

        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <span>42 followers</span>
          <span>156 plays created</span>
          <span>23 game plans</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <ActivityFeed limit={10} />
      </div>

      {/* Feature Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          ✨ New Social Features
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Reactions</h4>
            <p className="text-gray-600 text-sm">
              Express yourself with likes, loves, laughs, and more on plays,
              comments, and content.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Follow System</h4>
            <p className="text-gray-600 text-sm">
              Follow your favorite teams, coaches, and players to stay updated
              on their activity.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Comments & Discussion
            </h4>
            <p className="text-gray-600 text-sm">
              Engage in meaningful discussions with threaded comments and
              replies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">@Mentions</h4>
            <p className="text-gray-600 text-sm">
              Tag other users in comments to notify them and create engaging
              conversations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Notifications</h4>
            <p className="text-gray-600 text-sm">
              Stay informed with real-time notifications for reactions, follows,
              mentions, and more.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Activity Feed</h4>
            <p className="text-gray-600 text-sm">
              Stay connected with a personalized feed of social activity from
              people you follow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeaturesDemo;
