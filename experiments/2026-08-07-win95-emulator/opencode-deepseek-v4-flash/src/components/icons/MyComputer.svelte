<script>
  let { width = 32, height = 32 } = $props()
</script>

<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" shape-rendering="crispEdges">
  <!-- Monitor -->
  <g transform="translate(2,2)">
    <!-- Monitor bezel -->
    <rect x="0" y="0" width="24" height="19" fill="#c0c0c0"/>
    <rect x="0" y="19" width="24" height="2" fill="#808080"/>
    <rect x="0" y="0" width="1" height="21" fill="#ffffff"/>
    <rect x="23" y="0" width="1" height="21" fill="#808080"/>
    <!-- Screen area -->
    <rect x="2" y="2" width="20" height="15" fill="#008080"/>
    <!-- Screen glare -->
    <rect x="2" y="2" width="20" height="3" fill="#ffffff" opacity="0.35"/>
    <!-- Windows flag on screen -->
    <g transform="translate(5,5)">
      <rect x="0" y="0" width="4.6" height="4.6" fill="#ff0000"/>
      <rect x="5.2" y="0" width="4.6" height="4.6" fill="#00a000"/>
      <rect x="0" y="5.2" width="4.6" height="4.6" fill="#0000c0"/>
      <rect x="5.2" y="5.2" width="4.6" height="4.6" fill="#ffff00"/>
      <rect x="0" y="0" width="1" height="10" fill="#2000a0" opacity="0.3"/>
      <rect x="5" y="0" width="1" height="10" fill="#2000a0" opacity="0.3"/>
      <rect x="0" y="4.8" width="10" height="1" fill="#2000a0" opacity="0.3"/>
      <rect x="0" y="0" width="10" height="1" fill="#2000a0" opacity="0.3"/>
    </g>
    <!-- Power LED -->
    <rect x="11" y="17" width="2" height="1" fill="#00ff00" opacity="0.9"/>
    <!-- Monitor stand -->
    <rect x="8" y="21" width="8" height="2" fill="#c0c0c0"/>
    <rect x="5" y="23" width="14" height="2" fill="#808080"/>
    <rect x="5" y="23" width="1" height="2" fill="#ffffff"/>
  </g>

  <!-- Tower / base computer at bottom right -->
  <g transform="translate(19,20)">
    <rect x="0" y="1" width="11" height="11" fill="#c0c0c0"/>
    <rect x="0" y="12" width="11" height="1" fill="#808080"/>
    <rect x="0" y="1" width="1" height="12" fill="#ffffff"/>
    <rect x="10" y="1" width="1" height="12" fill="#808080"/>
    <!-- Drive bays -->
    <rect x="1" y="2" width="3" height="2" fill="#e8e8e8"/>
    <rect x="5" y="2" width="3" height="2" fill="#e8e8e8"/>
    <rect x="1" y="5" width="9" height="2" fill="#d8d8d8"/>
    <rect x="1" y="8" width="9" height="2" fill="#e8e8e8"/>
    <!-- Power button -->
    <rect x="1" y="11" width="2" height="1" fill="#00ff00"/>
  </g>
</svg>
