import React from 'react';

export const metadata = {
  title: 'CarBikeKharido Admin Studio',
  description: 'Management portal for vehicle media and specifications',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-stone-100 text-stone-900">
      {children}
    </div>
  );
}