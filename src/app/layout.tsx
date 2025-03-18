import '@near-pagoda/ui/styles.css';
import '~/styles/globals.scss';

import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { Layout } from '~/components/Layout';

const title = 'NEAR AI';

export const metadata: Metadata = {
  title: {
    template: `%s | ${title}`,
    default: `Sign In | ${title}`,
  },
};

/*
  The suppressHydrationWarning on <html> is required by <ThemeProvider>:
  https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
*/

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1"
        />
        <meta name="description" content="NEAR AI | Sign In" />
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
