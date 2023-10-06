import {
	AlertTriangle,
	ArrowRight,
	Check,
	ChevronLeft,
	ChevronRight,
	CircuitBoard,
	File,
	FileText,
	HelpCircle,
	Image,
	Laptop,
	Loader2,
	Moon,
	MoreVertical,
	Plus,
	Settings,
	SunMedium,
	Trash,
	User,
	X,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

export type Icon = LucideIcon

export const Icons = {
	logo: CircuitBoard,
	close: X,
	spinner: Loader2,
	chevronLeft: ChevronLeft,
	chevronRight: ChevronRight,
	trash: Trash,
	post: FileText,
	page: File,
	media: Image,
	settings: Settings,
	ellipsis: MoreVertical,
	add: Plus,
	warning: AlertTriangle,
	user: User,
	arrowRight: ArrowRight,
	help: HelpCircle,
	sun: SunMedium,
	moon: Moon,
	laptop: Laptop,
	check: Check,
}
