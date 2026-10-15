import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SwitcherPage } from '../features/profiles/pages/SwitcherPage';
import { AddProfilePage } from '../features/profiles/pages/AddProfilePage';
import { EmbedPage } from '../features/embed/pages/EmbedPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SwitcherPage />,
  },
  {
    path: '/add',
    element: <AddProfilePage />,
  },
  {
    path: '/app/:profileId',
    element: <EmbedPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
