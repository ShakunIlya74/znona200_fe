// src/theme.ts
import { createTheme } from '@mui/material/styles';

/**
 * @see https://mui.com/material-ui/customization/theme-components/#creating-new-component-variants
 */

declare module '@mui/material/styles' {

  interface Theme {
    maxWidthContent: string;
    maxWidthFormField: string;
    maxWidthTeaserFigures: string;
    maxWidthContainer: string;
  }

  interface ThemeOptions {
    maxWidthContent?: string;
    maxWidthFormField?: string;
  }

  // interface Theme {
  //   shadow: {
  //     default: string;
  //   };
  // }

  // interface ThemeOptions {
  //   shadow?: {
  //     default?: string;
  //   };
  // }

}


/**
 * @see https://mui.com/material-ui/customization/breakpoints/
 */

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    max: true;
  }
}


const theme = () => {
  let znoTheme = createTheme();
  znoTheme = createTheme(znoTheme, {

  palette: {
    primary: {
      main: '#006A68',
    },
    secondary: {
      main: '#3F6563',
    },
  },
  typography: {
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
    },
  },
});
return znoTheme;
}

export default theme();
