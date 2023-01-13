import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import Game from './components/Game/Game';

const root = createRoot(document.getElementById('game')!);
root.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
