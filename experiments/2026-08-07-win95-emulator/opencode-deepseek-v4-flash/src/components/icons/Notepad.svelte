<script>
  let { width = 32, height = 32 } = $props()
</script>

<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" shape-rendering="crispEdges">
  <!-- Back page shadow -->
  <rect x="14" y="8" width="2" height="19" fill="#909090" opacity="0.5"/>
  <rect x="16" y="9" width="2" height="18" fill="#a0a0a0" opacity="0.5"/>

  <!-- Spiral binding ring at top -->
  <g fill="none" stroke="#708090" stroke-width="1.5">
    <circle cx="9" cy="4" r="1.6"/>
    <circle cx="16" cy="4" r="1.6"/>
    <circle cx="23" cy="4" r="1.6"/>
  </g>

  <!-- Main notepad page -->
  <rect x="6" y="4" width="20" height="24" fill="#fffff0"/>
  <!-- Page highlight edge -->
  <rect x="6" y="4" width="20" height="1.5" fill="#ffffff"/>
  <rect x="6" y="27" width="20" height="1" fill="#c0c0c0"/>

  <!-- Folded page corner (top right) -->
  <path d="M26,6 L22,6 L22,10 Z" fill="#e8e8e8"/>
  <path d="M26,6 L22,10 L26,10 Z" fill="#d0d0d0"/>

  <!-- Blue ruled lines -->
  <g stroke="#6ea8dc" stroke-width="0.8" opacity="0.85">
    <line x1="8" y1="11" x2="24" y2="11"/>
    <line x1="8" y1="14" x2="24" y2="14"/>
    <line x1="8" y1="17" x2="24" y2="17"/>
    <line x1="8" y1="20" x2="24" y2="20"/>
    <line x1="8" y1="23" x2="24" y2="23"/>
  </g>

  <!-- Red vertical margin line -->
  <line x1="11" y1="8" x2="11" y2="26" stroke="#ff6060" stroke-width="0.7"/>

  <!-- Text scribble -->
  <g stroke="#202020" stroke-width="1" stroke-linecap="round" fill="none">
    <path d="M12,11.6 h6" opacity="0.5"/>
    <path d="M12,14.6 h8" opacity="0.5"/>
    <path d="M12,17.6 h5" opacity="0.5"/>
  </g>
</svg>
