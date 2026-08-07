<script>
  let { width = 32, height = 32 } = $props()
</script>

<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" shape-rendering="crispEdges">
  <!-- Background plate -->
  <rect x="2" y="2" width="28" height="28" fill="#c6c6c6"/>
  <rect x="2" y="2" width="28" height="1" fill="#e8e8e8"/>
  <rect x="2" y="29" width="28" height="1" fill="#8a8a8a"/>

  <!-- Mine: metallic ball -->
  <circle cx="16" cy="17" r="11" fill="#8a8f98"/>
  <!-- Spherical shading -->
  <circle cx="16" cy="17" r="11" fill="none" stroke="#5a5f68" stroke-width="1"/>
  <!-- Highlights (top-left light) -->
  <ellipse cx="12" cy="12.5" rx="5" ry="3.5" fill="#d8dde4" opacity="0.9"/>
  <ellipse cx="11.5" cy="11.5" rx="2" ry="1.4" fill="#ffffff"/>
  <!-- Bottom shadow -->
  <path d="M8,24 a11,11 0 0 0 16,0 Z" fill="#50555e" opacity="0.5"/>

  <!-- Warning spike/stud at top -->
  <circle cx="16" cy="5" r="2.4" fill="#e0e4e8"/>
  <circle cx="16" cy="5" r="2.4" fill="none" stroke="#70767e" stroke-width="0.8"/>
  <circle cx="15.2" cy="4.2" r="0.9" fill="#ffffff"/>

  <!-- Small studs around -->
  <g fill="#c0c6ce" stroke="#6a7078" stroke-width="0.6">
    <circle cx="23" cy="10" r="1.2"/>
    <circle cx="9" cy="9.5" r="1.2"/>
    <circle cx="23.5" cy="22" r="1.2"/>
    <circle cx="8.5" cy="21.5" r="1.2"/>
  </g>
</svg>
