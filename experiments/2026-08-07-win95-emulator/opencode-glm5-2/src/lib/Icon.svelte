<script context="module">
  // SVG path definitions keyed by name. Drawn on a 32x32 grid.
  export const ICON_NAMES = [
    'computer', 'notepad', 'mine', 'recycle', 'folder', 'info',
    'explorer', 'programs', 'documents', 'settings', 'find',
    'help', 'run', 'shutdown', 'drive-c', 'floppy', 'cd', 'msdos',
    'defrag', 'control'
  ]
</script>

<script>
  export let name = 'folder'
  export let size = 32
</script>

{#if name === 'computer'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="3" y="4" width="26" height="18" fill="#c0c0c0" stroke="#000" />
    <rect x="5" y="6" width="22" height="14" fill="#008080" />
    <rect x="6" y="7" width="20" height="12" fill="#1084d0" />
    <rect x="8" y="9" width="3" height="2" fill="#fff" />
    <rect x="8" y="12" width="6" height="1" fill="#fff" />
    <rect x="8" y="14" width="4" height="1" fill="#fff" />
    <rect x="10" y="22" width="12" height="3" fill="#c0c0c0" stroke="#000" />
    <rect x="6" y="25" width="20" height="3" fill="#c0c0c0" stroke="#000" />
    <rect x="8" y="26" width="2" height="1" fill="#808080" />
  </svg>
{:else if name === 'notepad'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="7" y="3" width="18" height="26" fill="#fff" stroke="#000" />
    <rect x="7" y="3" width="18" height="3" fill="#000080" />
    <rect x="9" y="8" width="14" height="1" fill="#000" />
    <rect x="9" y="11" width="14" height="1" fill="#000" />
    <rect x="9" y="14" width="14" height="1" fill="#000" />
    <rect x="9" y="17" width="10" height="1" fill="#000" />
    <rect x="9" y="20" width="14" height="1" fill="#000" />
    <rect x="9" y="23" width="8" height="1" fill="#000" />
    <rect x="7" y="3" width="2" height="26" fill="#dfdfdf" />
  </svg>
{:else if name === 'mine'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <circle cx="16" cy="18" r="9" fill="#000" />
    <rect x="15" y="6" width="2" height="22" fill="#000" />
    <rect x="5" y="17" width="22" height="2" fill="#000" />
    <rect x="8" y="10" width="16" height="16" fill="none" stroke="#000" stroke-width="0" />
    <rect x="11" y="13" width="3" height="3" fill="#fff" />
    <rect x="6" y="14" width="3" height="3" fill="#000" />
    <rect x="23" y="14" width="3" height="3" fill="#000" />
    <rect x="6" y="20" width="3" height="3" fill="#000" />
    <rect x="23" y="20" width="3" height="3" fill="#000" />
    <rect x="14" y="7" width="4" height="2" fill="#f00" />
  </svg>
{:else if name === 'recycle'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <path d="M7 9 L25 9 L23 28 L9 28 Z" fill="#c0c0c0" stroke="#000" />
    <path d="M7 9 L25 9 L24 12 L8 12 Z" fill="#808080" stroke="#000" />
    <rect x="12" y="5" width="8" height="4" fill="#c0c0c0" stroke="#000" />
    <rect x="10" y="14" width="2" height="10" fill="#008080" />
    <rect x="15" y="14" width="2" height="10" fill="#008080" />
    <rect x="20" y="14" width="2" height="10" fill="#008080" />
  </svg>
{:else if name === 'folder'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <path d="M3 8 L12 8 L14 10 L29 10 L29 26 L3 26 Z" fill="#ffcc00" stroke="#000" />
    <path d="M3 11 L29 11 L29 26 L3 26 Z" fill="#ffd84d" stroke="#000" />
  </svg>
{:else if name === 'info'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <circle cx="16" cy="16" r="13" fill="#0000ff" stroke="#000" />
    <circle cx="16" cy="16" r="11" fill="#000080" />
    <rect x="14" y="7" width="4" height="4" fill="#fff" />
    <rect x="14" y="13" width="4" height="12" fill="#fff" />
  </svg>
{:else if name === 'explorer'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <circle cx="16" cy="16" r="12" fill="#fff" stroke="#000" />
    <path d="M16 4 A12 12 0 0 1 28 16 L16 16 Z" fill="#ffcc00" stroke="#000" />
    <path d="M16 16 L28 16 A12 12 0 0 1 16 28 Z" fill="#ff3030" stroke="#000" />
    <path d="M16 16 L16 28 A12 12 0 0 1 4 16 Z" fill="#00b000" stroke="#000" />
    <circle cx="16" cy="16" r="4" fill="#fff" stroke="#000" />
    <circle cx="16" cy="16" r="2" fill="#000" />
  </svg>
{:else if name === 'programs'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <path d="M3 8 L12 8 L14 10 L29 10 L29 26 L3 26 Z" fill="#ffcc00" stroke="#000" />
    <rect x="8" y="14" width="16" height="2" fill="#a06000" />
    <rect x="8" y="18" width="16" height="2" fill="#a06000" />
    <rect x="8" y="22" width="10" height="2" fill="#a06000" />
  </svg>
{:else if name === 'documents'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <path d="M3 8 L12 8 L14 10 L29 10 L29 26 L3 26 Z" fill="#ffcc00" stroke="#000" />
    <rect x="10" y="13" width="12" height="9" fill="#fff" stroke="#000" />
    <rect x="12" y="15" width="8" height="1" fill="#000" />
    <rect x="12" y="17" width="8" height="1" fill="#000" />
    <rect x="12" y="19" width="5" height="1" fill="#000" />
  </svg>
{:else if name === 'settings'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="6" y="6" width="20" height="20" fill="#c0c0c0" stroke="#000" />
    <rect x="8" y="8" width="16" height="16" fill="#808080" />
    <circle cx="16" cy="16" r="6" fill="#c0c0c0" stroke="#000" />
    <circle cx="16" cy="16" r="2" fill="#000" />
  </svg>
{:else if name === 'find'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="4" y="6" width="20" height="16" fill="#fff" stroke="#000" />
    <rect x="4" y="6" width="20" height="3" fill="#000080" />
    <circle cx="20" cy="22" r="6" fill="none" stroke="#000" stroke-width="2" />
    <rect x="24" y="26" width="5" height="2" fill="#000" transform="rotate(-45 24 26)" />
  </svg>
{:else if name === 'help'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="5" y="4" width="20" height="24" fill="#ffff80" stroke="#000" />
    <rect x="9" y="8" width="3" height="3" fill="#000" />
    <rect x="18" y="8" width="3" height="3" fill="#000" />
    <rect x="9" y="13" width="12" height="2" fill="#000" />
    <rect x="14" y="16" width="4" height="6" fill="#000" />
    <rect x="14" y="24" width="4" height="2" fill="#000" />
  </svg>
{:else if name === 'run'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="4" y="6" width="24" height="18" fill="#c0c0c0" stroke="#000" />
    <rect x="4" y="6" width="24" height="3" fill="#000080" />
    <rect x="7" y="13" width="18" height="3" fill="#fff" stroke="#000" />
    <rect x="9" y="14" width="2" height="1" fill="#000" />
  </svg>
{:else if name === 'shutdown'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <path d="M16 4 A12 12 0 1 0 26 22" fill="none" stroke="#000" stroke-width="3" />
    <rect x="14" y="5" width="4" height="12" fill="#000" />
  </svg>
{:else if name === 'drive-c'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="4" y="10" width="24" height="14" fill="#c0c0c0" stroke="#000" />
    <rect x="4" y="10" width="24" height="3" fill="#dfdfdf" />
    <rect x="7" y="16" width="3" height="2" fill="#00b000" />
    <rect x="11" y="16" width="3" height="2" fill="#808080" />
    <rect x="20" y="15" width="6" height="4" fill="#808080" stroke="#000" />
  </svg>
{:else if name === 'floppy'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="5" y="5" width="22" height="22" fill="#000080" stroke="#000" />
    <rect x="9" y="5" width="14" height="9" fill="#dfdfdf" />
    <rect x="18" y="6" width="3" height="7" fill="#000" />
    <rect x="9" y="17" width="14" height="10" fill="#dfdfdf" />
    <rect x="11" y="19" width="10" height="6" fill="#fff" />
  </svg>
{:else if name === 'cd'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="4" y="10" width="24" height="14" fill="#c0c0c0" stroke="#000" />
    <rect x="4" y="10" width="24" height="3" fill="#dfdfdf" />
    <circle cx="22" cy="17" r="4" fill="#dfdfdf" stroke="#000" />
    <circle cx="22" cy="17" r="1.5" fill="#000" />
  </svg>
{:else if name === 'msdos'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="4" y="6" width="24" height="20" fill="#000" stroke="#000" />
    <rect x="6" y="8" width="20" height="16" fill="#fff" />
    <text x="8" y="15" font-family="monospace" font-size="6" fill="#000">C:\\</text>
    <rect x="11" y="18" width="2" height="3" fill="#000" />
  </svg>
{:else if name === 'defrag'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="6" y="6" width="20" height="20" fill="#c0c0c0" stroke="#000" />
    <rect x="8" y="8" width="16" height="16" fill="#008080" />
    <rect x="10" y="11" width="12" height="2" fill="#fff" />
    <rect x="10" y="14" width="9" height="2" fill="#fff" />
    <rect x="10" y="17" width="12" height="2" fill="#fff" />
    <rect x="10" y="20" width="6" height="2" fill="#fff" />
  </svg>
{:else if name === 'control'}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="5" y="6" width="22" height="20" fill="#c0c0c0" stroke="#000" />
    <rect x="8" y="9" width="6" height="6" fill="#000080" />
    <rect x="18" y="9" width="6" height="6" fill="#ffcc00" />
    <rect x="8" y="18" width="6" height="6" fill="#00b000" />
    <rect x="18" y="18" width="6" height="6" fill="#ff3030" />
  </svg>
{:else}
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="6" y="6" width="20" height="20" fill="#c0c0c0" stroke="#000" />
  </svg>
{/if}
