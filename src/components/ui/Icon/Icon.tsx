/**
 * BoxCall Icon System
 *
 * Centralized icon component using Lucide React for consistent iconography.
 * Replaces all emojis with professional, scalable SVG icons.
 *
 * Design Philosophy: "Carhartt Reliability" - functional, clear, dependable icons
 */
import React from "react";
import {
  // Navigation & Layout
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Settings,
  Sidebar,
  Grid,
  List,
  MoreHorizontal,
  MoreVertical,
  // Practice & Planning
  Calendar,
  Clock,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Timer,
  MapPin,
  Users,
  User,
  UserCheck,
  CalendarDays,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  // Actions & Controls
  Plus,
  Minus,
  Edit3 as Edit,
  Trash2 as Delete,
  Save,
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
  Info,
  Archive,
  RotateCcw,
  RotateCw,
  Undo,
  Redo,
  RefreshCw,
  Power,
  // Communication & Data
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Folder,
  FolderOpen,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Book,
  MessageCircle,
  Send,
  Reply,
  Forward,
  AtSign,
  Hash,
  Link,
  Paperclip,
  // Sports Specific
  Target,
  Flag,
  Award,
  Trophy,
  Medal,
  Flame,
  Crown,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Crosshair,
  // Business & Team Management
  UserPlus,
  UserMinus,
  Briefcase,
  Building,
  Building2,
  Globe,
  WifiOff,
  Users as Team,
  // Content & Media
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
  // Weather & Environment
  Cloud,
  CloudRain,
  CloudSnow,
  Thermometer,
  Wind,
  Umbrella,
  Sunrise,
  Sunset,
  CloudLightning,
  // Health & Medical
  Heart,
  Activity as Heartbeat,
  Pill,
  Stethoscope,
  Bandage,
  Cross,
  Shield as Protection,
  Zap as Energy,
  // Food & Nutrition
  Coffee,
  Pizza,
  Apple,
  Utensils,
  ChefHat,
  Cookie,
  IceCream2 as IceCream,
  Salad,
  Sandwich,
  Soup,
  Wine,
  Beer,
  // Transportation
  Car,
  Truck,
  Bus,
  Train,
  Plane,
  Ship,
  Bike as Bicycle,
  Fuel,
  Navigation,
  Compass,
  Route,
  Map,
  // Technology
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Mouse,
  Keyboard,
  Wifi as WifiIcon,
  Bluetooth,
  Battery,
  BatteryLow,
  Cpu,
  HardDrive,
  // Shopping & Commerce
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  DollarSign,
  Euro,
  PoundSterling,
  Receipt,
  Tag,
  Gift,
  Store,
  // Time & Calendar Extended
  AlarmClock,
  Hourglass,
  Watch,
  CalendarCheck,
  CalendarHeart,
  CalendarRange,
  // Documents & Files Extended
  Files,
  FilePlus,
  FileMinus,
  FileCheck,
  FileX,
  FileEdit,
  FileSearch,
  FolderPlus,
  FolderMinus,
  // Social & Communication Extended
  ThumbsUp,
  ThumbsDown,
  Share,
  Share2,
  Bookmark,
  BookmarkPlus,
  MessageSquare as Comment,
  Bell,
  BellOff,
  BellRing,
  // Games & Entertainment
  Gamepad2 as Gamepad,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Puzzle,
  PartyPopper,
  Clapperboard as Clapper,
  Theater,
  // Nature & Animals
  Flower2 as Flower,
  Leaf,
  Bug,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Turtle,
  Snail,
  Feather,
  // Tools & Equipment Extended
  Wrench,
  Hammer,
  Drill,
  Ruler,
  Scissors,
  PaintBucket,
  Brush,
  Pen,
  Pencil,
  Eraser,
  // Security & Safety
  Key,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Fingerprint,
  Scan,
  QrCode,
  // Math & Science
  Calculator,
  Beaker,
  Microscope,
  Telescope,
  Atom,
  Dna,
  Magnet,
  Flashlight,
  Lightbulb as Bulb,
  // Charts & Analytics Extended
  BarChart,
  LineChart,
  Database,
  TrendingUp as TrendingUpIcon,
  BarChart2,
  BarChart4,
  Percent,
  Binary,
  Code,
  Terminal,
  Bug as BugIcon,
  // Emotions & Reactions
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Heart as Love,
  HeartCrack as HeartBroken,
  ThumbsUp as Like,
  // Alerts & Notifications
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Info as InfoIcon,
  HelpCircle,
  MinusCircle,
  PlusCircle,
  // Movement & Direction Extended
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  Move,
  ArrowUpDown,
  ArrowLeftRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  // PDF & Export
  FileDown,
  Printer,
  Share as ShareIcon,
  // Theme Icons
  Sun as SunIcon,
  Moon as MoonIcon,
  // Miscellaneous Popular Icons
  Sparkles,
  Rainbow,
  Rocket,
  Anchor,
  Tent,
  Backpack,
  Glasses,
  Magnet as Attraction,
  Crown as Premium,
  Star as Favorite,
  Flame as Fire,
  Snowflake,
  Droplet,
  Waves,
  Mountain,
  Handshake,
  Settings as Cog,
} from "lucide-react";
// Icon name mapping for easy usage - Expanded to 100+ icons
const iconMap = {
  // Navigation & Layout
  menu: Menu,
  close: X,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevrons-up": ChevronsUp,
  "chevrons-down": ChevronsDown,
  "chevrons-left": ChevronsLeft,
  "chevrons-right": ChevronsRight,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "arrow-up-down": ArrowUpDown,
  "arrow-left-right": ArrowLeftRight,
  move: Move,
  "move-up": MoveUp,
  "move-down": MoveDown,
  "move-left": MoveLeft,
  "move-right": MoveRight,
  home: Home,
  settings: Settings,
  sidebar: Sidebar,
  grid: Grid,
  list: List,
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,
  // Practice & Planning
  calendar: Calendar,
  "calendar-days": CalendarDays,
  "calendar-clock": CalendarClock,
  "calendar-plus": CalendarPlus,
  "calendar-x": CalendarX,
  "calendar-check": CalendarCheck,
  "calendar-heart": CalendarHeart,
  "calendar-range": CalendarRange,
  clock: Clock,
  "alarm-clock": AlarmClock,
  watch: Watch,
  timer: Timer,
  hourglass: Hourglass,
  play: Play,
  pause: Pause,
  stop: Square,
  "skip-forward": SkipForward,
  "skip-back": SkipBack,
  location: MapPin,
  users: Users,
  user: User,
  "user-check": UserCheck,
  "user-plus": UserPlus,
  "user-minus": UserMinus,
  // Actions & Controls
  plus: Plus,
  "plus-circle": PlusCircle,
  minus: Minus,
  "minus-circle": MinusCircle,
  edit: Edit,
  delete: Delete,
  save: Save,
  download: Download,
  upload: Upload,
  copy: Copy,
  check: Check,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
  alert: AlertCircle,
  "alert-triangle": AlertTriangle,
  "alert-octagon": AlertOctagon,
  warning: AlertTriangle,
  info: Info,
  "info-circle": InfoIcon,
  help: HelpCircle,
  archive: Archive,
  "rotate-ccw": RotateCcw,
  "rotate-cw": RotateCw,
  undo: Undo,
  redo: Redo,
  refresh: RefreshCw,
  power: Power,
  // Communication & Data
  message: MessageSquare,
  "message-circle": MessageCircle,
  comment: Comment,
  send: Send,
  reply: Reply,
  forward: Forward,
  "at-sign": AtSign,
  phone: Phone,
  mail: Mail,
  link: Link,
  paperclip: Paperclip,
  file: FileText,
  files: Files,
  "file-plus": FilePlus,
  "file-minus": FileMinus,
  "file-check": FileCheck,
  "file-x": FileX,
  "file-edit": FileEdit,
  "file-search": FileSearch,
  "file-image": FileImage,
  "file-video": FileVideo,
  folder: Folder,
  "folder-open": FolderOpen,
  "folder-plus": FolderPlus,
  "folder-minus": FolderMinus,
  search: Search,
  filter: Filter,
  "sort-asc": SortAsc,
  "sort-desc": SortDesc,
  book: Book,
  // Sports Specific
  target: Target,
  flag: Flag,
  award: Award,
  trophy: Trophy,
  medal: Medal,
  flame: Flame,
  fire: Fire,
  crown: Crown,
  premium: Premium,
  star: Star,
  favorite: Favorite,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "bar-chart": BarChart3,
  "bar-chart-2": BarChart2,
  "bar-chart-4": BarChart4,
  "pie-chart": PieChart,
  "line-chart": LineChart,
  activity: Activity,
  crosshair: Crosshair,
  compass: Compass,
  route: Route,
  map: Map,
  navigation: Navigation,
  // Team Management
  team: Team,
  briefcase: Briefcase,
  building: Building,
  "building-2": Building2,
  globe: Globe,
  wifi: WifiIcon,
  "wifi-off": WifiOff,
  // Content & Media
  image: Image,
  video: Video,
  camera: Camera,
  mic: Mic,
  "mic-off": MicOff,
  volume: Volume2,
  "volume-off": VolumeX,
  music: Music,
  film: Film,
  headphones: Headphones,
  speaker: Speaker,
  // Weather & Environment
  sun: SunIcon,
  moon: MoonIcon,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-snow": CloudSnow,
  "cloud-lightning": CloudLightning,
  thermometer: Thermometer,
  wind: Wind,
  umbrella: Umbrella,
  sunrise: Sunrise,
  sunset: Sunset,
  // Health & Medical
  heart: Heart,
  love: Love,
  "heart-broken": HeartBroken,
  heartbeat: Heartbeat,
  pill: Pill,
  stethoscope: Stethoscope,
  bandage: Bandage,
  cross: Cross,
  protection: Protection,
  energy: Energy,
  // Food & Nutrition
  coffee: Coffee,
  pizza: Pizza,
  apple: Apple,
  utensils: Utensils,
  "chef-hat": ChefHat,
  cookie: Cookie,
  "ice-cream": IceCream,
  salad: Salad,
  sandwich: Sandwich,
  soup: Soup,
  wine: Wine,
  beer: Beer,
  // Transportation
  car: Car,
  truck: Truck,
  bus: Bus,
  train: Train,
  plane: Plane,
  ship: Ship,
  bicycle: Bicycle,
  fuel: Fuel,
  // Technology
  smartphone: Smartphone,
  laptop: Laptop,
  monitor: Monitor,
  tablet: Tablet,
  mouse: Mouse,
  keyboard: Keyboard,
  bluetooth: Bluetooth,
  battery: Battery,
  "battery-low": BatteryLow,
  cpu: Cpu,
  "hard-drive": HardDrive,
  // Shopping & Commerce
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  "credit-card": CreditCard,
  "dollar-sign": DollarSign,
  euro: Euro,
  "pound-sterling": PoundSterling,
  receipt: Receipt,
  tag: Tag,
  gift: Gift,
  store: Store,
  // Social & Communication
  "thumbs-up": ThumbsUp,
  like: Like,
  "thumbs-down": ThumbsDown,
  share: Share,
  "share-2": Share2,
  bookmark: Bookmark,
  "bookmark-plus": BookmarkPlus,
  bell: Bell,
  "bell-off": BellOff,
  "bell-ring": BellRing,
  // Games & Entertainment
  gamepad: Gamepad,
  "dice-1": Dice1,
  "dice-2": Dice2,
  "dice-3": Dice3,
  "dice-4": Dice4,
  "dice-5": Dice5,
  "dice-6": Dice6,
  puzzle: Puzzle,
  "party-popper": PartyPopper,
  clapper: Clapper,
  theater: Theater,
  // Nature & Animals
  flower: Flower,
  leaf: Leaf,
  bug: Bug,
  fish: Fish,
  bird: Bird,
  cat: Cat,
  dog: Dog,
  rabbit: Rabbit,
  turtle: Turtle,
  snail: Snail,
  feather: Feather,
  // Tools & Equipment
  wrench: Wrench,
  hammer: Hammer,
  drill: Drill,
  ruler: Ruler,
  scissors: Scissors,
  "paint-bucket": PaintBucket,
  brush: Brush,
  pen: Pen,
  pencil: Pencil,
  eraser: Eraser,
  cog: Cog,
  // Security & Safety
  lock: Lock,
  unlock: Unlock,
  key: Key,
  shield: Shield,
  "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert,
  "shield-x": ShieldX,
  fingerprint: Fingerprint,
  scan: Scan,
  "qr-code": QrCode,
  // Math & Science
  calculator: Calculator,
  beaker: Beaker,
  microscope: Microscope,
  telescope: Telescope,
  atom: Atom,
  dna: Dna,
  magnet: Magnet,
  attraction: Attraction,
  flashlight: Flashlight,
  bulb: Bulb,
  zap: Zap,
  lightning: Zap,
  eye: Eye,
  "eye-off": EyeOff,
  // Charts & Analytics
  database: Database,
  chart: BarChart,
  analytics: LineChart,
  trend: TrendingUpIcon,
  percent: Percent,
  hash: Hash,
  binary: Binary,
  code: Code,
  terminal: Terminal,
  "bug-icon": BugIcon,
  // Emotions & Reactions
  smile: Smile,
  frown: Frown,
  meh: Meh,
  laugh: Laugh,
  angry: Angry,
  // PDF & Export
  pdf: FileDown,
  print: Printer,
  export: ShareIcon,
  // Miscellaneous Popular Icons
  sparkles: Sparkles,
  rainbow: Rainbow,
  rocket: Rocket,
  anchor: Anchor,
  tent: Tent,
  backpack: Backpack,
  glasses: Glasses,
  snowflake: Snowflake,
  droplet: Droplet,
  waves: Waves,
  mountain: Mountain,
  handshake: Handshake,
  // BoxCall Specific
  boxcall: ({
    size,
    color,
    className,
    ...props
  }: React.SVGProps<SVGSVGElement> & { size?: number; color?: string }) => (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 560.85 578.7"
      fill={color}
      className={className}
    >
      <path d="M269.19.42c25.65-1.92,51.42,2.82,74.56,13.84,59,28.12,116.17,72.23,174.95,102.05,23.41,15.71,38.82,40.73,40.73,69.27,4.49,67.18-3.44,139.33-.05,207.03-3.02,29.83-16.35,53.24-41.07,69.93-56.48,38.13-123.54,69.31-181.95,105.05-36.19,15.23-81.62,14.92-117.33-1.61l-183.97-109.03c-21.03-15.87-31.8-40.21-33.71-66.29,3.37-66.77-4.37-137.75.05-204.03,1.97-29.6,16.89-55.38,42.07-70.93,57.65-30.44,113.36-70.42,171.25-99.75C231.45,7.47,250.42,1.83,269.19.42ZM266.19,32.41c-18.3,1.76-31.81,9.01-47.47,17.53-56.92,30.99-112.44,65.72-167.85,99.15-13.31,11.96-18.09,26.98-19.52,44.48,3.26,63.15-4.19,130.41,0,193.08,1.6,23.87,11.53,38.32,31.12,50.88,53.73,34.46,112.67,64.07,166.89,98.11,29.57,13.44,63.61,14.15,94.01,2.95,56.89-33.57,120.03-63.85,175.33-99.67,18.18-11.78,28.32-26.25,30.73-48.27v-202.07c-2.68-34.12-27.05-45.8-52.74-61.27-52.26-31.46-105.27-62.9-159.51-90.49-15.51-4.85-34.82-5.98-50.99-4.42Z" />
      <path d="M399.49,237.02c27.83,6.52,43.11,30.67,46.76,57.74,5.5,40.77,5.04,103.87-47.67,110.55-19.99,40.67-63.66,64.57-108.51,64.99-4.6,5.21-8.04,9.5-14.7,12.3-12.08,5.08-46.04,4.51-57.32-2.65-17.71-11.23-15.39-44.34,5.05-52.63,9.78-3.96,43.79-3.56,53.33,1.25,3.48,1.75,9.95,8.03,12.48,8.52,5.04.97,20.04-1.19,25.68-2.27,20.42-3.92,38.96-16.33,50.7-33.32l-10.37-7.42c-24.71-20.82-23.57-64.77-21.57-94.51,1.16-17.35,8.24-36.88,21.15-48.85,2.76-2.56,13.96-8.85,14.4-9.59,4.35-7.18-10.72-40.07-15.48-47.54-24.64-38.62-66.47-55.04-111.4-50.34-46.69,4.88-87.66,39.14-96.63,85.86,26.65,4.98,43.02,30.67,44.99,56.52,2.81,36.77,1.38,90.16-42.36,101.61-43.58,11.41-64.47-27.44-66.62-64.64-1.89-32.68.62-71.02,32.47-88.51,12.63-88.61,97.58-142.02,184.04-117.99,52.82,14.68,96.82,65.93,101.58,120.92Z" />
    </svg>
  ),
} as const;
export type IconName = keyof typeof iconMap;
/**
 * SmartIconSystem - Intelligent Icon Selection
 *
 * Analyzes content to automatically select the most appropriate icon
 * based on keywords, context, and semantic meaning.
 */
export class SmartIconSystem {
  private static contentPatterns: { [key: string]: IconName[] } = {
    // Achievement & Success patterns
    achievement: ["trophy", "medal", "award", "star", "crown"],
    success: ["check", "check-circle", "trophy", "thumbs-up"],
    victory: ["trophy", "crown", "flame", "star"],
    medal: ["medal", "award", "star"],
    trophy: ["trophy", "crown", "award"],
    winner: ["crown", "trophy", "star"],
    champion: ["crown", "trophy", "medal"],
    // Team & People patterns
    team: ["team", "users", "user-plus", "briefcase"],
    player: ["user", "user-check", "star"],
    coach: ["user", "crown", "briefcase"],
    captain: ["crown", "user", "star"],
    roster: ["users", "list", "file"],
    member: ["user", "user-plus", "team"],
    // Calendar & Time patterns
    schedule: ["calendar", "clock", "calendar-clock"],
    event: ["calendar", "calendar-plus", "clock"],
    practice: ["calendar", "target", "activity"],
    game: ["calendar", "trophy", "target"],
    meeting: ["calendar", "users", "message"],
    deadline: ["calendar-x", "clock", "alert"],
    time: ["clock", "timer", "watch"],
    date: ["calendar", "calendar-days"],
    // Communication patterns
    message: ["message", "message-circle", "mail"],
    chat: ["message-circle", "comment", "users"],
    notification: ["bell", "bell-ring", "alert"],
    announcement: ["bell", "bell-ring", "message"],
    email: ["mail", "send", "message"],
    call: ["phone", "mic", "users"],
    // Sports & Activities patterns
    football: ["target", "activity", "trophy"],
    sport: ["activity", "target", "trophy"],
    exercise: ["activity", "heart", "energy"],
    training: ["target", "activity", "trending-up"],
    drill: ["target", "crosshair", "activity"],
    play: ["play", "activity", "target"],
    strategy: ["target", "route", "compass"],
    // Performance & Analytics patterns
    stats: ["chart", "bar-chart", "analytics"],
    performance: ["trending-up", "chart", "activity"],
    progress: ["trending-up", "bar-chart", "percent"],
    analytics: ["analytics", "chart", "database"],
    report: ["file", "chart", "bar-chart"],
    data: ["database", "chart", "analytics"],
    // Actions & Status patterns
    add: ["plus", "plus-circle", "user-plus"],
    create: ["plus", "edit", "file-plus"],
    edit: ["edit", "pen", "pencil"],
    delete: ["delete", "x-circle", "minus-circle"],
    save: ["save", "check", "download"],
    export: ["export", "download", "share"],
    import: ["upload", "file-plus", "download"],
    share: ["share", "share-2", "link"],
    // Health & Medical patterns
    health: ["heart", "heartbeat", "activity"],
    medical: ["cross", "stethoscope", "pill"],
    injury: ["bandage", "cross", "alert"],
    fitness: ["heart", "activity", "trending-up"],
    // Weather & Environment patterns
    weather: ["cloud", "thermometer"],
    outdoor: ["sunrise", "mountain"],
    indoor: ["building", "home", "users"],
    // Technology patterns
    app: ["smartphone", "monitor", "grid"],
    software: ["monitor", "code", "cpu"],
    device: ["smartphone", "laptop", "tablet"],
    digital: ["monitor", "smartphone", "wifi"],
    // Security & Privacy patterns
    security: ["shield", "lock", "key"],
    private: ["lock", "shield", "eye-off"],
    public: ["globe", "eye", "share"],
    password: ["key", "lock", "shield"],
    // Food & Nutrition patterns
    food: ["utensils", "apple", "chef-hat"],
    meal: ["utensils", "pizza", "coffee"],
    nutrition: ["apple", "heart", "utensils"],
    // Transportation patterns
    travel: ["plane", "car", "map"],
    location: ["location", "map", "navigation"],
    // Emotions & Reactions patterns
    happy: ["smile", "laugh", "thumbs-up"],
    sad: ["frown", "heart-broken"],
    excited: ["party-popper", "fire", "sparkles"],
    angry: ["angry", "alert", "x-circle"],
    // Default fallbacks for common words
    default: ["star", "info", "info-circle"],
  };
  /**
   * Analyzes text content and returns the most appropriate icon
   */
  static getSmartIcon(content: string, fallback: IconName = "star"): IconName {
    if (!content || typeof content !== "string") {
      return fallback;
    }
    const normalizedContent = content.toLowerCase().trim();
    // Direct matches first (highest priority)
    for (const [pattern, icons] of Object.entries(this.contentPatterns)) {
      if (normalizedContent.includes(pattern)) {
        return icons[0]; // Return the primary icon for this pattern
      }
    }
    // Word boundary matches (medium priority)
    const words = normalizedContent.split(/\s+/);
    for (const word of words) {
      for (const [pattern, icons] of Object.entries(this.contentPatterns)) {
        if (word === pattern) {
          return icons[0];
        }
      }
    }
    // Partial matches (lower priority)
    for (const word of words) {
      for (const [pattern, icons] of Object.entries(this.contentPatterns)) {
        if (pattern.includes(word) || word.includes(pattern)) {
          return icons[0];
        }
      }
    }
    return fallback;
  }
  /**
   * Gets multiple icon suggestions for content
   */
  static getIconSuggestions(
    content: string,
    maxSuggestions: number = 3
  ): IconName[] {
    if (!content || typeof content !== "string") {
      return ["star", "info", "info-circle"];
    }
    const normalizedContent = content.toLowerCase().trim();
    const suggestions: IconName[] = [];
    // Collect all matching patterns
    for (const [pattern, icons] of Object.entries(this.contentPatterns)) {
      if (normalizedContent.includes(pattern)) {
        suggestions.push(...icons.slice(0, 2)); // Take top 2 from each pattern
      }
    }
    // Remove duplicates and limit results
    const uniqueSuggestions = [...new Set(suggestions)];
    return uniqueSuggestions.slice(0, maxSuggestions);
  }
  /**
   * Contextual icon selection for specific components
   */
  static getContextualIcon(
    content: string,
    context:
      | "feed"
      | "calendar"
      | "achievement"
      | "message"
      | "team"
      | "general" = "general",
    fallback: IconName = "star"
  ): IconName {
    const contextualFallbacks: { [key: string]: IconName } = {
      feed: "activity",
      calendar: "calendar",
      achievement: "trophy",
      message: "message",
      team: "users",
      general: fallback,
    };
    const smartIcon = this.getSmartIcon(content, contextualFallbacks[context]);
    // Context-specific overrides
    if (
      context === "achievement" &&
      !["trophy", "medal", "award", "crown", "star"].includes(smartIcon)
    ) {
      const achievementIcons = this.contentPatterns.achievement || ["trophy"];
      return achievementIcons[0];
    }
    if (
      context === "calendar" &&
      !["calendar", "clock", "timer"].includes(smartIcon)
    ) {
      return "calendar";
    }
    return smartIcon;
  }
}
interface IconProps {
  name: IconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "touch" | number;
  className?: string;
  color?:
    | "current"
    | "jade"
    | "navy"
    | "slate"
    | "success"
    | "warning"
    | "error"
    | "info";
  strokeWidth?: number;
}
const sizeMap = {
  xs: 12, // Tight UI elements
  sm: 16, // Default small buttons
  md: 20, // Standard icons
  lg: 24, // Larger buttons
  xl: 32, // Headers, prominent actions
  "2xl": 40, // Coach-friendly size
  "3xl": 48, // Extra large for accessibility
  touch: 44, // Minimum touch target (44px recommended)
};
const colorMap = {
  current: "currentColor",
  jade: "#047857",
  navy: "#0F172A",
  slate: "#64748B",
  success: "#047857",
  warning: "#D97706",
  error: "#DC2626",
  info: "#0369A1",
};
export const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  className = "",
  color = "current",
  strokeWidth = 2,
}) => {
  const IconComponent = iconMap[name];
  const iconSize = typeof size === "number" ? size : sizeMap[size];
  const iconColor = colorMap[color];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return (
    <IconComponent
      size={iconSize}
      color={iconColor}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};
// Convenience components for common use cases
export const PlayIcon = () => <Icon name="play" color="jade" />;
export const PauseIcon = () => <Icon name="pause" color="slate" />;
export const EditIcon = () => <Icon name="edit" size="sm" color="slate" />;
export const DeleteIcon = () => <Icon name="delete" size="sm" color="error" />;
export const AddIcon = () => <Icon name="plus" color="jade" />;
export const PDFIcon = () => <Icon name="pdf" color="jade" />;
export const CalendarIcon = () => <Icon name="calendar" color="navy" />;
export const ClockIcon = () => <Icon name="clock" color="slate" />;
export const TeamIcon = () => <Icon name="team" color="navy" />;
export const SettingsIcon = () => <Icon name="settings" color="slate" />;
// Coach-friendly accessibility components
export const CoachActionIcon = ({
  name,
  color = "slate",
}: {
  name: IconName;
  color?: IconProps["color"];
}) => <Icon name={name} size="lg" color={color} />;
export const HeaderIcon = ({
  name,
  color = "navy",
}: {
  name: IconName;
  color?: IconProps["color"];
}) => <Icon name={name} size="xl" color={color} />;
export const TouchTargetIcon = ({
  name,
  color = "current",
}: {
  name: IconName;
  color?: IconProps["color"];
}) => <Icon name={name} size="touch" color={color} />;
// Quick access for common coach actions
export const CoachEditIcon = () => (
  <CoachActionIcon name="edit" color="slate" />
);
export const CoachDeleteIcon = () => (
  <CoachActionIcon name="delete" color="error" />
);
export const CoachPDFIcon = () => <CoachActionIcon name="pdf" color="jade" />;
export const CoachCloseIcon = () => (
  <TouchTargetIcon name="close" color="slate" />
);
export default Icon;
