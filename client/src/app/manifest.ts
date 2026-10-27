import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RHIZAN Hub | Operations Platform',
    short_name: 'RHIZAN Hub',
    description: 'Internal operations, tasks, projects, CRM pipeline, and time tracking for Rhizan Technologies.',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0f141c',
    theme_color: '#0f766e',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Tasks Kanban',
        short_name: 'Tasks',
        description: 'View and manage tasks',
        url: '/tasks',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Log Time',
        short_name: 'Time',
        description: 'Track time and work hours',
        url: '/time',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Projects',
        short_name: 'Projects',
        description: 'View active company projects',
        url: '/projects',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'CRM Approaches',
        short_name: 'CRM',
        description: 'Lead and client pipeline',
        url: '/approaches',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
