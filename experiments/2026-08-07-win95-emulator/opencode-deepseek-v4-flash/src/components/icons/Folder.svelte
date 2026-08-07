<script>
  let { width = 32, height = 32 } = $props()
</script>

<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" shape-rendering="crispEdges">
  <!-- Back of folder -->
  <rect x="7" y="7" width="19" height="20" fill="#d8a520"/>
  <rect x="7" y="7" width="1" height="20" fill="#fff6ca"/>
  <rect x="26" y="7" width="1" height="20" fill="#b08020"/>

  <!-- Folder tab -->
  <path d="M7,7 h10 v5 h-8 c-1,0 -2,-1 -2,-2 Z" fill="#e8b838"/>
  <path d="M7,7 h10 v2 h-10 Z" fill="#fff6ca"/>

  <!-- Front flap (inner folder face) -->
  <path d="M7,13 l0,14 c4,3 16,3 19,0 l0,-14 c-3,-2 -16,-2 -19,0 Z" fill="#e0a828"/>
  <!-- Flap highlight -->
  <path d="M7,13 l0,3 c4,2 16,2 19,0 l0,-3 c-3,-2 -16,-2 -19,0 Z" fill="#f6ce6a" opacity="0.7"/>

  <!-- Document peeking out behind -->
  <rect x="13" y="3" width="9" height="7" fill="#efefef"/>
  <rect x="13" y="3" width="9" height="1" fill="#ffffff"/>
  <g stroke="#909090" stroke-width="0.8">
    <line x1="15" y1="6" x2="20" y2="6"/>
    <line x1="15" y1="8" x2="19" y2="8"/>
  </g>
</svg>
