import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Formation } from "../types/formation";
import { cdnService } from "../services/cdn/CDNService";
import { PersonnelService } from "../services/personnelService";
import { personnelKeys } from "./usePersonnel";
import { debug, warn } from "../utils/logger";

const FORMATION_THUMBNAIL_PREFETCH_LIMIT = 18;
const PERSONNEL_PREFETCH_PLAYBOOK_LIMIT = 3;

export interface PrefetchablePlayMedia {
  id: string;
  diagram_url?: string | null;
  diagram_image_url?: string | null;
}

interface PrefetchablePlaybook {
  id: string;
  play_count?: number | null;
}

interface UseTeamAssetPrefetchOptions {
  teamId?: string | null;
  formations: Formation[];
  playbooks: PrefetchablePlaybook[];
  plays: PrefetchablePlayMedia[];
}

interface FormationWithMedia extends Formation {
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  preview_image_url?: string | null;
  diagram_image_url?: string | null;
}

/**
 * Prefetches formation thumbnails and personnel data immediately after team selection.
 * Keeps Playbook interactions snappy by caching heavy assets before the user needs them.
 */
export function useTeamAssetPrefetch({
  teamId,
  formations,
  playbooks,
  plays,
}: UseTeamAssetPrefetchOptions) {
  const queryClient = useQueryClient();
  const prefetchedPlaybookIdsRef = useRef(new Set<string>());

  const prioritizedPlaybookIds = useMemo(() => {
    return [...playbooks]
      .sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0))
      .slice(0, PERSONNEL_PREFETCH_PLAYBOOK_LIMIT)
      .map((pb) => pb.id);
  }, [playbooks]);

  const thumbnailUrls = useMemo(() => {
    const urls = new Set<string>();

    formations.forEach((formation) => {
      const media = formation as FormationWithMedia;
      const candidate =
        media.thumbnail ||
        media.thumbnail_url ||
        media.preview_image_url ||
        media.preview_url ||
        media.diagram_image_url;
      if (candidate) {
        urls.add(candidate);
      }
    });

    plays.forEach((play) => {
      const diagramUrl = play.diagram_image_url || play.diagram_url;
      if (diagramUrl) {
        urls.add(diagramUrl);
      }
    });

    return Array.from(urls);
  }, [formations, plays]);

  useEffect(() => {
    if (!teamId || thumbnailUrls.length === 0) {
      return undefined;
    }
    if (typeof window === "undefined") {
      return undefined;
    }

    const toPrefetch = thumbnailUrls.slice(
      0,
      FORMATION_THUMBNAIL_PREFETCH_LIMIT
    );
    toPrefetch.forEach((url) => {
      try {
        if (url.startsWith("http") || url.startsWith("/")) {
          cdnService.prefetchAsset(url);
        } else {
          const img = new Image();
          img.decoding = "async";
          img.src = url;
        }
      } catch (error) {
        warn(
          `[useTeamAssetPrefetch] Failed to prefetch formation media from ${url}`,
          error
        );
      }
    });

    return undefined;
  }, [teamId, thumbnailUrls]);

  useEffect(() => {
    if (!teamId || prioritizedPlaybookIds.length === 0) {
      return undefined;
    }

    let cancelled = false;

    prioritizedPlaybookIds.forEach((playbookId) => {
      if (prefetchedPlaybookIdsRef.current.has(playbookId)) {
        return;
      }

      prefetchedPlaybookIdsRef.current.add(playbookId);

      PersonnelService.getPersonnelConfigurations(playbookId)
        .then((configs) => {
          if (cancelled) {
            return;
          }
          queryClient.setQueryData(
            personnelKeys.configurations(playbookId),
            configs
          );
          debug(
            `[useTeamAssetPrefetch] Primed personnel cache for playbook ${playbookId} (${configs.length} configs)`
          );
        })
        .catch((error) => {
          warn(
            `[useTeamAssetPrefetch] Failed to preload personnel for playbook ${playbookId}`,
            error
          );
          prefetchedPlaybookIdsRef.current.delete(playbookId);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [teamId, prioritizedPlaybookIds, queryClient]);
}
