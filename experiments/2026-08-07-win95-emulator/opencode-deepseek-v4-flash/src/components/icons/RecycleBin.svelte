<script>
  let { width = 32, height = 32 } = $props()
</script>

<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" shape-rendering="crispEdges">
  <!-- Basket body -->
  <g transform="translate(6,6)">
    <!-- Rounded metal bin -->
    <path d="M18,0 L18,11 C18,14 2,14 2,11 L2,0 Z" fill="#d0d0d0"/>
    <!-- Bin highlight -->
    <path d="M6,1 L6,11 C6,12.3 3,12.6 3,11.4 L3,2 Z" fill="#ffffff"/>
    <path d="M17,1 L17,11 C17,11.8 15,11.9 15,11.2 L15,2 Z" fill="#a8a8a8"/>
    <!-- Bin rim -->
    <rect x="1" y="0" width="18" height="2" fill="#c0c0c0"/>
    <rect x="1" y="0" width="2" height="2" fill="#ffffff"/>
    <rect x="18" y="0" width="1" height="2" fill="#808080"/>
    <!-- Vertical wire creases -->
    <rect x="5" y="2" width="1" height="10" fill="#b8b8b8" opacity="0.6"/>
    <rect x="10" y="2" width="1" height="11" fill="#b8b8b8" opacity="0.6"/>
    <rect x="15" y="2" width="1" height="11" fill="#b8b8b8" opacity="0.6"/>
    <rect x="8" y="2" width="1" height="11" fill="#f0f0f0" opacity="0.5"/>
    <rect x="13" y="2" width="1" height="11" fill="#f0f0f0" opacity="0.5"/>

    <!-- Recycling symbol (three green arrows forming a triangle) -->
    <g transform="translate(6,4.5)">
      <!-- top arrow pointing down-left -->
      <path d="M4.2,0.3 L2.4,5.2 L3.4,5.2 L3.0,7.0 L5.6,4.6 L4.9,4.6 L6.4,0.3 Z" fill="#00b000"/>
      <!-- left arrow pointing right-down -->
      <path d="M0.4,3.4 L5.2,5.0 L5.2,4.0 L7.0,4.2 L4.4,1.8 L4.4,2.5 L0.4,2.5 Z" fill="#008800"/>
    </g>
  </g>

  <!-- Waste paper spilling/behind -->
  <g transform="translate(2,2)" opacity="0.95">
    <rect x="2" y="1" width="5" height="4" fill="#ffffff" stroke="#a0a0a0" stroke-width="0.5"/>
  </g>
</svg>
