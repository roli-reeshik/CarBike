export interface NavSubItem {
  title: string;
  description: string;
  href: string;
  badge?: string;
  iconName: string;
}

export interface NavItem {
  title: string;
  href: string;
  hasDropdown: boolean;
  subItems?: NavSubItem[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Home",
    href: "/",
    hasDropdown: false,
  },
  {
    title: "New Cars",
    href: "/cars",
    hasDropdown: true,
    subItems: [
      {
        title: "Latest Launches",
        description: "Freshly launched models in the Indian market",
        href: "/cars?tab=latest",
        iconName: "Sparkles",
      },
      {
        title: "Popular Cars",
        description: "Most searched & top-selling customer picks",
        href: "/cars?tab=popular",
        iconName: "TrendingUp",
      },
      {
        title: "Upcoming Cars",
        description: "Expected launches, spy shots & launch dates",
        href: "/cars/upcoming",
        badge: "New",
        iconName: "CalendarClock",
      },
      {
        title: "Dealer Showrooms",
        description: "Find authorized brand dealers near you",
        href: "/dealers",
        iconName: "MapPin",
      },
    ],
  },
  {
    title: "Used Cars",
    href: "/used-cars",
    hasDropdown: true,
    subItems: [
      {
        title: "Buy Pre-Owned Car",
        description: "Certified multi-point inspected pre-owned cars",
        href: "/used-cars",
        iconName: "ShieldCheck",
      },
      {
        title: "Sell Your Car",
        description: "Instant online valuation & verified buyer pickup",
        href: "/sell-car",
        badge: "Best Price",
        iconName: "Tag",
      },
    ],
  },
  {
    title: "Compare Cars",
    href: "/compare",
    hasDropdown: false,
  },
  {
    title: "Dealers",
    href: "/dealers",
    hasDropdown: false,
  },
];
