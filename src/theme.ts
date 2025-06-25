// src/theme.ts
import { createTheme } from '@mui/material/styles';

/**
 * @see https://mui.com/material-ui/customization/theme-components/#creating-new-component-variants
 */

//todo: make sure these theme overrides are used in the app and actually override the default MUI theme

declare module '@mui/material/styles' {
  interface TypographyVariants {
    latoHeading: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    latoHeading?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    latoHeading: true;
  }
}

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
  },  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Default font
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
    },
    // Custom font variant for Lato
    h3: {
      fontFamily: '"Lato", sans-serif',
    },
    h5: {
      fontFamily: '"Lato", sans-serif',
    },
    // Custom variant for easy reuse
    latoHeading: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
    },
  },
});
return znoTheme;
}

export default theme();
