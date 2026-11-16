// Simple outline icons (generic shapes, no brand logos).
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" };
export const InstagramIcon = () => (<svg {...base}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" /></svg>);
export const TikTokIcon = () => (<svg {...base}><path d="M9 12a4 4 0 1 0 4 4V3c.5 2.5 2.5 4.5 5 5" /></svg>);
export const YouTubeIcon = () => (<svg {...base}><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></svg>);
