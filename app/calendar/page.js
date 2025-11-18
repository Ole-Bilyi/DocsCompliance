'use client';

import React from 'react';
import Calendar from '@/components/calendar/calendar';
import MainLayout from '../../components/layout/MainLayout';

export default function CalendarPage() {
  return (
    <MainLayout>
      <Calendar />
    </MainLayout>
  );
}