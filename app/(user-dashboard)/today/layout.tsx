import { ReactNode } from 'react';

type TodayLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

export default function TodayLayout({ children, modal }: TodayLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
