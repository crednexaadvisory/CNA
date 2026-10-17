/* TO ADD A VIDEO: copy one { ... } block, paste it in the list and change url / title / desc.
   Keep titles educational (e.g. "Understanding…") — avoid words like "Advisory" or "Recommendation". */
const VIDEOS = [
  { url: "https://youtu.be/rJ0a2XPB61k", title: "Understanding Insurance", desc: "A general explainer on how insurance works and the questions to ask. Educational only." },
  { url: "https://youtu.be/L1SpNbiuCkI", title: "Investing Basics", desc: "General principles every first-time investor should understand. Educational only." }
];
(function () {
  var grid = document.getElementById('videoGrid'), empty = document.getElementById('videosEmpty');
  var idOf = function (u) { var m = String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/); return m ? m[1] : null; };
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var list = VIDEOS.filter(function (v) { return idOf(v.url); });
  if (!list.length) { empty.style.display = 'block'; return; }
  grid.innerHTML = list.map(function (v) {
    return '<div class="video-card"><div class="video-frame"><iframe src="https://www.youtube.com/embed/' + idOf(v.url) +
      '" title="' + esc(v.title || 'Video') + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>' +
      '<div class="video-meta"><span class="tag">Educational</span><h3>' + esc(v.title) + '</h3><p>' + esc(v.desc) + '</p></div></div>';
  }).join('');
})();
