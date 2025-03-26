export const sounds = {
  transition: '/sounds/transition.mp3',
  ambient: '/sounds/ambient.mp3',
  success: '/sounds/success.mp3',
  mechanicalClick: '/sounds/machanical-click.mp3',
  rocketLaunch: '/sounds/rocket-launch.mp3',
  woosh: '/sounds/woosh.mp3',
  swoosh: '/sounds/swoosh.mp3',
  tick: '/sounds/tick.mp3',
  powerUp: '/sounds/power-up.mp3',
  transform: '/sounds/transform.mp3',
  glitch: '/sounds/glitch.mp3',
  pop: '/sounds/pop.mp3',
  whoosh: '/sounds/whoosh.mp3',
  ping: '/sounds/ping.mp3',
  sweep: '/sounds/sweep.mp3',
  hover: '/sounds/hover.mp3',
  click: '/sounds/click.mp3',
  mechaSound: '/sounds/mecha-sound.mp3',
  
} as const;

export type SoundName = keyof typeof sounds; 