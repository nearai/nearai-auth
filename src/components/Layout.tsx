'use client';

import { PagodaUiProvider, Toaster } from '@near-pagoda/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';

import s from './Layout.module.scss';

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <PagodaUiProvider
      value={{
        Link,
        useRouter,
      }}
    >
      <Toaster />

      <div className={s.wrapper}>
        <main className={s.main}>{children}</main>
      </div>
    </PagodaUiProvider>
  );
};
