export interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

export const MENU_ITEMS = [
  { icon: 'language', label: 'Home', route: '/' },
  { icon: 'groups', label: 'Families', route: '/families' },
];
