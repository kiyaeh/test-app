import React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import theme from './index';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
}
