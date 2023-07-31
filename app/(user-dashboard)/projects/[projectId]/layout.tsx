import { ReactNode } from 'react';

type TodayLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

export default function ProjectLayout({ children, modal }: TodayLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
