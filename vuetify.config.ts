import defaults from "./app/plugins/vuetify/defaults";
import { staticPrimaryColor, staticPrimaryDarkenColor, themes } from "./app/plugins/vuetify/theme";
import { es } from "vuetify/locale";

const iconAliases = {
  calendar: 'tabler-calendar',
  collapse: 'tabler-chevron-up',
  complete: 'tabler-check',
  cancel: 'tabler-x',
  close: 'tabler-x',
  delete: 'tabler-circle-x-filled',
  clear: 'tabler-circle-x',
  success: 'tabler-circle-check',
  info: 'tabler-info-circle',
  warning: 'tabler-alert-triangle',
  error: 'tabler-alert-circle',
  prev: 'tabler-chevron-left',
  ratingEmpty: 'tabler-star',
  ratingFull: 'tabler-star-filled',
  ratingHalf: 'tabler-star-half-filled',
  next: 'tabler-chevron-right',
  delimiter: 'tabler-circle',
  sort: 'tabler-arrow-up',
  expand: 'tabler-chevron-down',
  menu: 'tabler-menu-2',
  subgroup: 'tabler-caret-down',
  dropdown: 'tabler-chevron-down',
  edit: 'tabler-pencil',
  loading: 'tabler-refresh',
  first: 'tabler-player-skip-back',
  last: 'tabler-player-skip-forward',
  unfold: 'tabler-arrows-move-vertical',
  file: 'tabler-paperclip',
  plus: 'tabler-plus',
  minus: 'tabler-minus',
  sortAsc: 'tabler-arrow-up',
  sortDesc: 'tabler-arrow-down',
};

export default {
  ssr: false,
  locale: {
    locale: "es",
    messages: { es },
  },
  aliases: {
    IconBtn: "VBtn",
  },
  icons: {
    defaultSet: 'mdi',
    aliases: iconAliases,
  },
  defaults,
  theme: {
    defaultTheme: "light",
    themes: {
      ...themes,
      light: {
        ...themes.light,
        colors: {
          ...themes.light.colors,
          primary: "#043474",
          "primary-darken-1": "#043474",
        },
      },
      dark: {
        ...themes.dark,
        colors: {
          ...themes.dark.colors,
          primary: staticPrimaryColor,
          "primary-darken-1": staticPrimaryDarkenColor,
        },
      },
    },
  },
};
