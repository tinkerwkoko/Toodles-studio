import {
  BookOpen,
  Briefcase,
  Camera,
  Code,
  Coffee,
  Compass,
  Dumbbell,
  Feather,
  Flower2,
  Folder,
  Globe,
  GraduationCap,
  Heart,
  Layers,
  Lightbulb,
  Music,
  Palette,
  Rocket,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Target,
  type LucideIcon,
} from 'lucide-react';

export const PROJECT_LUCIDE_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  folder: { label: 'Folder', icon: Folder },
  sprout: { label: 'Sprout', icon: Sprout },
  book: { label: 'Book', icon: BookOpen },
  sparkles: { label: 'Sparkles', icon: Sparkles },
  grad: { label: 'Study', icon: GraduationCap },
  palette: { label: 'Art', icon: Palette },
  briefcase: { label: 'Work', icon: Briefcase },
  heart: { label: 'Heart', icon: Heart },
  target: { label: 'Goal', icon: Target },
  code: { label: 'Code', icon: Code },
  coffee: { label: 'Cafe', icon: Coffee },
  music: { label: 'Music', icon: Music },
  compass: { label: 'Explore', icon: Compass },
  star: { label: 'Star', icon: Star },
  sun: { label: 'Sun', icon: Sun },
  dumbbell: { label: 'Fitness', icon: Dumbbell },
  flower: { label: 'Flower', icon: Flower2 },
  lightbulb: { label: 'Idea', icon: Lightbulb },
  feather: { label: 'Writing', icon: Feather },
  rocket: { label: 'Launch', icon: Rocket },
  globe: { label: 'Globe', icon: Globe },
  layers: { label: 'Layers', icon: Layers },
  camera: { label: 'Photo', icon: Camera },
};

export const PROJECT_EMOJIS = ['🌱', '📚', '🎨', '🏡', '✨', '🎓', '🧺', '💼', '🍵', '🧶', '🪴', '🌸', '🧁', '⭐'];

export interface ProjectIconDisplayProps {
  icon?: string;
  emoji?: string;
  size?: number;
  className?: string;
}

export function ProjectIconDisplay({ icon, emoji = '🌱', size = 24, className }: ProjectIconDisplayProps) {
  // If icon is custom image (data url or image path)
  if (icon && (icon.startsWith('data:image') || icon.startsWith('http') || icon.startsWith('/'))) {
    return <img src={icon} alt="" className={`h-full w-full object-cover block rounded-inherit ${className ?? ''}`} />;
  }

  // If icon is a Lucide React icon key (e.g. "lucide:folder" or just "folder")
  const iconKey = icon?.startsWith('lucide:') ? icon.replace('lucide:', '') : icon;
  if (iconKey && PROJECT_LUCIDE_ICONS[iconKey]) {
    const IconComponent = PROJECT_LUCIDE_ICONS[iconKey].icon;
    return <IconComponent size={size} className={className} aria-hidden="true" />;
  }

  // Default to Folder icon if emoji isn't set, otherwise display emoji for older projects
  if (!icon && (!emoji || emoji === '🌱')) {
    return <Folder size={size} className={className} aria-hidden="true" />;
  }

  return <span className={className} style={{ fontSize: `${size}px`, lineHeight: 1 }}>{emoji}</span>;
}
