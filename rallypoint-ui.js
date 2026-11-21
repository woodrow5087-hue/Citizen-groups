/* Shared original SVG components. The Citizen mark uses the supplied logo pixels. */
window.RallyUI=(()=>{
  const paths={
    plus:'<path d="M12 4v16M4 12h16"/>',
    home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
    group:'<circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M4 5a3 3 0 0 0 0 6m-1 4a5 5 0 0 0-2 4M20 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 2 4"/>',
    team:'<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
    read:'<path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 10h18"/>',
    confirm:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6m-9 8 3 3 6-7"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 6-3 6-3 9h18c0-3-3-3-3-9m-11 13h4"/>',
    pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow:'<path d="m9 5 7 7-7 7"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    close:'<path d="m5 5 14 14M5 19 19 5"/>',
    leader:'<path d="M4 21v-5a5 5 0 0 1 10 0v5M16 13a5 5 0 0 1 5 5v3"/><circle cx="9" cy="6" r="3"/><path d="M17 3a3 3 0 0 1 0 6"/>',
    settings:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
    message:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-7A8 8 0 1 1 21 11Z"/>',
    heart:'<path d="M12 21 4 13a6 6 0 0 1 8-9 6 6 0 0 1 8 9z"/>'
  };
  const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.arrow}</svg>`;
  const contours=(cls='')=>`<svg class="contours ${cls}" viewBox="0 0 280 220" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".9">${[0,1,2,3,4,5].map(i=>`<path d="M${-30+i*14} 238C${-15+i*13} 113 ${78+i*10} 7 ${179+i*9} 12S291 0 302 -43"/>`).join('')}</g></svg>`;
  function architecture(kind){return `<svg class="feature-art" viewBox="0 0 230 205" aria-hidden="true"><circle cx="157" cy="105" r="85" fill="#BF5B45"/><path d="M37 184 142 87l83 48v70H37Z" fill="#D5BEA4" stroke="#131818" stroke-width="2"/><path d="m142 87 1 118H37v-21Z" fill="#DAC4AA" stroke="#171C1C" stroke-width="2"/><path d="m146 89 79 46v70h-79Z" fill="#313A35" stroke="#131818" stroke-width="2"/><g stroke="#AD967D" stroke-width="1">${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${47+i*12} ${175-i*11}v70"/>`).join('')}</g>${kind==='group'?'<path d="M112 124v53m-12-37 24-20" fill="none" stroke="#252926" stroke-width="5"/>':'<path d="M93 160h27v45H93z" fill="#4A534B" stroke="#252926" stroke-width="2"/><path d="M98 184h3" stroke="#F3E5D6" stroke-width="2"/>'}<path d="M143 87 37 183" fill="none" stroke="#FCF7F0" stroke-width="2" opacity=".5"/></svg>`;}
  const leaves=()=>`<svg class="reading-art" viewBox="0 0 160 170" aria-hidden="true"><path d="M22 173c39-46 51-84 58-143" stroke="#536358" stroke-width="3" fill="none"/><g fill="#536358"><path d="M67 96C28 90 33 54 34 35c24 13 40 30 33 61Z"/><path d="M73 72c-4-33 16-50 30-63 3 28-5 50-30 63Z"/><path d="M54 132c7-36 45-35 66-30-16 24-35 38-66 30Z"/><path d="M42 145c-37-4-37-31-36-49 24 7 37 20 36 49Z"/></g></svg>`;
  return {icon,contours,architecture,leaves};
})();
