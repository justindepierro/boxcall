/**
 * Media Icons Category
 * 
 * Icons for media, content, and communication
 * Tree-shakeable icon category - only loads when media icons are used
 */

import {
  Image,
  Video,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Music,
  Film,
  FileImage,
  FileVideo,
  Headphones,
  Speaker,
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Reply,
  Forward,
  AtSign,
  Link,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Share,
  Share2,
  Bookmark,
  BookmarkPlus,
  Bell,
  BellOff,
  BellRing,
} from "lucide-react";

import { registerIconCategory } from "../registry";

// Media icon names type
export type MediaIconName =
  | "image"
  | "video"
  | "camera"
  | "mic"
  | "mic-off"
  | "volume"
  | "volume-off"
  | "music"
  | "film"
  | "file-image"
  | "file-video"
  | "headphones"
  | "speaker"
  | "message"
  | "message-circle"
  | "comment"
  | "phone"
  | "mail"
  | "send"
  | "reply"
  | "forward"
  | "at-sign"
  | "link"
  | "paperclip"
  | "thumbs-up"
  | "like"
  | "thumbs-down"
  | "share"
  | "share-2"
  | "bookmark"
  | "bookmark-plus"
  | "bell"
  | "bell-off"
  | "bell-ring";

// Media icons mapping
const mediaIcons = {
  image: Image,
  video: Video,
  camera: Camera,
  mic: Mic,
  "mic-off": MicOff,
  volume: Volume2,
  "volume-off": VolumeX,
  music: Music,
  film: Film,
  "file-image": FileImage,
  "file-video": FileVideo,
  headphones: Headphones,
  speaker: Speaker,
  message: MessageSquare,
  "message-circle": MessageCircle,
  comment: MessageSquare,
  phone: Phone,
  mail: Mail,
  send: Send,
  reply: Reply,
  forward: Forward,
  "at-sign": AtSign,
  link: Link,
  paperclip: Paperclip,
  "thumbs-up": ThumbsUp,
  like: ThumbsUp,
  "thumbs-down": ThumbsDown,
  share: Share,
  "share-2": Share2,
  bookmark: Bookmark,
  "bookmark-plus": BookmarkPlus,
  bell: Bell,
  "bell-off": BellOff,
  "bell-ring": BellRing,
};

// Register media icons on module load
registerIconCategory("media", mediaIcons);
