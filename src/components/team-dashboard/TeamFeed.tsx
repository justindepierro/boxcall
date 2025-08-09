import React, { useState, useRef, useEffect } from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import { OnboardingHint } from "../onboarding/OnboardingHint";
import { useTeamPosts, useCreatePost, usePinPost } from "../../hooks/teamDataHooks";
import { Capability, getCapabilitiesForRole, hasCapability } from "../../services/capabilities/capabilityMap";
import { Button } from "../ui/Button/Button";
import { Modal } from "../ui/Modal/Modal";
import { TextArea } from "../ui/TextArea";
import { useToast } from "../../hooks/useToast";

interface TeamFeedProps {
  teamId: string;
  userRole: string;
}

export const TeamFeed: React.FC<TeamFeedProps> = ({ teamId, userRole }) => {
  const { data: posts = [], isLoading } = useTeamPosts(teamId);
  const { mutateAsync: createPost, isPending: creating } = useCreatePost(teamId);
  const { mutate: pinMutate } = usePinPost(teamId);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const toast = useToast();
  const caps = getCapabilitiesForRole(userRole);
  const canCreate = hasCapability(caps, Capability.CREATE_POST);
  const canPin = hasCapability(caps, Capability.PIN_POST);

  useEffect(() => {
    if (!open && triggerRef.current) triggerRef.current.focus();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createPost(content.trim());
      toast.success("Post created");
      setOpen(false);
      setContent("");
    } catch (e) {
      toast.error("Failed to create post", (e as Error).message);
    }
  }

  function togglePin(id: string, current: boolean | null) {
    pinMutate({ postId: id, pin: !current });
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setOpen(true)}
            ref={triggerRef}
          >
            <Icon name="plus" size="sm" /> New Post
          </Button>
        )}
        <OnboardingHint
          icon="message"
          title="Team Feed"
          message="Announcements, practice scripts, and achievements will appear here once you begin posting."
          steps={[
            "Click New Post (coach roles)",
            "Share schedule or practice focus",
            "Attach scripts or files (roadmap)",
          ]}
          actions={
            canCreate
              ? [
                  {
                    label: "Plan First Post",
                    variant: "primary",
                    onClick: () => setOpen(true),
                  },
                ]
              : [
                  {
                    label: "View Roadmap",
                    variant: "ghost",
                    onClick: () =>
                      console.log("telemetry:onboarding.feed.view_roadmap"),
                  },
                ]
          }
        />
        {open && (
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Create Post"
          >
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="post-content">
                  Announcement
                </label>
                <TextArea
                  id="post-content"
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                  placeholder="Practice moved to 6:30 PM – arrive early for warmups."
                  required
                  rows={5}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? "Posting..." : "Publish"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-label="Team feed">
      <div className="flex items-center justify-between">
        <Typography variant="headline-md" className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Icon name="message" size="md" /> Team Feed
        </Typography>
        {canCreate && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setOpen(true)}
            ref={triggerRef}
          >
            <Icon name="plus" size="sm" /> New Post
          </Button>
        )}
      </div>
      {open && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Post">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="post-content-inline">Announcement</label>
              <TextArea
                id="post-content-inline"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="Game film uploaded. Review by Friday."
                required
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={creating}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={creating}>{creating ? "Posting..." : "Publish"}</Button>
            </div>
          </form>
        </Modal>
      )}
      {isLoading && <div className="text-sm text-gray-500">Loading posts...</div>}
      <ul className="space-y-3">
        {posts.map(p => (
          <li key={p.id} className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{p.content}</p>
              {canPin && (
                <button
                  onClick={() => togglePin(p.id, !!p.is_pinned)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${p.is_pinned ? "bg-amber-200 dark:bg-amber-600/30 border-amber-300 dark:border-amber-500 text-amber-800 dark:text-amber-200" : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
                  aria-pressed={!!p.is_pinned}
                  aria-label={p.is_pinned ? "Unpin post" : "Pin post"}
                >
                  {p.is_pinned ? "Pinned" : "Pin"}
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{p.created_at ? new Date(p.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
              {p.is_pinned && <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300"><Icon name="star" size="sm" />Pinned</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
