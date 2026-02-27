/* Font Awesome CSS - Placeholder */
/* This is a placeholder file. You should replace this with the actual Font Awesome CSS */

@font-face {
  font-family: "Font Awesome 6 Free";
  font-style: normal;
  font-weight: 900;
  font-display: block;
  src: url("data:font/woff2;base64,PLACEHOLDER") format("woff2");
}

@font-face {
  font-family: "Font Awesome 6 Brands";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("data:font/woff2;base64,PLACEHOLDER") format("woff2");
}

.fa-solid,
.fas {
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
}

.fa-brands,
.fab {
  font-family: "Font Awesome 6 Brands";
  font-weight: 400;
}

/* Basic icon styles */
.fa-solid::before,
.fas::before {
  content: "\f0c8"; /* Default icon */
}

.fa-brands::before,
.fab::before {
  content: "\f39e"; /* Default brand icon */
}

/* Specific icon mappings */
.fa-dumbbell::before { content: "\f44b"; }
.fa-rss::before { content: "\f09e"; }
.fa-universal-access::before { content: "\f29a"; }
.fa-magnifying-glass-plus::before { content: "\f00e"; }
.fa-magnifying-glass::before { content: "\f002"; }
.fa-pause::before { content: "\f04c"; }
.fa-circle-exclamation::before { content: "\f06a"; }
.fa-clock::before { content: "\f017"; }
.fa-list-ol::before { content: "\f0cb"; }
.fa-salesforce::before { content: "\f83b"; } 