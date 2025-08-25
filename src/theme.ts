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
  interface TypeBackground {
    default: string;
    paper: string;
    dark: string;
  }
}

declare module '@mui/material/styles' {
  interface PaletteColor {
    main: string;
    light: string;
    dark: string;
    darker: string;
    contrastText: string;
  }

  interface SimplePaletteColorOptions {
    darker?: string;
  }

  interface Palette {
    greysh: PaletteColor;
  }

  interface PaletteOptions {
    greysh?: SimplePaletteColorOptions;
  }
}


const theme = () => {
  let znoTheme = createTheme();
  znoTheme = createTheme(znoTheme, {

  palette: {
    greysh: {
      main:  '#f4f4f3',
      light: '#f4f4f3',
      dark: '#e6e6e5',
    },
    // greysh: { //misty blue
    //   main:  '#e8f2f9ff',
    //   light: '#f4faffff',
    //   dark: '#b7cfdc',
    // },
    //     greysh: { //green minty
    //   main:  '#e7f6f1',
    //   light: '#f4fbf9',
    //   dark: '#b7cfdc',
    // },
    // greysh: { // latte brownish
    //   main:  '#f4ede7',
    //   light: '#fbf8f5',
    //   dark: '#e6e6e5',
    //   darker: '#d0cfcf',
    // },

    primary: {
      main: '#0f6a68', //original
      // main: '#385e72', //misty blue
      // main: '#48715e', //green minty
      // main: '#7a6250', // latte brownish
    },
    secondary: {
      main: '#3F6563',
    },
    // background: {
    //   default:  '#f4f4f3',
    //   paper: '#ffffff',
    //   dark: '#e6e6e5',
    // },
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
