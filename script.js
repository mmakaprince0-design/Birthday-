/* Birthday card: photo ring, music-reactive animation, letter reveal.
   Photo placement data: src = file, nw/nh = pixel size, fx/fy = where the face sits (0-1), z = how much of the photo width shows. */
/* EDIT THESE: write each file name exactly as it appears in your GitHub repository.
   Capital letters, dots and the ending (.jpg, .jpeg, .png, .mp3) all have to match. */
var FILES={
  photo1:'IMG-20261013-WA0001.jpg',   /* sofa photo (top panel) */
  photo2:'IMG-20261013-WA0004.jpg',   /* black sweater (upper left) */
  photo3:'IMG-20261013-WA0006.jpg',   /* white shirt (upper right) */
  photo4:'IMG-20261013-WA0003.jpg',   /* couple in the mirror (lower left) */
  photo5:'IMG-20261013-WA0005.jpg',   /* boat (lower right) */
  cutout:'1000044346.png',            /* the cutout in the middle */
  music:'AUD-20261013-WA0007.mp3'
};
var PHOTOS={
  "p0": {"src": FILES.photo1, "nw": 810, "nh": 1080, "fx": 0.484, "fy": 0.556, "z": 0.6},
  "p1": {"src": FILES.photo2, "nw": 700, "nh": 933, "fx": 0.62, "fy": 0.33, "z": 0.45},
  "p2": {"src": FILES.photo3, "nw": 700, "nh": 933, "fx": 0.59, "fy": 0.58, "z": 0.5},
  "p3": {"src": FILES.photo4, "nw": 900, "nh": 1200, "fx": 0.42, "fy": 0.51, "z": 0.55},
  "p4": {"src": FILES.photo5, "nw": 774, "nh": 1032, "fx": 0.36, "fy": 0.5, "z": 0.8}
};

(function(){
  var NS='http://www.w3.org/2000/svg', C={x:368,y:402}, RI=133, RO=284;
  var PANELS=[[-135,-45],[-180,-135],[-45,0],[128,180],[0,52]];
  var ring=document.getElementById('ring'), defs=document.getElementById('defs'), stage=document.getElementById('stage');
  var file=document.getElementById('file'), cur=null, slots=[];
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
  function pt(a,r){var t=a*Math.PI/180;return [C.x+r*Math.cos(t),C.y+r*Math.sin(t)]}
  function pick(img,box){cur={img:img,box:box};file.click()}
  function key(f){return function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}}

  PANELS.forEach(function(pa,i){
    var a0=pa[0],a1=pa[1],o0=pt(a0,RO),o1=pt(a1,RO),i1=pt(a1,RI),i0=pt(a0,RI);
    var d='M'+o0[0]+' '+o0[1]+'A'+RO+' '+RO+' 0 0 1 '+o1[0]+' '+o1[1]+'L'+i1[0]+' '+i1[1]+'A'+RI+' '+RI+' 0 0 0 '+i0[0]+' '+i0[1]+'Z';
    var g=el('g',{class:'slice',style:'transition-delay:'+(i*110)+'ms'},ring);
    var cp=el('clipPath',{id:'cp'+i},defs);el('path',{d:d},cp);
    el('path',{d:d,fill:'#4f2820'},g);
    var xs=[],ys=[];
    for(var a=a0;a<=a1;a+=3){[RI,RO].forEach(function(r){var q=pt(a,r);xs.push(q[0]);ys.push(q[1])})}
    var x=Math.min.apply(0,xs),y=Math.min.apply(0,ys),bw=Math.max.apply(0,xs)-x,bh=Math.max.apply(0,ys)-y;
    var img=el('image',{x:x,y:y,width:bw,height:bh,preserveAspectRatio:'xMidYMid slice','clip-path':'url(#cp'+i+')'},g);
    var m=pt((a0+a1)/2,(RI+RO)/2),plus=el('text',{x:m[0],y:m[1],class:'plus','text-anchor':'middle','dominant-baseline':'central'},g);
    plus.textContent='+';
    el('path',{d:d,fill:'none',stroke:'#fff','stroke-width':10,'stroke-linejoin':'round','pointer-events':'none'},g);
    var hit=el('path',{d:d,fill:'transparent',class:'hit',tabindex:0,role:'button','aria-label':'Add photo'},g);
    var box={x:x,y:y,w:bw,h:bh};
    hit.addEventListener('click',function(){pick(img,box);cur.hint=plus});
    hit.addEventListener('keydown',key(function(){pick(img,box);cur.hint=plus}));
    slots[i]={img:img,hint:plus,bx:x,by:y,bw:bw,bh:bh,mx:m[0],my:m[1]};
  });

  var mainImg=document.getElementById('mainImg'),mainHit=document.getElementById('mainHit');
  mainImg.setAttribute('href',FILES.cutout);
  var mbox={x:148,y:409,w:440,h:586};
  mainHit.addEventListener('click',function(){pick(mainImg,mbox)});
  mainHit.addEventListener('keydown',key(function(){pick(mainImg,mbox)}));
  file.addEventListener('change',function(){
    var f=file.files[0];if(!f||!cur)return;var r=new FileReader(),t=cur;
    r.onload=function(){
      var im=t.img,b=t.box;im.setAttribute('x',b.x);im.setAttribute('y',b.y);im.setAttribute('width',b.w);im.setAttribute('height',b.h);
      im.setAttribute('preserveAspectRatio',b.h>400?'xMidYMin slice':'xMidYMid slice');im.setAttribute('href',r.result);
      if(t.hint)t.hint.style.display='none';
    };
    r.readAsDataURL(f);file.value='';
  });

  /* preloaded photos */
  var PR=PHOTOS;
  slots.forEach(function(s,i){
    var p=PR['p'+i];if(!p)return;
    var sc=Math.max(s.bw/(p.z*p.nw),s.bh/p.nh),iw=p.nw*sc,ih=p.nh*sc;
    var x=Math.min(s.bx,Math.max(s.bx+s.bw-iw,s.mx-p.fx*iw)),y=Math.min(s.by,Math.max(s.by+s.bh-ih,s.my-p.fy*ih));
    var im=s.img;im.setAttribute('x',x);im.setAttribute('y',y);im.setAttribute('width',iw);im.setAttribute('height',ih);
    im.setAttribute('preserveAspectRatio','none');im.setAttribute('href',p.src);s.hint.style.display='none';
  });

  /* floating dots */
  var bk=document.getElementById('bokeh');
  for(var j=0;j<12;j++){
    var s=document.createElement('div'),z=.6+Math.random()*1.3;
    s.className='dot';s.style.cssText='left:'+(Math.random()*96)+'%;top:'+(45+Math.random()*55)+'%;width:'+z+'cqw;height:'+z+'cqw;animation-duration:'+(9+Math.random()*10)+'s;animation-delay:-'+(Math.random()*12)+'s';
    bk.appendChild(s);
  }

  /* letter: reveal on scroll, floating hearts */
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.2});
    rv.forEach(function(n){io.observe(n)});
  }else rv.forEach(function(n){n.classList.add('in')});
  var hs=document.getElementById('hearts');
  for(var k=0;k<16;k++){
    var hi=document.createElement('i');hi.textContent='♥';
    hi.style.cssText='left:'+(Math.random()*94)+'%;top:'+(10+Math.random()*85)+'%;font-size:'+(.8+Math.random()*.9)+'rem;animation-duration:'+(10+Math.random()*9)+'s;animation-delay:-'+(Math.random()*14)+'s';
    hs.appendChild(hi);
  }

  /* music: the uploaded track, looped */
  var ac,master,analyser,data,muted=false,lv=0,fallback=null;
  function startMusic(){
    ac=new (window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();master.gain.value=0;
    analyser=ac.createAnalyser();analyser.fftSize=256;data=new Uint8Array(analyser.frequencyBinCount);
    master.connect(analyser);analyser.connect(ac.destination);ac.resume();
    function plain(){ /* fallback: simple looping audio (no beat-reactive animation) */
      fallback=new Audio(FILES.music);fallback.loop=true;fallback.volume=muted?0:.9;fallback.play();
    }
    fetch(FILES.music).then(function(r){return r.arrayBuffer()}).then(function(ab){
      ac.decodeAudioData(ab,function(buf){
        var src=ac.createBufferSource();src.buffer=buf;src.loop=true;src.connect(master);src.start();
        master.gain.linearRampToValueAtTime(muted?0:.9,ac.currentTime+2);
      },plain);
    }).catch(plain);
  }
  (function tick(){
    if(analyser){
      analyser.getByteFrequencyData(data);var s=0;for(var i=0;i<20;i++)s+=data[i];
      lv+=((s/20/255)*1.6-lv)*.12;
    }
    stage.style.setProperty('--lv',Math.min(lv,1).toFixed(3));
    requestAnimationFrame(tick);
  })();

  var gate=document.getElementById('gate'),mute=document.getElementById('mute');
  document.getElementById('open').addEventListener('click',function(){
    gate.classList.add('off');stage.classList.add('go');mute.hidden=false;startMusic();
  });
  mute.addEventListener('click',function(){
    muted=!muted;master.gain.linearRampToValueAtTime(muted?0:.9,ac.currentTime+.3);
    if(fallback)fallback.volume=muted?0:.9;
    mute.textContent=muted?'Unmute':'Mute';
  });
})();
