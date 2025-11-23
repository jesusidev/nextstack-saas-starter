import { ActionIcon, Button, createTheme } from '@mantine/core';
import { breakpoints } from '~/styles/breakpoints';
import { black, color } from '~/styles/colors';
import actionIconStyles from './ActionIcon.module.css';
import buttonStyles from './Button.module.css';
import comboboxStyles from './Combobox.module.css';
import multiSelectStyles from './MultiSelect.module.css';

export const theme = createTheme({
  colors: color,
  white: color.white[1],
  black,
  fontFamily: "'Work Sans', sans-serif",
  headings: {
    fontFamily: "'Roboto', sans-serif",
  },
  breakpoints: {
    xs: breakpoints.mobile,
    sm: breakpoints.mobile,
    md: breakpoints.tablet,
    lg: breakpoints.laptop,
    xl: breakpoints.desktop,
  },
  components: {
    Button: Button.extend({
      defaultProps: { variant: 'filled' },
      classNames: buttonStyles,
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { variant: 'filled' },
      classNames: actionIconStyles,
    }),
    Accordion: {
      defaultProps: { variant: 'separated' },
    },
    MultiSelect: {
      classNames: multiSelectStyles,
    },
    Combobox: {
      classNames: comboboxStyles,
    },
  },
});
