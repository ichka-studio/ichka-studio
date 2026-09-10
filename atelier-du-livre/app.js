const PAGE_TEMPLATE={
  name:'Image + texte 01',kind:'Image + texte',surface:'interior',img:null,imgName:'',imgW:null,imgH:null,img2:null,img2Name:'',img2W:null,img2H:null,imgShape:'none',imgShapeAmount:50,imgFrame:1,imgFrameLock:false,img2Shape:'none',img2ShapeAmount:50,img2Frame:1,img2FrameLock:false,imgFit:'fill',imgZoom:100,imgX:0,imgY:0,imgInset:8,imgRule:false,imgRot:0,img2Fit:'fill',img2Zoom:100,img2X:0,img2Y:0,img2Inset:8,img2Rule:false,img2Rot:0,topImg:null,topImgName:'',topImgW:null,topImgH:null,topImgSlot:'img',topImgX:0,topImgY:0,topImgSize:36,topImgRot:0,topImgOpacity:100,topImgRule:false,panoSep:'band',panoColor:'#F7F3EA',panoWidth:18,panoOpacity:24,hue:'#2F3B2E',rule:'#8A6D23',ruleStyle:'none',ruleWeight:2,filetV:2,ruleLength:40,ruleX:50,ruleY:50,intensity:28,side:'left',kick:'SÉRIE 01',chapt:'chapitre premier',
  serie:"Titre de cette page",tsize:34,intro:'Une courte légende ou un texte de présentation pour cette double page.',
  coverBackKick:'NOM DE L’AUTEUR',coverBackTitle:"Phrase d'accroche",coverBackText:'Un espace pour le résumé, une phrase forte, les crédits courts ou une trace graphique.',spineText:'Titre du livre',
  margin:20,paper:'#F7F3EA',layout:'galerie',textWidth:78,textX:0,textY:0,textGap:12,textAlign:'left',titleFont:'playfair',bodyFont:'inter',bodySize:11
};

let TRIM_W_MM=203.2;
let TRIM_H_MM=254;
let BLEED_MM=3.2;
const PRINT_DPI=300;
let KDP_SAFE_OUT_MM=9.6;
const PREMIUM_COLOR_SPINE_MM=0.0596;

const BOOK_FORMATS={
  square:{label:'Carré',w:210,h:210,desc:'21 × 21 cm'},
  pocket:{label:'Poche',w:127,h:203.2,desc:'12,7 × 20,3 cm'},
  digest:{label:'Digest',w:139.7,h:215.9,desc:'14 × 21,6 cm'},
  standard:{label:'Standard',w:152.4,h:228.6,desc:'15,2 × 22,9 cm'},
  photo:{label:'Photo',w:203.2,h:254,desc:'20,3 × 25,4 cm'},
  large:{label:'Grand',w:215.9,h:279.4,desc:'21,6 × 27,9 cm'},
  a4:{label:'A4',w:210,h:297,desc:'21 × 29,7 cm'},
  landscape:{label:'Paysage',w:254,h:203.2,desc:'25,4 × 20,3 cm'},
  panoramic:{label:'Panoramique',w:297,h:210,desc:'29,7 × 21 cm'}
};

function applyBookFormat(key){
  const fmt=BOOK_FORMATS[key];
  if(!fmt)return;
  TRIM_W_MM=fmt.w;
  TRIM_H_MM=fmt.h;
  updateFormatUI();
}
function applyCustomFormat(){
  const w=parseFloat(el('formatW').value);
  const h=parseFloat(el('formatH').value);
  if(!Number.isFinite(w)||!Number.isFinite(h)||w<80||h<80)return;
  TRIM_W_MM=w;
  TRIM_H_MM=h;
  updateFormatUI();
}
function applyCustomMargins(){
  const b=parseFloat(el('bleedInput').value);
  const s=parseFloat(el('safeInput').value);
  if(Number.isFinite(b)&&b>=0&&b<=10)BLEED_MM=b;
  if(Number.isFinite(s)&&s>=0&&s<=25)KDP_SAFE_OUT_MM=s;
  updateFormatUI();
}
// Les pages intérieures sont dessinées fond perdu compris, comme la couverture :
// l'image déborde de BLEED_MM au-delà du trait de coupe, sur les bords extérieurs
// et en haut et en bas. Rien côté reliure, qui n'est jamais massicoté.
function innerMetrics(pages=2){
  const trimW=TRIM_W_MM*pages;
  // Une double page a un bord extérieur à gauche et à droite ; une page seule
  // en a un de chaque côté aussi, puisqu'elle est livrée isolée.
  const totalW=trimW+BLEED_MM*2;
  const totalH=TRIM_H_MM+BLEED_MM*2;
  return {trimW,totalW,totalH,ratio:totalW/totalH};
}
function updateFormatUI(){
  const pageRatio=TRIM_W_MM/TRIM_H_MM;
  const m=innerMetrics(2);
  const seule=innerMetrics(1);
  document.documentElement.style.setProperty('--page-ratio',pageRatio.toFixed(4));
  document.documentElement.style.setProperty('--spread-ratio',m.ratio.toFixed(4));
  document.documentElement.style.setProperty('--single-ratio',seule.ratio.toFixed(4));
  // Un remplissage en pourcentage se calcule toujours sur la largeur du bloc
  // conteneur — ici la double page entière — et cela vaut aussi pour le haut et
  // le bas : une seule valeur suffit donc pour les quatre côtés.
  document.documentElement.style.setProperty('--bleed-x',(BLEED_MM/m.totalW*100).toFixed(4)+'%');
  // Décalage du contenu vers l'intérieur du trait de coupe. Un élément placé en
  // absolu se repère sur la boîte entière de sa page : ces pourcentages se
  // comptent donc sur la page fond perdu compris, largeur pour les côtés,
  // hauteur pour le haut et le bas.
  document.documentElement.style.setProperty('--bp-x',(BLEED_MM/(TRIM_W_MM+BLEED_MM)*100).toFixed(4)+'%');
  document.documentElement.style.setProperty('--bp-y',(BLEED_MM/m.totalH*100).toFixed(4)+'%');
  document.documentElement.style.setProperty('--bp-pano',(BLEED_MM/m.totalW*100).toFixed(4)+'%');
  document.documentElement.style.setProperty('--bp-single',(BLEED_MM/seule.totalW*100).toFixed(4)+'%');
  document.documentElement.style.setProperty('--bleed-y',(BLEED_MM/m.totalH*100).toFixed(4)+'%');
  document.documentElement.style.setProperty('--bleed-x-single',(BLEED_MM/seule.totalW*100).toFixed(4)+'%');
  el('formatW').value=TRIM_W_MM;
  el('formatH').value=TRIM_H_MM;
  el('bleedInput').value=BLEED_MM;
  el('safeInput').value=KDP_SAFE_OUT_MM;
  el('formatDesc').textContent=`${(TRIM_W_MM/10).toFixed(1)} × ${(TRIM_H_MM/10).toFixed(1)} cm — ratio ${pageRatio.toFixed(2)}`;
  const btns=[...document.querySelectorAll('#formatPresets button')];
  btns.forEach(b=>{
    const f=BOOK_FORMATS[b.dataset.format];
    b.classList.toggle('on',f&&f.w===TRIM_W_MM&&f.h===TRIM_H_MM);
  });
  renderPrintReadout();
  refresh();
}

const PRESETS={
  fullCover:{name:'Couverture double',kind:'Couverture double',surface:'cover-wrap',hue:'#2F3B2E',rule:'#C9A24B',ruleStyle:'none',ruleWeight:1,intensity:28,side:'left',kick:'NOM DE L’AUTEUR',coverBackKick:'NOM DE L’AUTEUR',chapt:"Recueil d'illustrations",serie:'Titre du livre',tsize:46,intro:"Un espace pour le résumé, une phrase forte, les crédits courts ou une trace graphique.",coverBackTitle:"Phrase d'accroche",coverBackText:"Un espace pour le résumé, une phrase forte, les crédits courts ou une trace graphique.",spineText:'Titre du livre',margin:18,paper:'#F7F3EA',layout:'coverwrap',textWidth:76,textX:0,textY:0,textAlign:'left',frontTextWidth:76,frontTextX:0,frontTextY:0,frontTextGap:12,frontTextAlign:'left',backTextWidth:76,backTextX:0,backTextY:0,backTextGap:12,backTextAlign:'left',bodySize:11},
  cover:{name:'Couverture recto',kind:'Couverture recto',surface:'cover-front',hue:'#2F3B2E',rule:'#C9A24B',ruleStyle:'none',ruleWeight:1,intensity:28,side:'left',kick:'NOM DE L’AUTEUR',chapt:"Recueil d'illustrations",serie:'Titre du livre',tsize:48,intro:"Monographie d'images, de silences et de couleurs.",margin:18,paper:'#F7F3EA',layout:'galerie',textWidth:76,textX:0,textY:0,textAlign:'left',bodySize:11},
  insideFront:{name:'Début du livre',kind:'Début du livre',surface:'inside-front',hue:'#2F3B2E',rule:'#C9A24B',ruleStyle:'none',ruleWeight:2,intensity:28,side:'left',kick:'OUVERTURE',chapt:'première page',serie:'Entrer dans le livre',tsize:34,intro:"Un seuil, un silence, une promesse de regard.",margin:20,paper:'#F7F3EA',layout:'galerie',textGap:12,bodySize:11},
  falseTitle:{name:'Petit titre',kind:'Petit titre',surface:'interior',hue:'#2F3B2E',rule:'#111111',ruleStyle:'none',ruleWeight:1,intensity:28,side:'left',kick:'',chapt:'',serie:'Titre du livre',tsize:34,intro:'',margin:20,paper:'#F7F3EA',layout:'galerie',textGap:12,bodySize:11},
  preface:{name:'Page texte',kind:'Page texte',surface:'interior',hue:'#2F3B2E',rule:'#B96565',ruleStyle:'none',ruleWeight:1,intensity:28,side:'left',kick:'OUVERTURE',chapt:'avant les images',serie:'Entrer doucement',tsize:34,intro:"Une note d'ouverture pour poser le regard, le rythme et la matière du livre.",margin:20,paper:'#F7F3EA',layout:'galerie',textWidth:78,textX:0,textY:0,textGap:12,textAlign:'left',bodySize:11},
  title:{name:'Titre simple',kind:'Titre simple',surface:'interior',hue:'#2F3B2E',rule:'#1F6F68',ruleStyle:'none',ruleWeight:1,intensity:28,side:'left',kick:'NOM DE L’AUTEUR',chapt:"Recueil d'illustrations",serie:'Titre du livre',tsize:34,intro:'Images, séries et fragments réunis dans une même coquille.',margin:20,paper:'#F7F3EA',layout:'galerie',textGap:12,bodySize:11},
  manifesto:{name:'Intention',kind:'Intention',surface:'interior',hue:'#2F3B2E',rule:'#7A9E7E',ruleStyle:'none',ruleWeight:2,intensity:28,side:'right',kick:'INTENTION',chapt:'coquille constante',serie:'Univers variables',tsize:34,intro:"Grille calme, images fortes, couleur unique par série. Le livre avance par respirations plutôt que par démonstration.",margin:20,paper:'#F7F3EA',layout:'galerie',textGap:12,bodySize:11},
  series:{name:'Image + texte',kind:'Image + texte',surface:'interior',hue:'#2F3B2E',rule:'#6A2C5A',ruleStyle:'none',ruleWeight:2,intensity:28,side:'left',kick:'SÉRIE 01',chapt:'chapitre premier',serie:"Titre de cette page",tsize:34,intro:'Une courte légende ou un texte de présentation pour cette double page.',margin:20,paper:'#F7F3EA',layout:'galerie',textWidth:78,textX:0,textY:0,textGap:12,textAlign:'left',bodySize:11},
  dual:{name:'Deux images',kind:'Deux images',surface:'interior',hue:'#2F3B2E',rule:'#C9A24B',ruleStyle:'none',ruleWeight:1,intensity:28,side:'left',kick:'',chapt:'',serie:'',tsize:34,intro:'',margin:20,paper:'#F7F3EA',layout:'dual',textWidth:78,textX:0,textY:0,textGap:12,textAlign:'left',bodySize:11},
  panorama:{name:'Grande image',kind:'Grande image',surface:'interior',hue:'#2F3B2E',rule:'#C9A24B',ruleStyle:'none',ruleWeight:1,panoSep:'band',panoColor:'#F7F3EA',panoWidth:18,panoOpacity:24,intensity:28,side:'left',kick:'',chapt:'',serie:'',tsize:34,intro:'',margin:20,paper:'#F7F3EA',layout:'panorama',textWidth:78,textX:0,textY:0,textGap:12,textAlign:'left',bodySize:11},
  plate:{name:'Image seule',kind:'Image seule',surface:'interior',hue:'#2F3B2E',rule:'#355C7D',ruleStyle:'none',ruleWeight:2,intensity:28,side:'left',kick:'IMAGE',chapt:'image seule',serie:'Titre de cette page',tsize:34,intro:'',margin:20,paper:'#F7F3EA',layout:'galerie',textGap:12,bodySize:11},
  breath:{name:'Pause',kind:'Pause',surface:'interior',hue:'#2F3B2E',rule:'#E8DCC4',ruleStyle:'none',ruleWeight:1,intensity:28,side:'left',kick:'',chapt:'',serie:'',tsize:34,intro:'',margin:20,paper:'#F7F3EA',layout:'galerie',textGap:12,bodySize:11},
  colophon:{name:'Crédits',kind:'Crédits',surface:'interior',hue:'#2F3B2E',rule:'#111111',ruleStyle:'none',ruleWeight:1,intensity:28,side:'left',kick:'CRÉDITS',chapt:'fabrication',serie:"Phrase d'accroche",tsize:34,intro:'Direction artistique, images, essais couleur, papiers, crédits et notes de fabrication.',margin:20,paper:'#F7F3EA',layout:'galerie',textGap:12,bodySize:11},
  interior:{name:'Pages intérieures',kind:'Image + texte',surface:'interior',hue:'#2F3B2E',rule:'#6A2C5A',ruleStyle:'none',ruleWeight:2,intensity:28,side:'left',kick:'SÉRIE 01',chapt:'chapitre premier',serie:"Titre de cette page",tsize:34,intro:'Une courte légende ou un texte de présentation pour cette double page.',margin:20,paper:'#F7F3EA',layout:'galerie',textWidth:78,textX:0,textY:0,textGap:12,textAlign:'left',bodySize:11},
  insideBack:{name:'Fin du livre',kind:'Fin du livre',surface:'inside-back',hue:'#2F3B2E',rule:'#B96565',ruleStyle:'none',ruleWeight:2,intensity:28,side:'right',kick:'FIN',chapt:'dernière page',serie:'Dernier regard',tsize:34,intro:"Notes finales, image retenue, respiration avant la sortie.",margin:20,paper:'#F7F3EA',layout:'galerie',textWidth:78,textX:0,textY:0,textGap:12,textAlign:'left',bodySize:11},
  backCover:{name:'Couverture verso',kind:'Couverture verso',surface:'cover-back',hue:'#2F3B2E',rule:'#C9A24B',ruleStyle:'none',ruleWeight:1,intensity:28,side:'right',kick:'NOM DE L’AUTEUR',chapt:'quatrième de couverture',serie:'Titre du livre',tsize:34,intro:"Un dernier espace pour le résumé, les crédits courts ou une trace graphique.",margin:18,paper:'#F7F3EA',layout:'galerie',textWidth:76,textX:0,textY:0,textAlign:'left',bodySize:11}
};

/* Un seul filet, fin, posé où l'on veut : les catalogues de cadres et de motifs
   ont été retirés — ornements datés qui entraient en concurrence avec l'image. */
/* Toutes les polices proposées sont chargées avec le studio : le menu ne propose
   plus rien qui retomberait en silence sur un substitut au moment de l'impression.
   Seule Georgia est une police système, présente partout. */
const FONT_STACKS={
  playfair:"'Playfair Display', Georgia, serif",
  bodoni:"'Bodoni Moda', 'Playfair Display', Georgia, serif",
  cinzel:"Cinzel, 'Times New Roman', serif",
  fraunces:"Fraunces, Georgia, serif",
  cormorant:"'Cormorant Garamond', Georgia, serif",
  ebgaramond:"'EB Garamond', Georgia, serif",
  cardo:"Cardo, Georgia, serif",
  crimson:"'Crimson Text', Georgia, serif",
  libre:"'Libre Baskerville', Georgia, serif",
  spectral:"Spectral, Georgia, serif",
  lora:"Lora, Georgia, serif",
  imfell:"'IM Fell English', Georgia, serif",
  unifraktur:"'UnifrakturCook', 'IM Fell English', Georgia, serif",
  georgia:"Georgia, 'Times New Roman', serif",
  jost:"Jost, 'Century Gothic', sans-serif",
  work:"'Work Sans', 'Segoe UI', sans-serif",
  archivo:"Archivo, 'Segoe UI', Arial, sans-serif",
  inter:"'Inter', 'Segoe UI', Arial, sans-serif"
};
const TITLE_FONTS={...FONT_STACKS};
const BODY_FONTS={...FONT_STACKS};
/* Ordre du menu, et donc ordre parcouru à la molette : les polices d'affichage,
   puis celles de texte courant, puis les typées, puis les sans empattement. */
const TEXT_FONT_OPTIONS=[
  ['playfair','Playfair Display'],
  ['bodoni','Bodoni Moda'],
  ['cinzel','Cinzel'],
  ['fraunces','Fraunces'],
  ['cormorant','Cormorant Garamond'],
  ['ebgaramond','EB Garamond'],
  ['cardo','Cardo'],
  ['crimson','Crimson Text'],
  ['libre','Libre Baskerville'],
  ['spectral','Spectral'],
  ['lora','Lora'],
  ['imfell','IM Fell English'],
  ['unifraktur','Gothique'],
  ['georgia','Georgia'],
  ['jost','Jost'],
  ['work','Work Sans'],
  ['archivo','Archivo'],
  ['inter','Inter']
];
const TEXT_TARGETS={
  kick:{label:'Mention',fontGroup:'body',size:8,bold:false,italic:false,upper:true,leading:1.3},
  coverBackKick:{label:'Mention verso',fontGroup:'body',size:8,bold:false,italic:false,upper:true,leading:1.3},
  chapt:{label:'Sous-titre',fontGroup:'title',size:13,bold:false,italic:true,upper:false,leading:1.4},
  serie:{label:'Titre',fontGroup:'title',size:null,bold:true,italic:false,upper:false,leading:1.15},
  intro:{label:'Paragraphe',fontGroup:'body',size:null,bold:false,italic:false,upper:false,leading:1.85},
  coverBackTitle:{label:'Titre verso',fontGroup:'title',size:null,bold:true,italic:false,upper:false,leading:1.25},
  coverBackText:{label:'Texte verso',fontGroup:'body',size:null,bold:false,italic:false,upper:false,leading:1.85},
  spineText:{label:'Dos',fontGroup:'title',size:11,bold:false,italic:false,upper:true,leading:1.2}
};
const TEXT_KEYS=Object.keys(TEXT_TARGETS);
// Repères du fichier projet (voir « Enregistrer et rouvrir un projet », plus bas).
const PROJET_FORMAT='ichka-studio';
const PROJET_VERSION=1;
const CHAMPS_IMAGE=['img','img2','topImg'];
const NOMS_IMAGE={img:'imgName',img2:'img2Name',topImg:'topImgName'};
const IMAGE_FIELDS={
  img:{url:'img',name:'imgName',w:'imgW',h:'imgH',fit:'imgFit',zoom:'imgZoom',x:'imgX',y:'imgY',inset:'imgInset',rule:'imgRule',rot:'imgRot',flip:'imgFlip',shape:'imgShape',amount:'imgShapeAmount',frame:'imgFrame',framelock:'imgFrameLock'},
  img2:{url:'img2',name:'img2Name',w:'img2W',h:'img2H',fit:'img2Fit',zoom:'img2Zoom',x:'img2X',y:'img2Y',inset:'img2Inset',rule:'img2Rule',rot:'img2Rot',flip:'img2Flip',shape:'img2Shape',amount:'img2ShapeAmount',frame:'img2Frame',framelock:'img2FrameLock'}
};
const BLANK_IMAGE_BG='#FCFBF8';
// Teinte unique du papier (l'ancien choix crème/blanc a été retiré de l'interface).
const PAPER_TINT='#F7F3EA';
// Numéros de page (folios). Réglage du livre entier, pas de la page : on ne
// numérote pas une double-page autrement que les autres.
let folioPosition='both';   // 'none' | 'left' | 'right' | 'both'
let folioFont='mono';
// Position dans la page rognée, en % : folioX depuis le bord extérieur,
// folioY depuis le bas. Bornes volontairement serrées (voir index.html) pour
// que le numéro reste dans sa page et hors du fond perdu.
let folioX=10;
let folioY=8;
let folioColor='#6E685F';
const FOLIO_FONT_OPTIONS=[
  ['mono','Chiffres techniques'],
  ['cormorant','Cormorant Garamond'],
  ['ebgaramond','EB Garamond'],
  ['playfair','Playfair Display'],
  ['bodoni','Bodoni Moda'],
  ['cinzel','Cinzel'],
  ['spectral','Spectral'],
  ['jost','Jost'],
  ['inter','Inter']
];
function folioFontCss(){
  return folioFont==='mono'?'var(--mono)':(FONT_STACKS[folioFont]||'var(--mono)');
}
// Position du folio en % de la DOUBLE-PAGE dessinée (fond perdu compris), à
// partir d'un réglage exprimé en % de la page rognée. Le bord rogné est à
// BLEED_MM du bord dessiné, d'où l'addition.
// Un livre imprimé ne pose pas de numéro sur une image à fond perdu : le folio
// va sur la page de papier. « Deux images » et « Grande image » n'ont pas de
// papier du tout, donc pas de numéro.
function folioSideAllowed(page,cote){
  if(page.layout==='dual'||page.layout==='panorama')return false;
  return effectiveSide(page)!==cote;   // effectiveSide = côté de l'image
}
function folioOffsets(){
  const largeurMm=TRIM_W_MM*2+BLEED_MM*2;
  const hauteurMm=TRIM_H_MM+BLEED_MM*2;
  const xMm=BLEED_MM+folioX/100*TRIM_W_MM;
  const yMm=BLEED_MM+folioY/100*TRIM_H_MM;
  return {x:+(xMm/largeurMm*100).toFixed(3),y:+(yMm/hauteurMm*100).toFixed(3)};
}
const DEFAULT_IMAGE_BG='#2F3B2E';
const TEXT_ACCENT='#8A6D23';
const TITLE_ACCENT='#2F3B2E';

const el=id=>document.getElementById(id);
const setVal=(id,value)=>{const node=el(id);if(node)node.value=value;};
const setText=(id,value)=>{const node=el(id);if(node)node.textContent=value;};
const onEl=(id,event,handler)=>{const node=el(id);if(node)node.addEventListener(event,handler);};
const pad2=n=>String(n).padStart(2,'0');
const esc=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const escAttr=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const editAttrs=(key,label,locked=false)=>`data-edit="${key}" contenteditable="${locked?'false':'true'}" spellcheck="true" role="textbox" aria-label="${escAttr(label)}" data-placeholder="${escAttr(label)}"`;
let currentLang='fr';
const I18N_EN={
  "ICHKA Studio":"ICHKA Studio",
  "Atelier du livre":"Book Atelier",
  "Composer un livre illustré, page par page.":"Compose an illustrated book, page by page.",
  "Liste des pages":"Page list",
  "Pages":"Pages",
  "Page affichée":"Current page",
  "Dans le livre":"In the book",
  "Modèle":"Template",
  "Nom de cette vue":"View name",
  "Pages intérieures":"Interior pages",
  "Appliquer":"Apply",
  "Hors couverture. Exemple : 8, 32, 120 pages.":"Excluding cover. Example: 8, 32, 120 pages.",
  "Page sélectionnée":"Selected page",
  "Couverture double":"Full cover",
  "Couverture recto":"Front cover",
  "Début du livre":"Start of book",
  "Fin du livre":"End of book",
  "Couverture verso":"Back cover",
  "Choisir un modèle pour cette page":"Choose a template for this page",
  "Les couvertures ont une mise en page fixe : pas de modèle à choisir.":"Covers have a fixed layout: no template to choose.",
  "Image + texte":"Image + text",
  "Deux images":"Two images",
  "Grande image":"Large image",
  "Page texte":"Text page",
  "Image seule":"Image only",
  "Crédits":"Credits",
  "Format du livre":"Book format",
  "Carré":"Square",
  "Poche":"Pocket",
  "Grand":"Large",
  "Paysage":"Landscape",
  "Panoramique":"Panoramic",
  "Dimensions personnalisées (mm)":"Custom dimensions (mm)",
  "Largeur":"Width",
  "Hauteur":"Height",
  "Marges d'impression (mm)":"Print margins (mm)",
  "Fond perdu":"Bleed",
  "Zone sûre":"Safe zone",
  "Fond perdu : marge coupée par l'imprimeur. Zone sûre : garder textes et logos à l'intérieur.":"Bleed: margin trimmed by the printer. Safe zone: keep text and logos inside.",
  "Repères d'impression":"Print guides",
  "Guides sur le livre":"Guides on book",
  "Masquer":"Hide",
  "Afficher":"Show",
  "Les repères aident à composer. Ils ne sortent pas dans le PNG.":"Guides help you compose. They are not included in PNG export.",
  "Images":"Images",
  "Charger ou remplacer l'image":"Load or replace image",
  "Charger ou remplacer l'image gauche":"Load or replace left image",
  "Charger ou remplacer l'image droite":"Load or replace right image",
  "Charger ou remplacer l'image double":"Load or replace double image",
  "Charger ou remplacer la couverture":"Load or replace cover",
  "Supprimer l'image":"Remove image",
  "Image par-dessus":"Image overlay",
  "Supprimer celle du dessus":"Remove overlay",
  "Image à régler":"Image to adjust",
  "Image gauche":"Left image",
  "Image droite":"Right image",
  "Couleur derrière l'image":"Color behind image",
  "Force du fond":"Background strength",
  "Teintes du livre":"Book colors",
  "Les teintes de ton livre, pour accorder le fond au texte en un clic.":"Book colors, to match background and text in one click.",
  "vert profond":"deep green",
  "sauge":"sage",
  "vert-de-gris":"verdigris",
  "doré":"gold",
  "vieil or":"old gold",
  "brun chaud":"warm brown",
  "bordeaux":"burgundy",
  "bleu ardoise":"slate blue",
  "gris chaud":"warm grey",
  "gris foncé":"dark grey",
  "noir doux":"soft black",
  "crème":"cream",
  "Couleur libre (pipette)":"Custom color (eyedropper)",
  "Côté de l'image":"Image side",
  "Gauche":"Left",
  "Droite":"Right",
  "Image dans la page":"Image fit",
  "Remplir":"Fill",
  "Voir entière":"Fit whole",
  "Taille de l'image":"Image size",
  "Gauche / droite":"Left / right",
  "Haut / bas":"Up / down",
  "Pivot de l'image":"Image rotation",
  "Retourner l'image (miroir)":"Flip image",
  "Trait autour de l'image":"Image border",
  "Sans":"None",
  "Avec":"With",
  "Séparation au milieu":"Center separation",
  "Trait fin":"Thin line",
  "Bande douce":"Soft band",
  "Couleur du milieu":"Center color",
  "Largeur au milieu":"Center width",
  "Discrétion":"Subtlety",
  "Recadrer au centre":"Recenter image",
  "Détourage de l'image":"Image shape",
  "Angles normaux":"Square corners",
  "Angles ronds":"Round corners",
  "Angles coupés":"Cut corners",
  "Vieille lettre":"Old letter edge",
  "Arche":"Arch",
  "Ovale":"Oval",
  "Intensité du détourage":"Shape strength",
  "Figer le cadre":"Lock frame",
  "Cadre figé":"Frame locked",
  "Le cadre suit le zoom de l'image jusqu'au bord de la page. Une fois figé, le zoom ne déplace plus que l'image à l'intérieur.":"The frame follows the image zoom up to the page edge. Once locked, zooming only moves the image inside it.",
  "Non disponible en « Remplir » : l'image doit déborder pour être massicotée. Choisis « Voir entière » juste au-dessus pour pouvoir la détourer.":"Not available in Fill mode: the image must bleed off to be trimmed. Choose Fit whole just above to shape it.",
  "Numéros de page":"Page numbers",
  "Réglage valable pour tout le livre. Le numéro se pose sur la page de papier, jamais sur une image à fond perdu ni sur une couverture — comme dans un livre imprimé.":"Applies to the whole book. The number sits on the paper page, never on a full-bleed image or a cover — like a printed book.",
  "Où les placer":"Where to place them",
  "Aucun":"None",
  "Les deux":"Both",
  "Police des numéros":"Number font",
  "Écart au bord":"Distance from edge",
  "Hauteur depuis le bas":"Height from bottom",
  "Avec deux numéros, ils se placent en miroir : chacun à la même distance de son bord extérieur.":"With two numbers, they mirror each other: each the same distance from its outer edge.",
  "Couleur des numéros":"Number color",
  "Chiffres techniques":"Technical figures",
  "Tout replier":"Collapse all",
  "Tout déplier":"Expand all",
  "Non disponible : ce modèle remplit la double page d'images, aucun texte n'y est affiché.":"Not available: this layout fills the spread with images, no text is shown on it.",
  "Trait décoratif":"Decorative rule",
  "Un trait fin, à poser où tu veux sur la page. Sa couleur sert aussi au trait autour des images.":"A thin rule you can place anywhere on the page. Its color is also used for the border around images.",
  "Afficher le trait":"Show rule",
  "Couleur du trait":"Rule color",
  "Couleur":"Color",
  "Sert aussi au trait autour des images.":"Also used for image borders.",
  "Longueur":"Length",
  "Épaisseur":"Thickness",
  "Remettre au centre":"Reset to center",
  "Appliquer à tout le livre":"Apply to whole book",
  "Textes":"Texts",
  "Réglages du texte : page active":"Text settings: active page",
  "Mention du haut":"Top mention",
  "Sous-titre":"Subtitle",
  "Titre":"Title",
  "Largeur du texte":"Text width",
  "Texte gauche / droite":"Text left / right",
  "Texte haut / bas":"Text up / down",
  "Écart entre les textes":"Text spacing",
  "Alignement du texte":"Text alignment",
  "Centre":"Center",
  "Recentrer le texte":"Recenter text",
  "Verso et dos de la couverture":"Cover back and spine",
  "Mention du haut, au verso":"Top mention on back",
  "Titre au verso":"Back title",
  "Texte au verso":"Back text",
  "Titre sur le dos":"Title on spine",
  "Auteur sur le dos":"Author on spine",
  "Texte sur le dos":"Spine text",
  "Le verso, ou quatrième de couverture, est la page qu’on lit en retournant le livre. Le dos est la tranche visible quand le livre est rangé sur une étagère.":"The back cover is the page read when turning the book over. The spine is visible when the book sits on a shelf.",
  "Paragraphe et papier":"Paragraph and paper",
  "Le paragraphe est le bloc de texte long de la page. Les titres se règlent juste au-dessus, dans « Textes ».":"The paragraph is the long text block on the page. Titles are adjusted above, in “Texts”.",
  "Paragraphe de la page":"Page paragraph",
  "Marges du texte":"Text margins",
  "Papier":"Paper",
  "Enregistrer et exporter":"Save and export",
  "La mise en page se choisit plus haut, dans « Choisir un modèle pour cette page ».":"Choose the layout above, in “Choose a template for this page”.",
  "Format des fichiers":"File format",
  "Recommandé par Cewe, accepté par Amazon. Six fois plus léger que le PNG, sans perte visible sur des photos.":"Recommended by Cewe, accepted by Amazon. Six times lighter than PNG, with no visible loss on photos.",
  "Sans perte, mais environ six fois plus lourd. Repère : au-delà d’une cinquantaine de vues, le PNG risque de dépasser la limite d’Amazon. Le poids réel s’affiche après « Tout le livre ».":"Lossless, but around six times heavier. As a rule: beyond roughly fifty views, PNG may exceed Amazon’s limit. The actual weight appears after “Whole book”.",
  "Enregistrer le projet":"Save project",
  "Ouvrir un projet":"Open project",
  "Remettre les images":"Reconnect images",
  "Cette double page":"This spread",
  "Tout le livre":"Whole book",
  "La fiche technique":"Technical sheet",
  "Tout effacer":"Clear everything",
  "Un fichier avec toute ta composition : pages, textes, réglages, cadrages.":"A file with your whole composition: pages, texts, settings and framing.",
  "Ton filet de sécurité — à refaire de temps en temps.":"Your safety copy — do it again from time to time.",
  "Recharge une composition enregistrée.":"Reloads a saved composition.",
  "Remplace le livre en cours.":"Replaces the current book.",
  "Les images se remettent en place juste après, en une fois.":"Images can be reconnected just after, all at once.",
  "Les images ne sont pas dans le fichier projet, elles restent sur ton disque.":"Images are not inside the project file; they stay on your drive.",
  "Pour l'imprimeur, ou pour montrer une page.":"For the printer, or to show a page.",
  "C'est ce qu'on dépose chez Cewe ou Amazon.":"This is what you upload to Cewe or Amazon.",
  "Le texte des réglages de cette vue : format, marges, couleurs, polices, contenus.":"The settings text for this view: format, margins, colors, fonts and contents.",
  "Pour garder une trace ou refaire la même page plus tard.":"To keep a record or recreate the same page later.",
  "Remet le livre à zéro : pages, textes et images.":"Resets the book: pages, texts and images.",
  "Irréversible — rien n'est enregistré ailleurs.":"Irreversible — nothing is saved elsewhere.",
  "Aperçu et fichiers en RVB (sRGB), le profil attendu par Cewe comme par Amazon. Aucune conversion à faire.":"Preview and files are RGB (sRGB), the profile expected by Cewe and Amazon. No conversion needed.",
  "Page précédente":"Previous page",
  "Page suivante":"Next page",
  "Ajouter une page":"Add page",
  "Dupliquer cette page":"Duplicate page",
  "Supprimer cette page":"Delete page",
  "Masquer les outils":"Hide tools",
  "Afficher les outils":"Show tools",
  "Masquer les repères":"Hide guides",
  "Afficher les repères":"Show guides",
  "Voir le livre seul":"View book only",
  "Retour à l'édition":"Back to editing",
  "Fond perdu image qui dépasse pour éviter un bord blanc.":"Bleed: image overflow to avoid white edges.",
  "Bord coupé limite finale du livre.":"Trim edge: final book limit.",
  "Zone sûre textes, logo et détails importants dedans.":"Safe zone: keep texts, logo and important details inside.",
  "Navigation des doubles-pages":"Spread navigation",
  "Explication des repères d'impression":"Print guide explanation",
  "Liste des doubles-pages":"Spread list",
  "Changer de double-page":"Change spread",
  "Double-page précédente":"Previous spread",
  "Double-page suivante":"Next spread",
  "Langue de l'interface":"Interface language",
  "Nom d’auteur, collection, numéro de série...":"Author name, collection, series number...",
  "Recueil d’illustrations, chapitre premier, note...":"Illustration collection, first chapter, note...",
  "Le titre affiché en grand":"The title shown large",
  "Phrase d’accroche, note, crédits courts...":"Hook line, note, short credits...",
  "Résumé, intention, crédits courts, phrase forte...":"Summary, intent, short credits, strong line...",
  "Visible seulement si le livre a assez de pages":"Visible only if the book has enough pages",
  "Une légende, une présentation, quelques lignes...":"A caption, an introduction, a few lines...",
  "Rendu...":"Rendering...",
  "Export indispo ici":"Export unavailable here",
  "Enregistré ✓":"Saved ✓",
  "Copié ✓":"Copied ✓",
  "Sélectionne puis Ctrl/Cmd+C":"Select then Ctrl/Cmd+C",
  "Aucune correspondance":"No match",
  "Télécharger les fichiers préparés":"Download prepared files",
  "Enregistrer":"Save",
  "Enregistrer le fichier":"Save file",
  "Sur mobile : appui long sur l'image pour l'enregistrer.":"On mobile: long-press the image to save it.",
  "Un fichier a été préparé pour chaque vue. Le bouton ci-dessus lance les téléchargements seulement quand tu le demandes.":"One file has been prepared for each view. The button above starts the downloads only when you ask.",
  "Aucune image importée.":"No image imported.",
  "Qualité trop basse":"Quality too low",
  "À vérifier":"Check",
  "Avancement":"Progress",
  "Qualité":"Quality",
  "Export":"Export",
  "toutes les vues illustrées":"all views illustrated",
  "résolution trop juste pour l'impression":"resolution too low for print",
  "aucune image chargée":"no image loaded",
  "prêt à imprimer":"ready to print",
  "texte possible":"text possible",
  "pas de texte sur le dos":"no spine text",
  "aperçu 30 pages":"30-page preview",
  "Près du pli":"Near fold",
  "Pli couverture":"Cover spine",
  "KDP papier":"KDP paper",
  "bord coupé":"trim edge",
  "zone sûre":"safe zone",
  "pli du livre":"book fold"
};
const I18N_TEXT_BASES=new WeakMap();
const I18N_ATTR_BASES=new WeakMap();
const I18N_SKIP='script,style,noscript,#spread,#readerSpread,#filmstrip,.book-title,input,textarea,select,option';
function translatePattern(base){
  const t=String(base);
  let m=t.match(/^Page affichée (\d+) \/ (\d+)(.*)$/);
  if(m)return `Page shown ${m[1]} / ${m[2]}${m[3]}`;
  m=t.match(/^Page (\d+) \/ (\d+)(.*)$/);
  if(m)return `Page ${m[1]} / ${m[2]}${m[3]}`;
  m=t.match(/^(\d+) image attendue$/);
  if(m)return `${m[1]} image expected`;
  m=t.match(/^(\d+) images attendues$/);
  if(m)return `${m[1]} images expected`;
  m=t.match(/^(\d+) fichier$/);
  if(m)return `${m[1]} file`;
  m=t.match(/^(\d+) fichiers$/);
  if(m)return `${m[1]} files`;
  m=t.match(/^(\d+) vue\(s\) sans image$/);
  if(m)return `${m[1]} view(s) without image`;
  m=t.match(/^(\d+) image\(s\) nette\(s\) pour l'impression$/);
  if(m)return `${m[1]} image(s) sharp enough for print`;
  m=t.match(/^(\d+) pages · dos (.+)$/);
  if(m)return `${m[1]} pages · spine ${tr(m[2])}`;
  m=t.match(/^(\d+) px de large · prêt à imprimer$/);
  if(m)return `${m[1]} px wide · ready to print`;
  return null;
}
function tr(base){
  if(currentLang==='fr')return String(base);
  return translatePattern(base)||I18N_EN[String(base)]||String(base);
}
function translateTextNode(node){
  if(!node.nodeValue||!node.nodeValue.trim())return;
  const parent=node.parentElement;
  if(!parent||parent.closest(I18N_SKIP))return;
  const base=I18N_TEXT_BASES.get(node)||node.nodeValue;
  I18N_TEXT_BASES.set(node,base);
  const left=base.match(/^\s*/)[0];
  const right=base.match(/\s*$/)[0];
  node.nodeValue=left+tr(base.trim())+right;
}
function translateAttributes(node){
  if(!node||node.closest?.('#spread,#readerSpread,#filmstrip,.book-title'))return;
  const attrs=['aria-label','title','placeholder','data-placeholder'];
  let bases=I18N_ATTR_BASES.get(node);
  if(!bases){bases={};I18N_ATTR_BASES.set(node,bases);}
  attrs.forEach(attr=>{
    if(!node.hasAttribute||!node.hasAttribute(attr))return;
    if(!bases[attr])bases[attr]=node.getAttribute(attr);
    node.setAttribute(attr,tr(bases[attr]));
  });
}
function applyLanguage(root=document.body){
  if(!root)return;
  translateAttributes(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
    acceptNode(node){
      const parent=node.parentElement;
      if(!parent||parent.closest(I18N_SKIP))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(translateTextNode);
  root.querySelectorAll?.('*').forEach(translateAttributes);
  const box=el('langSwitch');
  if(box)[...box.querySelectorAll('button')].forEach(button=>{
    const on=button.dataset.lang===currentLang;
    button.classList.toggle('on',on);
    button.setAttribute('aria-pressed',on?'true':'false');
  });
  document.documentElement.lang=currentLang;
}
function setInterfaceLanguage(lang){
  currentLang=lang==='en'?'en':'fr';
  applyLanguage();
}
function initLanguageSwitch(){
  const box=el('langSwitch');
  if(!box)return;
  box.addEventListener('click',e=>{
    const button=e.target.closest('button[data-lang]');
    if(!button)return;
    setInterfaceLanguage(button.dataset.lang);
  });
  setInterfaceLanguage('fr');
}
function isPageLocked(page){
  return !!(page&&page.locked);
}
function isTextHidden(page,key){
  return !!(page.textHidden&&page.textHidden[key]);
}
function textLine(page,key,tag,className,label,extraStyle='',value=page[key],area='main'){
  if(isTextHidden(page,key))return '';
  const locked=isPageLocked(page);
  return `<div class="text-line-wrap">
      ${locked?'':textTools(page,key,[key],area)}
      <${tag} class="${className}" style="${extraStyle}${textStyleVars(page,key)}" ${editAttrs(key,label,locked)}>${esc(value)}</${tag}>
    </div>`;
}

// Les plats de couverture existent dans le chemin de fer sans suivre la pagination intérieure classique.
const SURFACE_BY_KIND={
  'Couverture double':'cover-wrap',
  'Couverture complète':'cover-wrap',
  'Couverture recto':'cover-front',
  'Couverture':'cover-front',
  'Plat 1 - couverture':'cover-front',
  'Couverture avant':'cover-front',
  'Début du livre':'inside-front',
  'Plat 2 + page 1':'inside-front',
  'Dedans couverture + page 1':'inside-front',
  'Fin du livre':'inside-back',
  'Plat 3 + dernière page':'inside-back',
  'Dernière page + dedans dos':'inside-back',
  'Fin + dedans couverture':'inside-back',
  'Couverture verso':'cover-back',
  'Plat 4 - quatrième de couverture':'cover-back',
  'Couverture arrière':'cover-back',
  '4e de couverture':'cover-back',
  'Quatrième de couverture':'cover-back'
};

function surfaceForKind(kind){
  return SURFACE_BY_KIND[kind]||'interior';
}
function isFullCover(page){
  return page.surface==='cover-wrap';
}
function isSingleCover(page){
  return page.surface==='cover-front'||page.surface==='cover-back';
}
function isMixedCover(page){
  return page.surface==='inside-front'||page.surface==='inside-back';
}
function effectiveSide(page){
  if(page.surface==='inside-front')return 'left';
  if(page.surface==='inside-back')return 'right';
  return page.side;
}
function applySurfaceRules(page){
  if(!page.ruleStyle)page.ruleStyle=PAGE_TEMPLATE.ruleStyle;
  if(!page.ruleWeight)page.ruleWeight=PAGE_TEMPLATE.ruleWeight;
  if(page.ruleLength==null)page.ruleLength=PAGE_TEMPLATE.ruleLength;
  if(page.ruleX==null)page.ruleX=PAGE_TEMPLATE.ruleX;
  if(page.ruleY==null)page.ruleY=PAGE_TEMPLATE.ruleY;
  if(page.ruleStyle!=='line')page.ruleStyle='none';
  if(page.textWidth==null)page.textWidth=PAGE_TEMPLATE.textWidth;
  if(page.textX==null)page.textX=PAGE_TEMPLATE.textX;
  if(page.textY==null)page.textY=PAGE_TEMPLATE.textY;
  if(page.textGap==null)page.textGap=PAGE_TEMPLATE.textGap;
  if(!page.textHidden||typeof page.textHidden!=='object')page.textHidden={};
  if(isFullCover(page)){
    if(page.coverBackKick==null)page.coverBackKick=page.kick||PAGE_TEMPLATE.coverBackKick;
    ['Width','X','Y','Gap','Align'].forEach(prop=>{
      const source=page['text'+prop]==null?PAGE_TEMPLATE['text'+prop]:page['text'+prop];
      if(page['frontText'+prop]==null)page['frontText'+prop]=source;
      if(page['backText'+prop]==null)page['backText'+prop]=source;
    });
  }
  if(!['left','center','right'].includes(page.textAlign))page.textAlign=PAGE_TEMPLATE.textAlign;
  if(page.titleFont==null||!TITLE_FONTS[page.titleFont])page.titleFont=PAGE_TEMPLATE.titleFont;
  if(page.bodyFont==null||!BODY_FONTS[page.bodyFont])page.bodyFont=PAGE_TEMPLATE.bodyFont;
  if(page.bodySize==null)page.bodySize=PAGE_TEMPLATE.bodySize;
  ensureTextStyles(page);
  if(page.coverBackTitle==null)page.coverBackTitle=page.chapt||PAGE_TEMPLATE.coverBackTitle;
  if(page.coverBackText==null)page.coverBackText=page.intro||PAGE_TEMPLATE.coverBackText;
  if(page.spineText==null)page.spineText=page.serie||PAGE_TEMPLATE.spineText;
  if(!page.imgFit)page.imgFit=PAGE_TEMPLATE.imgFit;
  if(page.imgZoom==null)page.imgZoom=PAGE_TEMPLATE.imgZoom;
  if(page.imgX==null)page.imgX=PAGE_TEMPLATE.imgX;
  if(page.imgY==null)page.imgY=PAGE_TEMPLATE.imgY;
  if(page.imgInset==null)page.imgInset=PAGE_TEMPLATE.imgInset;
  if(page.imgRule==null)page.imgRule=PAGE_TEMPLATE.imgRule;
  if(page.imgRot==null)page.imgRot=PAGE_TEMPLATE.imgRot;
  if(page.img2==null)page.img2=PAGE_TEMPLATE.img2;
  if(page.img2Name==null)page.img2Name=PAGE_TEMPLATE.img2Name;
  if(!page.img2Fit)page.img2Fit=PAGE_TEMPLATE.img2Fit;
  if(page.img2Zoom==null)page.img2Zoom=PAGE_TEMPLATE.img2Zoom;
  if(page.img2X==null)page.img2X=PAGE_TEMPLATE.img2X;
  if(page.img2Y==null)page.img2Y=PAGE_TEMPLATE.img2Y;
  if(page.img2Inset==null)page.img2Inset=PAGE_TEMPLATE.img2Inset;
  if(page.img2Rule==null)page.img2Rule=PAGE_TEMPLATE.img2Rule;
  if(page.img2Rot==null)page.img2Rot=PAGE_TEMPLATE.img2Rot;
  if(page.imgW==null)page.imgW=PAGE_TEMPLATE.imgW;
  if(page.imgH==null)page.imgH=PAGE_TEMPLATE.imgH;
  if(page.img2W==null)page.img2W=PAGE_TEMPLATE.img2W;
  if(page.img2H==null)page.img2H=PAGE_TEMPLATE.img2H;
  if(page.topImg==null)page.topImg=PAGE_TEMPLATE.topImg;
  if(page.topImgName==null)page.topImgName=PAGE_TEMPLATE.topImgName;
  if(page.topImgW==null)page.topImgW=PAGE_TEMPLATE.topImgW;
  if(page.topImgH==null)page.topImgH=PAGE_TEMPLATE.topImgH;
  if(!['img','img2'].includes(page.topImgSlot))page.topImgSlot=PAGE_TEMPLATE.topImgSlot;
  if(page.topImgX==null)page.topImgX=PAGE_TEMPLATE.topImgX;
  if(page.topImgY==null)page.topImgY=PAGE_TEMPLATE.topImgY;
  if(page.topImgSize==null)page.topImgSize=PAGE_TEMPLATE.topImgSize;
  if(page.topImgRot==null)page.topImgRot=PAGE_TEMPLATE.topImgRot;
  if(page.topImgOpacity==null)page.topImgOpacity=PAGE_TEMPLATE.topImgOpacity;
  if(page.topImgRule==null)page.topImgRule=PAGE_TEMPLATE.topImgRule;
  if(!['none','line','band'].includes(page.panoSep))page.panoSep=PAGE_TEMPLATE.panoSep;
  if(!page.panoColor)page.panoColor=PAGE_TEMPLATE.panoColor;
  if(page.panoWidth==null)page.panoWidth=PAGE_TEMPLATE.panoWidth;
  if(page.panoOpacity==null)page.panoOpacity=PAGE_TEMPLATE.panoOpacity;
  if(!['galerie','dual','panorama','coverwrap'].includes(page.layout))page.layout=PAGE_TEMPLATE.layout;
  if(!page.surface)page.surface=surfaceForKind(page.kind);
  if(isFullCover(page))page.layout='coverwrap';
  if(isSingleCover(page))page.layout='galerie';
  if(page.surface==='inside-front')page.side='left';
  if(page.surface==='inside-back')page.side='right';
}
function clamp(value,min,max){
  return Math.max(min,Math.min(max,+value||0));
}
function imageField(slot,key){
  return (IMAGE_FIELDS[slot]||IMAGE_FIELDS.img)[key];
}
function imageFit(page,slot='img'){
  const value=page[imageField(slot,'fit')];
  return ['fill','contain','inset'].includes(value)?value:PAGE_TEMPLATE.imgFit;
}
function imageZoom(page,slot='img'){
  const value=page[imageField(slot,'zoom')];
  return Math.max(20,Math.min(260,+value||100));
}
function imageOffsetX(page,slot='img'){
  return clamp(page[imageField(slot,'x')],-100,100);
}
function imageOffsetY(page,slot='img'){
  return clamp(page[imageField(slot,'y')],-100,100);
}
// Détourage artistique. Deux techniques seulement, les seules que l'export
// respecte : border-radius pour les formes nettes, et un voile en dégradé pour
// les fondus. clip-path et mask-image sont ignorés par html2canvas — ils
// donneraient une belle forme à l'écran et un rectangle chez l'imprimeur.
const IMAGE_SHAPES=['none','round','bevel','deckle','arch','oval'];
// Anciennes valeurs : les fondus ont été retirés, « soft » est devenu « round ».
const IMAGE_SHAPES_ANCIENS={soft:'round',fade:'none',fadeDown:'none'};
function imageShape(page,slot='img'){
  let v=page[imageField(slot,'shape')];
  if(IMAGE_SHAPES_ANCIENS[v])v=IMAGE_SHAPES_ANCIENS[v];
  return IMAGE_SHAPES.includes(v)?v:'none';
}
// Rapport largeur/hauteur de l'image chargée : sert à faire coller la fenêtre
// à l'image elle-même, et à garder des angles ronds réellement ronds.
function imageAspect(page,slot='img'){
  const w=+page[imageField(slot,'w')];
  const h=+page[imageField(slot,'h')];
  return (w>0&&h>0)?w/h:0;
}
// En « Voir entière », l'image est plus petite que la page : sans cela, la
// découpe s'appliquerait au cadre de la page et raterait l'image.
// Taille du cadre de détourage, en fraction de l'ajustement naturel à la page.
// Tant qu'il n'est pas figé, il suit le zoom de l'image : on dézoome, le cadre
// rétrécit avec elle ; on zoome, il grandit jusqu'au bord de la page et s'y
// arrête (au-delà, c'est l'image qui grandit dans un cadre plein format).
// Une fois figé, le cadre ne bouge plus : le zoom ne déplace que l'image
// dedans, comme un recadrage.
function imageFrameLocked(page,slot='img'){
  return !!page[imageField(slot,'framelock')];
}
function imageFrameScale(page,slot='img'){
  if(imageFrameLocked(page,slot)){
    const v=+page[imageField(slot,'frame')];
    return Number.isFinite(v)?Math.min(1,Math.max(0.05,v)):1;
  }
  return Math.min(1,Math.max(0.05,imageZoom(page,slot)/100));
}
function imageHugs(page,slot='img'){
  return shapeAvailable(page,slot)&&imageShape(page,slot)!=='none'&&imageAspect(page,slot)>0;
}
function imageShapeAmount(page,slot='img'){
  const v=page[imageField(slot,'amount')];
  return clamp(Number.isFinite(+v)?+v:50,0,100);
}
// Le détourage n'a pas de sens sur une image à fond perdu : elle doit déborder
// pour être massicotée, on ne va pas lui arrondir les coins.
function shapeAvailable(page,slot='img'){
  return imageFit(page,slot)!=='fill';
}
// Vagues du bord « vieille lettre ». Faites d'éléments ronds et non d'un fond
// répété : html2canvas ne sait pas répéter un fond, la découpe ne sortirait pas
// à l'impression. Les pourcentages sont appariés par le rapport d'image pour
// que les demi-disques restent ronds quelle que soit la forme de la page.
function imageCarveMarkup(page,slot='img'){
  const forme=shapeAvailable(page,slot)?imageShape(page,slot):'none';
  if(forme!=='deckle')return '';
  const t=imageShapeAmount(page,slot)/100;
  const A=imageAspect(page,slot)||1;
  const periode=3+t*7;                       // en % de la largeur
  const n=Math.max(4,Math.round(100/periode));
  const px=100/n;                            // pas horizontal, % de largeur
  const r=px*0.46;                           // rayon, % de largeur
  const rh=r*A;                              // même rayon, % de hauteur
  const m=Math.max(4,Math.round(100/(px*A)));
  const py=100/m;                            // pas vertical, % de hauteur
  const rond=(styleSup)=>`<i style="width:${(2*r).toFixed(3)}%;height:${(2*rh).toFixed(3)}%;${styleSup}"></i>`;
  let html='';
  for(let i=0;i<n;i++){
    const x=(px*(i+0.5)-r).toFixed(3);
    html+=rond(`left:${x}%;top:${(-rh).toFixed(3)}%`);
    html+=rond(`left:${x}%;top:calc(100% - ${rh.toFixed(3)}%)`);
  }
  for(let j=0;j<m;j++){
    const y=(py*(j+0.5)-rh).toFixed(3);
    html+=rond(`top:${y}%;left:${(-r).toFixed(3)}%`);
    html+=rond(`top:${y}%;left:calc(100% - ${r.toFixed(3)}%)`);
  }
  return html;
}
function imageShapeCss(page,slot='img'){
  const forme=shapeAvailable(page,slot)?imageShape(page,slot):'none';
  const t=imageShapeAmount(page,slot)/100;
  const A=imageAspect(page,slot)||1;      // largeur / hauteur de la fenêtre
  const fond=rgba(page.hue,1);
  const vide='rgba(0,0,0,0)';
  let radius='0';
  let carve='none';
  if(forme==='round'){
    // Rayons appariés : en pourcentage, CSS applique X à la largeur et Y à la
    // hauteur. Sans cette correction par le rapport d'image, les angles
    // seraient ovales au lieu d'être ronds.
    const rx=2+t*22;
    const ry=Math.min(50,rx*A);
    radius=`${rx.toFixed(2)}% / ${ry.toFixed(2)}%`;
  }else if(forme==='oval'){
    radius='50%';
  }else if(forme==='arch'){
    const ry=Math.min(50,25+t*25);
    radius=`50% 50% 0 0 / ${ry.toFixed(1)}% ${ry.toFixed(1)}% 0 0`;
  }else if(forme==='bevel'){
    // Angles coupés : quatre triangles de la couleur du fond, peints par des
    // dégradés à arrêt net. Bord franc, pas de fondu.
    // L'arrêt se mesure le long de la ligne du dégradé (la diagonale), pas le
    // long du côté : sans cette conversion la coupe est bien trop profonde.
    const c=3+t*17;                       // profondeur voulue, en % du petit côté
    const p=(c*Math.min(A,1)/(A+1)).toFixed(3);
    carve=[135,225,315,45].map(a=>`linear-gradient(${a}deg, ${fond} 0 ${p}%, ${vide} ${p}%)`).join(',');
  }
  // « Vieille lettre » n'est pas traité ici : html2canvas ne répète aucun fond
  // (vérifié : ni en %, ni en px, ni repeating-gradient). Les vagues sont donc
  // faites de vrais éléments ronds, voir imageCarveMarkup().
  return `--imgaspect:${A.toFixed(4)};--imgradius:${radius};--imgcarve:${carve};--imgcarvecolor:${fond};`;
}
function imageInset(page,slot='img'){
  return clamp(page[imageField(slot,'inset')],0,40);
}
function imageRule(page,slot='img'){
  return !!page[imageField(slot,'rule')];
}
function imageRotation(page,slot='img'){
  return clamp(page[imageField(slot,'rot')],-180,180);
}
function imageUrl(page,slot='img'){
  return page[imageField(slot,'url')];
}
function setImageSetting(page,slot,key,value){
  page[imageField(slot,key)]=value;
}
// Miroir horizontal : ce qui est à gauche dans l'image passe à droite. Utile pour
// qu'un sujet regarde vers l'intérieur du livre plutôt que vers le bord.
function imageFlipped(page,slot='img'){
  return !!page[imageField(slot,'flip')];
}
function topImageSlot(page){
  if(!canUseSecondImage(page)&&page.topImgSlot==='img2')page.topImgSlot='img';
  return page.topImgSlot==='img2'?'img2':'img';
}
function topImageX(page){
  return clamp(page.topImgX,-65,65);
}
function topImageY(page){
  return clamp(page.topImgY,-65,65);
}
function topImageSize(page){
  return Math.max(8,Math.min(120,+page.topImgSize||PAGE_TEMPLATE.topImgSize));
}
function topImageRotation(page){
  return clamp(page.topImgRot,-180,180);
}
function topImageOpacity(page){
  return Math.max(10,Math.min(100,+page.topImgOpacity||PAGE_TEMPLATE.topImgOpacity));
}
function topImageVars(page){
  return `--topx:${topImageX(page)}%;--topy:${topImageY(page)}%;--topsize:${topImageSize(page)}%;--toprot:${topImageRotation(page)}deg;--topopacity:${topImageOpacity(page)/100};--topborder:0px;`;
}
function panoSep(page){
  return ['none','line','band'].includes(page.panoSep)?page.panoSep:PAGE_TEMPLATE.panoSep;
}
function panoWidth(page){
  const value=page.panoWidth==null?PAGE_TEMPLATE.panoWidth:page.panoWidth;
  return Math.max(1,Math.min(80,+value||PAGE_TEMPLATE.panoWidth));
}
function panoOpacity(page){
  const value=page.panoOpacity==null?PAGE_TEMPLATE.panoOpacity:page.panoOpacity;
  return Math.max(4,Math.min(70,+value||PAGE_TEMPLATE.panoOpacity));
}
function panoVars(page){
  return `--pano-sep:${rgba(page.panoColor||PAGE_TEMPLATE.panoColor,panoOpacity(page)/100)};--pano-width:${panoWidth(page)}px;`;
}
function imageVars(page,slot='img'){
  const fit=imageFit(page,slot);
  const objectFit=fit==='fill'?'cover':'contain';
  const inset=fit==='inset'?imageInset(page,slot)+'%':'0%';
  // Quand le cadre épouse l'image, il porte déjà une partie du zoom : l'image
  // ne doit appliquer que le reste, sinon le zoom serait compté deux fois.
  const cadre=imageHugs(page,slot)?imageFrameScale(page,slot):1;
  // Jamais en dessous de 1 quand le cadre est figé : sinon l'image devient plus
  // petite que son cadre et le fond apparaît à l'intérieur de la découpe.
  const brut=(imageZoom(page,slot)/100)/cadre;
  const echelle=(imageHugs(page,slot)&&imageFrameLocked(page,slot))?Math.max(1,brut):brut;
  return `${imageShapeCss(page,slot)}--imgwin:${cadre.toFixed(4)};--underbg:${imageBackground(page,slot)};--imgfit:${objectFit};--imgscale:${echelle.toFixed(3)};--imgx:${imageOffsetX(page,slot)}%;--imgy:${imageOffsetY(page,slot)}%;--imgrot:${imageRotation(page,slot)}deg;--imgflip:${imageFlipped(page,slot)?-1:1};--imginset:${inset};--imgborder:${imageRule(page,slot)?liseretWeight(page):0}px;`;
}
function imageBackground(page,slot='img'){
  return imageUrl(page,slot)?rgba(page.hue,page.intensity/100):(page.paper||BLANK_IMAGE_BG);
}
function filetActif(page){
  return page.ruleStyle==='line';
}
function filetLongueur(page){
  const v=page.ruleLength==null?PAGE_TEMPLATE.ruleLength:page.ruleLength;
  return Math.max(3,Math.min(100,+v||PAGE_TEMPLATE.ruleLength));
}
function filetX(page){
  const v=page.ruleX==null?50:page.ruleX;
  return Math.max(0,Math.min(100,+v||0));
}
function filetY(page){
  const v=page.ruleY==null?50:page.ruleY;
  return Math.max(0,Math.min(100,+v||0));
}
// Les anciens livres portaient un cadre ou un motif : ils reçoivent le filet, et
// les réglages repartent au propre puisque leurs unités ont changé.
function migrerDecor(page,source=page){
  const avait=page.ruleStyle&&page.ruleStyle!=='none';
  const avaitFilet=page.markStyle&&page.markStyle!=='none';
  if(page.ruleStyle!=='line')page.ruleStyle=(avait||avaitFilet)?'line':'none';
  delete page.markStyle;
  // Position et longueur ont changé d'unité : les anciennes valeurs, exprimées en
  // pixels de décalage, ne veulent plus rien dire. On repart du centre.
  // Le marqueur se lit sur les valeurs reçues, pas sur la page déjà fusionnée
  // avec le gabarit : celui-ci le porte toujours et masquerait les anciens livres.
  if(source.filetV!==2){
    page.ruleX=50;
    page.ruleY=50;
    page.ruleLength=PAGE_TEMPLATE.ruleLength;
    page.filetV=2;
  }
  if(!(page.ruleLength>=3&&page.ruleLength<=100))page.ruleLength=PAGE_TEMPLATE.ruleLength;
  if(!(page.ruleX>=0&&page.ruleX<=100))page.ruleX=50;
  if(!(page.ruleY>=0&&page.ruleY<=100))page.ruleY=50;
  return page;
}
function liseretWeight(page){
  const value=page.ruleWeight==null?PAGE_TEMPLATE.ruleWeight:page.ruleWeight;
  return Math.max(1,Math.min(14,+value||PAGE_TEMPLATE.ruleWeight));
}


function ruleVars(page){
  return `--acc:${page.rule};--rweight:${liseretWeight(page)}px;`
    +`--filet-w:${liseretWeight(page)}px;--filet-l:${filetLongueur(page)};`
    +`--filet-x:${filetX(page)};--filet-y:${filetY(page)};`;
}
function thumbRuleVars(page){
  return `--rule:${page.rule};`;
}
function textAreaName(area){
  return ['front','back'].includes(area)?area:'main';
}
function textAreaField(area,prop){
  area=textAreaName(area);
  if(area==='front')return 'frontText'+prop;
  if(area==='back')return 'backText'+prop;
  return 'text'+prop;
}
function textAreaValue(page,area,prop,fallback){
  const field=textAreaField(area,prop);
  return page[field]==null?fallback:page[field];
}
function currentTextArea(page=currentPage(),area=activeTextArea){
  if(isFullCover(page))return textAreaName(area)==='back'?'back':'front';
  return 'main';
}
function setTextAreaValue(page,area,prop,value){
  page[textAreaField(currentTextArea(page,area),prop)]=value;
}
function copyAreaFromElement(target){
  return textAreaName(target?.closest?.('[data-text-area]')?.dataset.textArea);
}
function textWidth(page,area='main'){
  const value=textAreaValue(page,area,'Width',page.textWidth==null?PAGE_TEMPLATE.textWidth:page.textWidth);
  return Math.max(20,Math.min(100,+value||PAGE_TEMPLATE.textWidth));
}
function textX(page,area='main'){
  return clamp(textAreaValue(page,area,'X',page.textX),-320,320);
}
function textY(page,area='main'){
  return clamp(textAreaValue(page,area,'Y',page.textY),-420,420);
}
function textGap(page,area='main'){
  return clamp(textAreaValue(page,area,'Gap',page.textGap),-10,48);
}
function textAlign(page,area='main'){
  const value=textAreaValue(page,area,'Align',page.textAlign);
  return ['left','center','right'].includes(value)?value:PAGE_TEMPLATE.textAlign;
}
function bodySize(page){
  return Math.max(7,Math.min(18,+page.bodySize||PAGE_TEMPLATE.bodySize));
}
function titleFontKey(page){
  return TITLE_FONTS[page.titleFont]?page.titleFont:PAGE_TEMPLATE.titleFont;
}
function bodyFontKey(page){
  return BODY_FONTS[page.bodyFont]?page.bodyFont:PAGE_TEMPLATE.bodyFont;
}
function fontVars(page){
  return `--titlefont:${TITLE_FONTS[titleFontKey(page)]};--bodyfont:${BODY_FONTS[bodyFontKey(page)]};`;
}
function normalizeTextKey(key){
  return TEXT_TARGETS[key]?key:'serie';
}
function cloneTextStyles(styles){
  const out={};
  if(!styles||typeof styles!=='object')return out;
  TEXT_KEYS.forEach(key=>{
    if(styles[key]&&typeof styles[key]==='object')out[key]={...styles[key]};
  });
  return out;
}
function ensureTextStyles(page){
  if(!page.textStyles||typeof page.textStyles!=='object'||Array.isArray(page.textStyles))page.textStyles={};
  TEXT_KEYS.forEach(key=>{
    if(!page.textStyles[key]||typeof page.textStyles[key]!=='object'||Array.isArray(page.textStyles[key]))page.textStyles[key]={};
  });
  return page.textStyles;
}
function textStyle(page,key){
  key=normalizeTextKey(key);
  return ensureTextStyles(page)[key];
}
function textDefaultSize(page,key){
  key=normalizeTextKey(key);
  if(key==='serie')return +page.tsize||PAGE_TEMPLATE.tsize;
  if(key==='intro')return bodySize(page);
  if(key==='coverBackTitle')return Math.max(16,Math.round((+page.tsize||PAGE_TEMPLATE.tsize)*.54));
  if(key==='coverBackText')return Math.max(8,bodySize(page));
  return TEXT_TARGETS[key].size||12;
}
function textSize(page,key){
  key=normalizeTextKey(key);
  const value=textStyle(page,key).size;
  return Math.max(5,Math.min(96,+value||textDefaultSize(page,key)));
}
function textLeading(page,key){
  key=normalizeTextKey(key);
  const value=textStyle(page,key).leading;
  return Math.max(.9,Math.min(2.8,+value||TEXT_TARGETS[key].leading||1.4));
}
function textBool(page,key,prop){
  key=normalizeTextKey(key);
  const value=textStyle(page,key)[prop];
  return value==null?!!TEXT_TARGETS[key][prop]:!!value;
}
function textFontKey(page,key){
  key=normalizeTextKey(key);
  const custom=textStyle(page,key).font;
  if(custom&&(TITLE_FONTS[custom]||BODY_FONTS[custom]))return custom;
  return TEXT_TARGETS[key].fontGroup==='title'?titleFontKey(page):bodyFontKey(page);
}
function textFontCss(page,key){
  const font=textFontKey(page,key);
  return TITLE_FONTS[font]||BODY_FONTS[font]||TITLE_FONTS.playfair;
}
function textCustomColor(page,key){
  const value=textStyle(page,key).color;
  return /^#[0-9a-f]{6}$/i.test(value||'')?value:null;
}
function textColorInput(page,key){
  const custom=textCustomColor(page,key);
  if(custom)return custom;
  const isCover=isFullCover(page)||isSingleCover(page);
  if(key==='kick'||key==='coverBackKick'||key==='spineText')return TEXT_ACCENT;
  if(isCover&&!page.img){
    if(key==='chapt')return '#6E685F';
    if(key==='intro'||key==='coverBackText')return '#4A453D';
    return TITLE_ACCENT;
  }
  if(isCover)return '#FFFDF7';
  if(key==='chapt')return '#6E685F';
  if(key==='intro'||key==='coverBackText')return '#4A453D';
  if(key==='serie')return TITLE_ACCENT;
  return '#171717';
}
function textStyleVars(page,key){
  key=normalizeTextKey(key);
  return `--text-size:${textSize(page,key)}px;--text-leading:${textLeading(page,key)};--text-font:${textFontCss(page,key)};--text-weight:${textBool(page,key,'bold')?700:400};--text-style:${textBool(page,key,'italic')?'italic':'normal'};--text-transform:${textBool(page,key,'upper')?'uppercase':'none'};--text-color:${textColorInput(page,key)};`;
}
function setTextStyle(page,key,prop,value){
  key=normalizeTextKey(key);
  const style=textStyle(page,key);
  if(prop==='size'){
    style.size=Math.max(5,Math.min(96,+value||textDefaultSize(page,key)));
    if(key==='serie')page.tsize=style.size;
    if(key==='intro'||key==='coverBackText')page.bodySize=style.size;
    return;
  }
  if(prop==='leading'){
    style.leading=Math.max(.9,Math.min(2.8,+value||TEXT_TARGETS[key].leading||1.4));
    return;
  }
  if(prop==='font'){
    if(value&&(TITLE_FONTS[value]||BODY_FONTS[value]))style.font=value;
    return;
  }
  if(prop==='color'){
    if(/^#[0-9a-f]{6}$/i.test(value||''))style.color=value;
    return;
  }
  if(['bold','italic','upper'].includes(prop))style[prop]=!!value;
}
function canvasFont(font){
  return font.replace(/'/g,'"');
}
function canvasTitleFont(page){
  return canvasFont(TITLE_FONTS[titleFontKey(page)]);
}
function canvasBodyFont(page){
  return canvasFont(BODY_FONTS[bodyFontKey(page)]);
}
function copyVars(page,area='main'){
  area=currentTextArea(page,area);
  return `--copyw:${textWidth(page,area)}%;--copyx:${textX(page,area)}px;--copyy:${textY(page,area)}px;--copygap:${textGap(page,area)}px;--copyalign:${textAlign(page,area)};--bodysize:${bodySize(page)}px;`;
}
function copyClass(page,area='main'){
  return 'align-'+textAlign(page,currentTextArea(page,area));
}
function layoutLabel(page){
  if(isFullCover(page))return 'Couverture double';
  if(page.layout==='dual')return 'Deux images';
  if(page.layout==='panorama')return 'Grande image';
  return 'Image + texte';
}
function ruleClass(page){
  return filetActif(page)?'has-filet':'no-filet';
}
function ruleOrnament(page){
  return filetActif(page)?'<div class="filet-libre"></div>':'';
}
function ruleMark(){
  return '';
}
function panoramaDecor(page){
  return ruleOrnament(page);
}
function interiorPageCount(page){
  if(isFullCover(page))return 0;
  if(isSingleCover(page))return 0;
  if(isMixedCover(page))return 1;
  return 2;
}
function interiorPageStart(index){
  let pageNumber=1;
  for(let i=0;i<index;i++)pageNumber+=interiorPageCount(pages[i]);
  return pageNumber;
}
function makePage(overrides={}){
  const page={...PAGE_TEMPLATE,...overrides};
  page.textStyles=cloneTextStyles(overrides.textStyles);
  page.textHidden={...(overrides.textHidden||{})};
  migrerDecor(page,overrides);
  if(!Object.prototype.hasOwnProperty.call(overrides,'surface'))page.surface=surfaceForKind(page.kind);
  const preservesBlankColor=Object.prototype.hasOwnProperty.call(overrides,'img')||Object.prototype.hasOwnProperty.call(overrides,'img2');
  if(!preservesBlankColor&&!page.img&&!page.img2){
    page.hue=BLANK_IMAGE_BG;
    page.intensity=100;
  }
  // Le papier n'est plus réglable : une seule teinte pour tout le livre. On la
  // réimpose ici pour que les anciens projets s'alignent aussi à l'ouverture.
  page.paper=PAPER_TINT;
  applySurfaceRules(page);
  return page;
}
function currentPage(){
  return pages[activeIndex];
}
function autoPageName(index,page=pages[index]){
  if(page.surface==='cover-wrap')return 'Couverture double';
  if(page.surface==='cover-front')return 'Couverture recto';
  if(page.surface==='cover-back')return 'Couverture verso';
  if(page.surface==='inside-front')return 'Début du livre';
  if(page.surface==='inside-back')return 'Fin du livre';
  const start=interiorPageStart(index);
  return `Pages ${pad2(start)}-${pad2(start+1)}`;
}
function refreshAutoNames(){
  pages.forEach((page,index)=>{
    if(page.autoName!==false)page.name=autoPageName(index,page);
  });
}
function pageRange(index,page=pages[index]){
  const start=interiorPageStart(index);
  if(page.surface==='cover-wrap')return 'couverture double';
  if(page.surface==='cover-front')return 'couverture recto';
  if(page.surface==='inside-front')return `dedans couverture + p. ${start}`;
  if(page.surface==='inside-back')return `p. ${start} + dedans couverture`;
  if(page.surface==='cover-back')return 'couverture verso';
  return `p. ${start}-${start+1}`;
}
// Les folios sont posés au niveau de la double-page, pas dans une page : ils
// doivent pouvoir apparaître des deux côtés quelle que soit la mise en page
// (image + texte, deux images, grande image).
function folioMarks(page,index){
  if(folioPosition==='none')return '';
  if(isFullCover(page)||isSingleCover(page))return '';
  const debut=interiorPageStart(index);
  let gauche='',droite='';
  if(isMixedCover(page)){
    // Une seule page intérieure dans la vue : à droite au début du livre,
    // à gauche à la fin.
    if(page.surface==='inside-front')droite=pad2(debut);
    else gauche=pad2(debut);
  }else{
    gauche=pad2(debut);
    droite=pad2(debut+1);
  }
  if(!folioSideAllowed(page,'left'))gauche='';
  if(!folioSideAllowed(page,'right'))droite='';
  if(!gauche&&!droite)return '';
  const {x,y}=folioOffsets();
  const police=folioFontCss();
  const veut=cote=>folioPosition==='both'||folioPosition===cote;
  const style=`bottom:${y}%;font-family:${police};color:${folioColor}`;
  let html='';
  // Chacun se mesure depuis SON bord extérieur : c'est ce qui les rend
  // symétriques l'un de l'autre sans réglage séparé.
  if(gauche&&veut('left'))html+=`<span class="folio folio-left" style="left:${x}%;${style}">${gauche}</span>`;
  if(droite&&veut('right'))html+=`<span class="folio folio-right" style="right:${x}%;${style}">${droite}</span>`;
  return html;
}
function mmPct(value,total){
  return (value/total*100).toFixed(3)+'%';
}
function activePrintPageCount(){
  return Math.max(2,totalInteriorPages());
}
function insideSafeMm(pageCount=activePrintPageCount()){
  if(pageCount<=150)return 9.6;
  if(pageCount<=300)return 12.7;
  if(pageCount<=500)return 15.9;
  if(pageCount<=700)return 19.1;
  return 22.3;
}
function coverMetrics(pageCount=activePrintPageCount()){
  const visualPageCount=Math.max(pageCount,30);
  const spine=visualPageCount*PREMIUM_COLOR_SPINE_MM;
  const totalW=BLEED_MM+TRIM_W_MM+spine+TRIM_W_MM+BLEED_MM;
  const totalH=TRIM_H_MM+BLEED_MM*2;
  return {
    pageCount,visualPageCount,spine,totalW,totalH,
    ratio:totalW/totalH,
    bleedX:mmPct(BLEED_MM,totalW),
    bleedY:mmPct(BLEED_MM,totalH),
    backX:mmPct(BLEED_MM,totalW),
    backW:mmPct(TRIM_W_MM,totalW),
    spineX:mmPct(BLEED_MM+TRIM_W_MM,totalW),
    spineW:mmPct(spine,totalW),
    frontX:mmPct(BLEED_MM+TRIM_W_MM+spine,totalW),
    frontW:mmPct(TRIM_W_MM,totalW)
  };
}
function coverVars(){
  const m=coverMetrics();
  return `--cover-ratio:${m.ratio.toFixed(4)};--cover-bleed-x:${m.bleedX};--cover-bleed-y:${m.bleedY};--cover-back-x:${m.backX};--cover-panel-w:${m.backW};--cover-spine-x:${m.spineX};--cover-spine-w:${m.spineW};--cover-front-x:${m.frontX};`;
}
function guideVars(page){
  if(isFullCover(page)){
    const m=coverMetrics();
    return `${coverVars()}--safe-y:${mmPct(KDP_SAFE_OUT_MM,m.totalH)};--safe-x:${mmPct(KDP_SAFE_OUT_MM,m.totalW)};`;
  }
  // Les repères se placent depuis le bord du fichier, fond perdu compris : la zone
  // sûre se compte à partir du trait de coupe, pas du bord de l'image.
  const m=innerMetrics(isSingleCover(page)?1:2);
  return `--safe-out:${mmPct(BLEED_MM+KDP_SAFE_OUT_MM,m.totalW)};--safe-in:${mmPct(insideSafeMm(),m.totalW)};--safe-y:${mmPct(BLEED_MM+KDP_SAFE_OUT_MM,m.totalH)};`;
}
function targetPixels(page,slot='img'){
  if(isFullCover(page)){
    const m=coverMetrics();
    return {w:Math.round(m.totalW/25.4*PRINT_DPI),h:Math.round(m.totalH/25.4*PRINT_DPI),label:'couverture double'};
  }
  // Les tailles conseillées couvrent le fond perdu : une image calée sur le seul
  // format rogné laisserait un bord blanc après la coupe.
  const haut=Math.round((TRIM_H_MM+BLEED_MM*2)/25.4*PRINT_DPI);
  if(isSingleCover(page)){
    return {w:Math.round(innerMetrics(1).totalW/25.4*PRINT_DPI),h:haut,label:'couverture'};
  }
  if(page.layout==='panorama'){
    return {w:Math.round(innerMetrics(2).totalW/25.4*PRINT_DPI),h:haut,label:'grande image'};
  }
  return {w:Math.round((TRIM_W_MM+BLEED_MM)/25.4*PRINT_DPI),h:haut,label:slot==='img2'?'image droite':'image'};
}
function imageMeta(page,slot='img'){
  return slot==='img2'
    ? {name:page.img2Name,w:page.img2W,h:page.img2H,url:page.img2}
    : {name:page.imgName,w:page.imgW,h:page.imgH,url:page.img};
}
function pageHasImage(page){
  return !!(page.img||page.img2||page.topImg);
}
function qualityState(page,slot='img'){
  const meta=imageMeta(page,slot);
  const target=targetPixels(page,slot);
  if(!meta.url)return {status:'empty',title:slot==='img2'?'Image droite':'Image',text:'Aucune image importée.',target};
  if(!meta.w||!meta.h)return {status:'wait',title:meta.name||target.label,text:'Taille en cours de lecture.',target};
  const score=Math.min(meta.w/target.w,meta.h/target.h);
  const ok=score>=1;
  const warn=score>=.78;
  // Le rapport à la cible se lit directement en points par pouce : c'est ce que
  // demande l'imprimeur, et c'est plus parlant qu'un nombre de pixels à viser.
  const dpi=Math.round(score*PRINT_DPI);
  return {
    status:ok?'ok':warn?'warn':'bad',
    title:meta.name||target.label,
    text:`${meta.w} × ${meta.h} px · ${dpi} dpi à cette taille · viser ${target.w} × ${target.h} px`,
    dpi,
    target
  };
}

let pages=makeBookPages(8);
let activeIndex=0;
let draggedIndex=null;
let pointerDrag=null;
let suppressThumbClick=false;
let previewDock='right';
let cleanPreview=false;
let readerOpen=false;
let uiMode='advanced';
let showPrintGuides=true;
let preparedExports=[];
let activeImageSlot='img';
let activeTextKey='serie';
let activeTextArea='main';
let stageDrag=null;
let textRangeDrag=null;
let suppressSpreadClick=false;
let bookPageTimer=null;
let renderingSpread=false;

function cssUrl(url){
  return String(url).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}
function imageStyle(page,slot='img'){
  const src=imageUrl(page,slot);
  const bg=`background-color:${imageBackground(page,slot)};`;
  if(!src)return bg;
  const fit=imageFit(page,slot)==='fill'?'cover':'contain';
  const miroir=imageFlipped(page,slot)?'transform:scaleX(-1);':'';
  return `${bg}background-image:url('${cssUrl(src)}');background-size:${fit};background-position:calc(50% + ${imageOffsetX(page,slot)}%) calc(50% + ${imageOffsetY(page,slot)}%);background-repeat:no-repeat;${miroir}`;
}
function imageBoxClass(page,slot='img'){
  return `image-fit-${imageFit(page,slot)}${imageRule(page,slot)?' image-rule':''}${activeImageSlot===slot?' selected-image':''}${imageUrl(page,slot)?'':' empty'}`;
}
function thumbImageClass(page,slot='img'){
  return 'thumb-img '+imageBoxClass(page,slot)+(imageUrl(page,slot)?'':' empty');
}
function imageLayer(page,slot='img',withShade=true){
  if(typeof slot==='boolean'){
    withShade=slot;
    slot='img';
  }
  const src=imageUrl(page,slot);
  if(!src)return '';
  return `<span class="image-window${imageHugs(page,slot)?' hug':''}">
      <img class="image-layer" src="${escAttr(src)}" alt="">
      <span class="image-carve">${imageCarveMarkup(page,slot)}</span>
      ${withShade?'<span class="darken"></span>':''}
    </span>`;
}
function moveHandle(kind){
  if(isPageLocked(currentPage()))return '';
  return `<button class="move-handle" data-drag="${kind}" type="button" aria-label="Déplacer" title="Déplacer" data-html2canvas-ignore="true"></button>`;
}
function undoBadge(page){
  if(!page.lastClearedKey||isPageLocked(page))return '';
  return `<button type="button" data-text-tool="undo-clear" class="text-tool-undo-badge" title="Rétablir la dernière ligne effacée" data-html2canvas-ignore="true">↩ Rétablir la ligne</button>`;
}
function imageTools(page,slot){
  if(isPageLocked(page))return '';
  const hasImage=!!imageUrl(page,slot);
  if(activeImageSlot!==slot&&hasImage)return '';
  const replaceLabel="Charger ou remplacer l'image";
  const extra=hasImage?`
      <button type="button" data-image-tool="clear" data-slot="${slot}" title="Supprimer l'image">Suppr.</button>
      <button type="button" data-image-tool="fit" data-slot="${slot}" title="Changer le cadrage : remplir ou voir entière">Cadrage</button>
      <button type="button" data-image-tool="zoom-out" data-slot="${slot}" title="Réduire">-</button>
      <button type="button" data-image-tool="zoom-in" data-slot="${slot}" title="Agrandir">+</button>
      <button type="button" data-image-tool="rot-left" data-slot="${slot}" title="Pivoter à gauche">↺</button>
      <button type="button" data-image-tool="rot-right" data-slot="${slot}" title="Pivoter à droite">↻</button>
      <button type="button" data-image-tool="flip" data-slot="${slot}" class="${imageFlipped(page,slot)?'on':''}" title="Miroir : inverser la gauche et la droite de l'image">⇄</button>`:'';
  return `<div class="object-tools image-tools" data-html2canvas-ignore="true">
      <button type="button" data-image-tool="replace" data-slot="${slot}" title="Charger ou remplacer l'image">${replaceLabel}</button>
      ${extra}
    </div>`;
}
function fontOptions(options,active){
  return options.map(([value,label])=>`<option value="${escAttr(value)}"${value===active?' selected':''}>${esc(label)}</option>`).join('');
}
function textScopeList(scope){
  return String(scope||'').split(',').map(normalizeTextKey).filter((key,index,list)=>list.indexOf(key)===index);
}
function textKeyForScope(scope,defaultKey='serie'){
  const list=Array.isArray(scope)?scope:textScopeList(scope);
  if(list.includes(activeTextKey))return activeTextKey;
  return list.includes(defaultKey)?defaultKey:(list[0]||'serie');
}
function textKeyFromToolbar(toolbar){
  return textKeyForScope(toolbar?.dataset.textScope||'',toolbar?.dataset.textDefault||'serie');
}
function textAreaFromToolbar(toolbar){
  return currentTextArea(currentPage(),toolbar?.dataset.textArea||activeTextArea);
}
function textAreaLabel(page,area=activeTextArea){
  const current=currentTextArea(page,area);
  if(isFullCover(page))return current==='back'?'page gauche de la couverture':'page droite de la couverture';
  return 'page active';
}
function syncTextBlockPanel(page=currentPage(),area=activeTextArea){
  area=currentTextArea(page,area);
  setText('textBlockName','Réglages du texte : '+textAreaLabel(page,area));
  setVal('tw',textWidth(page,area));
  setText('twV',textWidth(page,area)+' %');
  setVal('tx',textX(page,area));
  setText('txV',textX(page,area));
  setVal('ty',textY(page,area));
  setText('tyV',textY(page,area));
  setVal('tg',textGap(page,area));
  setText('tgV',textGap(page,area));
  setSegment('textAlign',textAlign(page,area));
}
function setActiveTextFromTarget(target){
  const editable=target?.closest?.('[data-edit]');
  if(!editable)return false;
  setActiveTextKey(editable.dataset.edit,copyAreaFromElement(editable));
  return true;
}
function textToolStatus(page,key){
  key=normalizeTextKey(key);
  return `${TEXT_TARGETS[key].label} · ${Math.round(textSize(page,key))}`;
}
function textTools(page,defaultKey='serie',scope=['kick','chapt','serie','intro'],area='main'){
  const keys=scope.map(normalizeTextKey).filter((key,index,list)=>list.indexOf(key)===index);
  const key=textKeyForScope(keys,defaultKey);
  const areaName=currentTextArea(page,area);
  const align=textAlign(page,areaName);
  return `<div class="object-tools text-tools" data-text-scope="${escAttr(keys.join(','))}" data-text-default="${escAttr(normalizeTextKey(defaultKey))}" data-text-area="${escAttr(areaName)}" data-html2canvas-ignore="true">
      <span class="tool-status" data-text-status>${esc(textToolStatus(page,key))}</span>
      <select data-text-select="font" title="Police du texte choisi">${fontOptions(TEXT_FONT_OPTIONS,textFontKey(page,key))}</select>
      <span class="text-size-control">
        <button type="button" data-text-tool="size-smaller" title="Texte plus petit">A-</button>
        <input type="range" min="5" max="96" value="${Math.round(textSize(page,key))}" data-text-range="size" title="Taille du texte choisi">
        <button type="button" data-text-tool="size-bigger" title="Texte plus grand">A+</button>
      </span>
      <button type="button" data-text-tool="bold" class="${textBool(page,key,'bold')?'on':''}" title="Gras">B</button>
      <button type="button" data-text-tool="italic" class="${textBool(page,key,'italic')?'on':''}" title="Italique">I</button>
      <button type="button" data-text-tool="upper" class="${textBool(page,key,'upper')?'on':''}" title="Majuscules">AA</button>
      <button type="button" data-text-align="left" class="${align==='left'?'on':''}" title="Aligner a gauche">L</button>
      <button type="button" data-text-align="center" class="${align==='center'?'on':''}" title="Centrer">C</button>
      <button type="button" data-text-align="right" class="${align==='right'?'on':''}" title="Aligner a droite">R</button>
      <button type="button" data-text-tool="leading-smaller" title="Interligne plus serre">LH-</button>
      <button type="button" data-text-tool="leading-bigger" title="Interligne plus ouvert">LH+</button>
      <input type="color" value="${escAttr(textColorInput(page,key))}" data-text-color title="Couleur du texte choisi">
      <button type="button" data-text-tool="clear" class="text-tool-clear" title="Double-cliquer pour effacer cette ligne">🗑</button>
      <span class="text-tool-clear-hint">2 clics = supprimer</span>
    </div>`;
}
function updateTextToolbars(){
  const page=currentPage();
  document.querySelectorAll('.text-tools').forEach(toolbar=>{
    const key=textKeyFromToolbar(toolbar);
    const area=textAreaFromToolbar(toolbar);
    const align=textAlign(page,area);
    const status=toolbar.querySelector('[data-text-status]');
    const select=toolbar.querySelector('[data-text-select="font"]');
    const size=toolbar.querySelector('[data-text-range="size"]');
    const color=toolbar.querySelector('[data-text-color]');
    if(status)status.textContent=textToolStatus(page,key);
    if(select)select.value=textFontKey(page,key);
    if(size)size.value=Math.round(textSize(page,key));
    if(color)color.value=textColorInput(page,key);
    toolbar.querySelectorAll('[data-text-tool="bold"]').forEach(button=>button.classList.toggle('on',textBool(page,key,'bold')));
    toolbar.querySelectorAll('[data-text-tool="italic"]').forEach(button=>button.classList.toggle('on',textBool(page,key,'italic')));
    toolbar.querySelectorAll('[data-text-tool="upper"]').forEach(button=>button.classList.toggle('on',textBool(page,key,'upper')));
    toolbar.querySelectorAll('[data-text-align]').forEach(button=>button.classList.toggle('on',button.dataset.textAlign===align));
  });
}
function setActiveTextKey(key,area=activeTextArea){
  activeTextKey=normalizeTextKey(key);
  activeTextArea=currentTextArea(currentPage(),area);
  syncTextBlockPanel(currentPage(),activeTextArea);
  updateTextToolbars();
}
function applyLiveTextStyle(key){
  const page=currentPage();
  key=normalizeTextKey(key);
  document.querySelectorAll(`[data-edit="${key}"]`).forEach(node=>{
    node.style.setProperty('--text-size',textSize(page,key)+'px');
    node.style.setProperty('--text-leading',textLeading(page,key));
    node.style.setProperty('--text-font',textFontCss(page,key));
    node.style.setProperty('--text-weight',textBool(page,key,'bold')?700:400);
    node.style.setProperty('--text-style',textBool(page,key,'italic')?'italic':'normal');
    node.style.setProperty('--text-transform',textBool(page,key,'upper')?'uppercase':'none');
    const customColor=textCustomColor(page,key);
    if(customColor)node.style.setProperty('--text-color',customColor);
    else node.style.removeProperty('--text-color');
  });
}
function syncTextSizePanel(key,area=activeTextArea){
  const page=currentPage();
  key=normalizeTextKey(key);
  if(key==='serie'){
  }
  if(key==='intro'||key==='coverBackText'){
  }
  syncTextBlockPanel(page,area);
}
function updateTextRangeFromPointer(e){
  if(!textRangeDrag)return;
  const page=currentPage();
  const min=textRangeDrag.min;
  const max=textRangeDrag.max;
  const pct=Math.max(0,Math.min(1,(e.clientX-textRangeDrag.rect.left)/Math.max(1,textRangeDrag.rect.width)));
  const value=Math.round(min+(max-min)*pct);
  textRangeDrag.range.value=value;
  activeTextKey=textRangeDrag.key;
  activeTextArea=currentTextArea(page,textRangeDrag.area);
  setTextStyle(page,textRangeDrag.key,'size',value);
  syncTextSizePanel(textRangeDrag.key,activeTextArea);
  applyLiveTextStyle(textRangeDrag.key);
  updateTextToolbars();
}
function finishTextRangeDrag(){
  textRangeDrag=null;
}
function topImageTools(){
  return `<div class="object-tools top-tools" data-html2canvas-ignore="true">
      <button type="button" data-top-tool="replace" title="Remplacer l'image du dessus">Remplacer l'image</button>
      <button type="button" data-top-tool="clear" title="Supprimer l'image du dessus">Suppr.</button>
      <button type="button" data-top-tool="smaller" title="Réduire">-</button>
      <button type="button" data-top-tool="bigger" title="Agrandir">+</button>
      <button type="button" data-top-tool="rot-left" title="Pivoter à gauche">↺</button>
      <button type="button" data-top-tool="rot-right" title="Pivoter à droite">↻</button>
    </div>`;
}
function topImageLayer(page,slot='img'){
  if(!page.topImg||topImageSlot(page)!==slot)return '';
  return `<div class="top-image-object" data-top-img="true" style="${topImageVars(page)}--acc:${page.rule};">
      <img src="${escAttr(page.topImg)}" alt="">
      ${topImageTools()}
    </div>`;
}
function imagePage(page,slot,label){
  const src=imageUrl(page,slot);
  return `<div class="page img ${imageBoxClass(page,slot)}" data-img-slot="${slot}" style="${imageVars(page,slot)}--acc:${page.rule};">
      ${imageLayer(page,slot)}
      ${imageTools(page,slot)}
      ${topImageLayer(page,slot)}
    </div>`;
}

// Marges du texte, exprimées en pourcentage de la page entière, fond perdu
// compris : un pourcentage horizontal se compte sur la largeur, un vertical sur
// la hauteur. Une seule valeur pour les deux axes donnait une marge du haut plus
// grande que celle des côtés, et la largeur de référence était figée à 203 mm,
// donc fausse dès qu'on changeait de format.
function padVars(page,pages=2){
  const largeur=(pages===2?TRIM_W_MM+BLEED_MM:TRIM_W_MM*pages+BLEED_MM*2);
  const hauteur=TRIM_H_MM+BLEED_MM*2;
  const marge=+page.margin||0;
  return `--pad:${(marge/largeur*100).toFixed(3)}%;--pad-y:${(marge/hauteur*100).toFixed(3)}%;`;
}
function galerie(page,index){
  const padPct=padVars(page,2);
  const imgpage=`<div class="page img ${imageBoxClass(page,'img')}" data-img-slot="img" style="${imageVars(page,'img')}--acc:${page.rule};">
      ${imageLayer(page)}
      ${imageTools(page,'img')}
      ${topImageLayer(page,'img')}
    </div>`;
  const paper=`<div class="page paper rule-page ${ruleClass(page)}" style="--paper:${page.paper};${padPct}${ruleVars(page)}${copyVars(page)}${fontVars(page)}--tsize:${page.tsize}px">
      ${ruleOrnament(page)}
      <div class="copy-block ${copyClass(page)}">
        <div class="copy-stack">
          ${moveHandle('text')}
          ${undoBadge(page)}
          ${textLine(page,'kick','p','kick','Mention du haut')}
          ${textLine(page,'chapt','div','chapt','Sous-titre')}
          ${textLine(page,'serie','h3','serie','Titre')}
          ${ruleMark(page)}
          ${textLine(page,'intro','p','intro','Paragraphe')}
        </div>
      </div>
    </div>`;
  return imgpage+paper;
}
function dualImages(page){
  return imagePage(page,'img','Image gauche<br>dépose ou remplace')+imagePage(page,'img2','Image droite<br>dépose ou remplace');
}
function panorama(page){
  return `<div class="page img pano-page rule-page ${imageBoxClass(page,'img')} ${ruleClass(page)}" data-img-slot="img" style="${imageVars(page,'img')}${panoVars(page)}${ruleVars(page)}--acc:${page.rule};">
      ${imageLayer(page)}
      ${imageTools(page,'img')}
      ${topImageLayer(page,'img')}
      ${panoramaDecor(page)}
      <div class="pano-gutter sep-${panoSep(page)}"></div>
    </div>`;
}
function fullCover(page){
  const metrics=coverMetrics();
  const spineOk=metrics.pageCount>=79;
  const backKick=page.coverBackKick||page.kick||'';
  const backTitle=page.coverBackTitle||page.chapt||'';
  const backText=page.coverBackText||page.intro||'';
  const spine=page.spineText||page.serie||'Titre du livre';
  return `<div class="full-cover-page cover-page rule-page ${imageBoxClass(page,'img')} ${ruleClass(page)}${page.img?'':' empty'}" data-img-slot="img" style="${imageVars(page,'img')}${ruleVars(page)}${fontVars(page)}${coverVars()}--tsize:${page.tsize}px">
      ${imageLayer(page)}
      ${imageTools(page,'img')}
      ${topImageLayer(page,'img')}
      <div class="cover-zone cover-back-zone">
        <div class="cover-back-copy copy-block ${copyClass(page,'back')}" data-text-area="back" style="${copyVars(page,'back')}">
          <div class="copy-stack">
            ${moveHandle('text')}
            ${undoBadge(page)}
            ${textLine(page,'coverBackKick','p','kick','Mention du haut','',backKick,'back')}
            ${textLine(page,'coverBackTitle','h3','serie','Titre au verso','',backTitle,'back')}
            ${textLine(page,'coverBackText','p','intro','Texte au verso','',backText,'back')}
          </div>
        </div>
      </div>
      <div class="cover-spine-zone ${spineOk?'':'too-small'}">
        ${isTextHidden(page,'spineText')?'':`<span class="spine-title" style="${textStyleVars(page,'serie')}" ${editAttrs('spineText','Titre sur le dos')}>${esc(spine)}</span>`}
        ${isTextHidden(page,'kick')?'':`<span class="spine-author" style="${textStyleVars(page,'kick')}" ${editAttrs('kick','Auteur sur le dos')}>${esc(page.kick||'')}</span>`}
      </div>
      <div class="cover-zone cover-front-zone">
        ${ruleOrnament(page)}
        <div class="cover-copy copy-block ${copyClass(page,'front')}" data-text-area="front" style="${copyVars(page,'front')}">
          <div class="copy-stack">
            ${moveHandle('text')}
            ${undoBadge(page)}
            ${textLine(page,'kick','p','kick','Mention du haut','',page.kick,'front')}
            ${textLine(page,'chapt','div','chapt','Sous-titre','',page.chapt,'front')}
            ${textLine(page,'serie','h3','serie','Titre','',page.serie,'front')}
            ${ruleMark(page)}
          </div>
        </div>
      </div>
    </div>`;
}
function coverPage(page){
  const frontFace=page.surface!=='cover-back';
  return `<div class="page cover-page ${frontFace?'cover-front-page':'cover-back-page'} rule-page ${imageBoxClass(page,'img')} ${ruleClass(page)}${page.img?'':' empty'}" data-img-slot="img" style="${imageVars(page,'img')}--cover:${page.hue};${ruleVars(page)}${copyVars(page)}${fontVars(page)}--tsize:${page.tsize}px">
      ${ruleOrnament(page)}
      ${imageLayer(page)}
      ${imageTools(page,'img')}
      ${topImageLayer(page,'img')}
      <div class="cover-copy copy-block ${copyClass(page)}">
        <div class="copy-stack">
          ${moveHandle('text')}
          ${undoBadge(page)}
          ${textLine(page,'kick','p','kick','Mention du haut')}
          ${textLine(page,'chapt','div','chapt','Sous-titre')}
          ${textLine(page,'serie','h3','serie','Titre')}
          ${ruleMark(page)}
          ${textLine(page,'intro','p','intro','Paragraphe')}
        </div>
      </div>
    </div>`;
}
function printGuides(page){
  if(!showPrintGuides)return '';
  const guideMode=pageHasImage(page)?'image-guides':'empty-guides';
  if(isFullCover(page)){
    return `<div class="print-guides cover-print-guides ${guideMode}" style="${guideVars(page)}" data-html2canvas-ignore="true">
      <div class="guide-bleed"></div>
      <div class="guide-trim"></div>
      <div class="cover-guide cover-guide-back"><span>4e</span></div>
      <div class="cover-guide cover-guide-spine"><span>dos</span></div>
      <div class="cover-guide cover-guide-front"><span>1re</span></div>
      <div class="guide-safe cover-safe-back"></div>
      <div class="guide-safe cover-safe-front"></div>
      <div class="guide-label bleed cover-bleed-label">fond perdu ${BLEED_MM.toFixed(1).replace('.',',')} mm</div>
      <div class="guide-label cut cover-cut-label">bord coupé</div>
      <div class="guide-label safe safe-left">zone sûre</div>
      <div class="guide-label safe safe-right">zone sûre</div>
    </div>`;
  }
  const single=isSingleCover(page);
  return `<div class="print-guides ${single?'single-guides':'spread-guides'} ${guideMode}" style="${guideVars(page)}" data-html2canvas-ignore="true">
      <div class="guide-bleed"></div>
      <div class="guide-trim"></div>
      ${single?'<div class="guide-safe guide-single"></div>':'<div class="guide-safe guide-left"></div><div class="guide-safe guide-right"></div><div class="guide-gutter-risk"></div><div class="guide-fold"></div>'}
      <div class="guide-label bleed spread-bleed-label">fond perdu ${BLEED_MM.toFixed(1).replace('.',',')} mm</div>
      <div class="guide-label cut spread-cut-label">bord coupé</div>
      ${single?'<div class="guide-label safe single-safe-label">zone sûre</div>':'<div class="guide-label safe safe-left">zone sûre</div><div class="guide-label safe safe-right">zone sûre</div><div class="guide-label fold-label">pli du livre</div>'}
    </div>`;
}
function printZoneMap(page){
  if(pageHasImage(page))return '';
  if(isFullCover(page)){
    return `<div class="print-zone-map cover-print-guides" style="${guideVars(page)}" data-html2canvas-ignore="true">
      <div class="zone-bleed"></div>
      <div class="zone-trim"></div>
      <div class="zone-safe cover-safe-back"></div>
      <div class="zone-safe cover-safe-front"></div>
    </div>`;
  }
  const single=isSingleCover(page);
  return `<div class="print-zone-map ${single?'single-guides':'spread-guides'}" style="${guideVars(page)}" data-html2canvas-ignore="true">
      <div class="zone-bleed"></div>
      <div class="zone-trim"></div>
      ${single?'<div class="zone-safe guide-single"></div>':'<div class="zone-safe guide-left"></div><div class="zone-safe guide-right"></div><div class="zone-fold"></div>'}
    </div>`;
}
function spreadClass(page,guides=false){
  const full=isFullCover(page);
  const single=isSingleCover(page);
  const side=effectiveSide(page);
  const usePanorama=page.layout==='panorama'&&!single&&!full;
  // « double » marque les vues à deux pages côte à côte : c'est le seul cas où
  // le fond perdu s'arrête au pli, et il faut savoir lequel des deux bords est
  // extérieur.
  const double=!full&&!single&&!usePanorama;
  return 'spread'
    +(full?' cover-full':'')
    +(single?' single':'')
    +(usePanorama?' panorama':'')
    +(double?' double':'')
    +(double&&side==='right'?' imgright':'')
    +(guides?' guides-on':'');
}
function spreadCore(page,index){
  const full=isFullCover(page);
  const single=isSingleCover(page);
  const useDual=page.layout==='dual'&&!single&&!full;
  const usePanorama=page.layout==='panorama'&&!single&&!full;
  return full?fullCover(page):single?coverPage(page):usePanorama?panorama(page):useDual?dualImages(page):galerie(page,index);
}
function spreadMarkup(page,index,{zones=true,guides=true}={}){
  const lockBadge=guides&&isPageLocked(page)?'<div class="page-locked-badge" data-html2canvas-ignore="true">🔒 Page verrouillée</div>':'';
  return spreadCore(page,index)+folioMarks(page,index)+(zones?printZoneMap(page):'')+(guides?printGuides(page):'')+lockBadge;
}
// Hauteur d'affichage commune à toutes les vues. Le livre est le même d'une page
// à l'autre : il doit garder la même hauteur à l'écran, seule sa largeur change
// (la couverture est plus large du dos, une page seule deux fois plus étroite).
// Calée sur la vue la plus large du livre, elle tient donc dans le cadre partout.
function bookDisplayHeight(dispoW,dispoH){
  let ratioMax=innerMetrics(2).ratio;
  if(pages.some(p=>isFullCover(p)))ratioMax=Math.max(ratioMax,coverMetrics().ratio);
  return Math.min(dispoH,dispoW/ratioMax);
}
function sizeSpreadNode(sp){
  const stage=sp&&sp.parentElement;
  if(!stage||!sp)return;
  const cs=getComputedStyle(sp);
  const cst=getComputedStyle(stage);
  const bornePx=v=>v&&v.endsWith('px')?parseFloat(v):Infinity;
  const nb=v=>parseFloat(v)||0;
  // clientWidth comprend le remplissage du cadre : sans le retirer, le livre est
  // calculé plus large que la place réelle, puis rogné sans que la hauteur suive.
  const dispoW=Math.min(stage.clientWidth-nb(cst.paddingLeft)-nb(cst.paddingRight),bornePx(cs.maxWidth));
  const dispoH=Math.min(stage.clientHeight-nb(cst.paddingTop)-nb(cst.paddingBottom),bornePx(cs.maxHeight));
  const ratio=spreadDisplayRatio(sp);
  if(!(dispoW>0&&dispoH>0&&ratio>0))return;
  let h=bookDisplayHeight(dispoW,dispoH);
  let w=h*ratio;
  if(w>dispoW){w=dispoW;h=w/ratio;}
  sp.style.width=w+'px';
  sp.style.height=h+'px';
}
function sizeSpread(){
  sizeSpreadNode(el('spread'));
  if(readerOpen)sizeSpreadNode(el('readerSpread'));
}
function spreadDisplayRatio(sp=el('spread')){
  if(sp&&sp.classList.contains('cover-full'))return coverMetrics().ratio;
  if(sp&&sp.classList.contains('single'))return innerMetrics(1).ratio;
  return innerMetrics(2).ratio;
}
function renderSpread(){
  if(renderingSpread)return;
  renderingSpread=true;
  const page=currentPage();
  const sp=el('spread');
  try{
    sp.className=spreadClass(page,showPrintGuides);
    sp.innerHTML=spreadMarkup(page,activeIndex,{zones:true,guides:true});
    sizeSpread();
  }finally{
    renderingSpread=false;
  }
}

function renderReader(turn=0){
  if(!readerOpen)return;
  const page=currentPage();
  const readerSpread=el('readerSpread');
  readerSpread.className=spreadClass(page,false)+' reader-spread';
  readerSpread.innerHTML=spreadMarkup(page,activeIndex,{zones:false,guides:false});
  el('readerStatus').textContent=`Page ${activeIndex+1} / ${pages.length} · ${pageRange(activeIndex)}`;
  el('readerPrev').disabled=activeIndex===0;
  el('readerNext').disabled=activeIndex===pages.length-1;
  sizeSpreadNode(readerSpread);
  if(turn){
    readerSpread.classList.remove('turn-next','turn-prev');
    void readerSpread.offsetWidth;
    readerSpread.classList.add(turn>0?'turn-next':'turn-prev');
  }
}
function openReader(){
  readerOpen=true;
  const reader=el('reader');
  reader.hidden=false;
  reader.setAttribute('aria-hidden','false');
  renderReader(0);
}
function closeReader(){
  readerOpen=false;
  const reader=el('reader');
  reader.hidden=true;
  reader.setAttribute('aria-hidden','true');
}
function navigateReader(delta){
  const next=activeIndex+delta;
  if(next<0||next>=pages.length)return;
  activeIndex=next;
  syncControls();
  refresh();
  renderReader(delta);
}

function thumbMarkup(page,index){
  const isActive=index===activeIndex;
  const imgClass=thumbImageClass(page);
  const label=page.name||page.serie||page.kind;
  const full=isFullCover(page);
  const single=isSingleCover(page);
  const side=effectiveSide(page);
  const pagesHtml=full
    ? `<span class="thumb-full-cover ${imgClass} ${ruleClass(page)}" style="${imageStyle(page)}"><span></span><i></i><span></span></span>`
    : single
    ? `<span class="thumb-page thumb-cover ${imgClass} ${ruleClass(page)}" style="${imageStyle(page)}"></span>`
    : page.layout==='panorama'
      ? `<span class="thumb-page thumb-panorama ${imgClass} ${ruleClass(page)}" style="${imageStyle(page)}"></span>`
      : page.layout==='dual'
        ? `<span class="thumb-page ${thumbImageClass(page,'img')}" style="${imageStyle(page,'img')}"></span><span class="thumb-page ${thumbImageClass(page,'img2')}" style="${imageStyle(page,'img2')}"></span>`
        : `<span class="thumb-page ${imgClass}" style="${imageStyle(page)}"></span><span class="thumb-page thumb-paper ${ruleClass(page)}" style="background-color:${page.paper}"></span>`;
  return `<button class="thumb${isActive?' on':''}" type="button" draggable="true" data-index="${index}" aria-current="${isActive?'page':'false'}" aria-label="Page ${index+1} de la liste, ${escAttr(label)}" title="${escAttr(pad2(index+1)+' / '+pad2(pages.length)+' · '+pageRange(index,page)+' · '+page.kind+' · '+label)}">
      <span class="thumb-spread-wrap"><span class="thumb-spread${full?' cover-full':''}${single?' single':''}${page.layout==='panorama'?' panorama sep-'+panoSep(page):''}${!full&&!single&&page.layout!=='panorama'&&side==='right'?' imgright':''}" style="--underbg:${imageBackground(page,'img')};${thumbRuleVars(page)}${panoVars(page)}">
        ${pagesHtml}
      </span></span>
      <span class="thumb-lock${page.locked?' on':''}" data-lock="${index}" role="button" tabindex="0" aria-pressed="${page.locked?'true':'false'}" title="${page.locked?'Page verrouillée — cliquer pour déverrouiller':'Verrouiller cette page'}">${page.locked?'🔒':'🔓'}</span>
      <span class="thumb-name">${esc(label)}</span>
    </button>`;
}
function renderRail(){
  el('filmstrip').innerHTML=pages.map(thumbMarkup).join('');
  el('pageStatus').textContent=`Page affichée ${activeIndex+1} / ${pages.length} · ${pageRange(activeIndex)}`;
  el('spreadPos').textContent=`${activeIndex+1} / ${pages.length}`;
  el('spreadPages').textContent=pageRange(activeIndex);
  el('spreadType').textContent=currentPage().kind;
  el('delPage').disabled=pages.length===1;
  montrerVignetteActive();
}
// La pellicule n'a plus de barre de défilement : il faut donc amener nous-mêmes
// la vignette active dans la zone visible, sinon sur un livre long on ne voit
// plus où on est. On ne touche qu'au défilement de la pellicule (pas de
// scrollIntoView, qui ferait aussi bouger la page entière).
function montrerVignetteActive(){
  const strip=el('filmstrip');
  const actif=strip&&strip.children[activeIndex];
  if(!strip||!actif)return;
  // On compare des rectangles écran : offsetLeft serait relatif au premier
  // ancêtre positionné, qui n'est pas la pellicule.
  const marge=8;
  const zone=strip.getBoundingClientRect();
  const v=actif.getBoundingClientRect();
  if(v.left<zone.left)strip.scrollLeft-=(zone.left-v.left)+marge;
  else if(v.right>zone.right)strip.scrollLeft+=(v.right-zone.right)+marge;
}
function totalInteriorPages(){
  return pages.reduce((sum,page)=>sum+interiorPageCount(page),0);
}
function imageSlotsOf(page){
  const slots=['img'];
  if(canUseSecondImage(page))slots.push('img2');
  return slots;
}
function bookStats(){
  let illustrees=0,placees=0,aRevoir=0;
  pages.forEach(page=>{
    const remplies=imageSlotsOf(page).filter(slot=>imageUrl(page,slot));
    if(remplies.length)illustrees++;
    placees+=remplies.length;
    remplies.forEach(slot=>{
      const etat=qualityState(page,slot).status;
      if(etat==='bad'||etat==='warn')aRevoir++;
    });
  });
  return {illustrees,vues:pages.length,placees,aRevoir};
}
function coverPageForTitle(){
  return pages.find(p=>p.surface==='cover-wrap')||pages.find(p=>p.surface==='cover-front')||null;
}
// Champs jumelés de la couverture double : on écrit toujours les deux pour
// qu'ils ne puissent jamais diverger.
//   - la mention d'auteur est commune au recto et au verso ;
//   - le texte du dos est le titre du livre.
const COVER_TWIN={kick:'coverBackKick',coverBackKick:'kick',serie:'spineText',spineText:'serie'};
function syncCoverTwin(page,key,value){
  if(!page||!isFullCover(page))return null;
  const twin=COVER_TWIN[key];
  if(!twin)return null;
  page[twin]=value;
  return twin;
}
// Recopie une valeur dans la ligne déjà affichée, sans reconstruire la page :
// un refresh() pendant la frappe détruirait le curseur et la sélection.
function paintTextLine(key,value,skipNode){
  document.querySelectorAll(`#spread [data-edit="${key}"]`).forEach(node=>{
    if(node===skipNode)return;
    if(node.innerText.replace(/ /g,' ').trim()===String(value).trim())return;
    node.textContent=value;
  });
}
function renderBookTitle(){
  const box=el('bookTitle');
  if(!box)return;
  // Pendant la frappe dans l'en-tête, on ne réécrit pas la zone : sinon le
  // curseur repartirait au début à chaque lettre.
  if(box.contains(document.activeElement))return;
  const couverture=coverPageForTitle();
  if(!couverture){box.innerHTML='';return;}
  const police=TITLE_FONTS[titleFontKey(couverture)];
  const verrou=isPageLocked(couverture);
  const titre=isTextHidden(couverture,'serie')?'':String(couverture.serie||'').trim();
  const sousTitre=isTextHidden(couverture,'chapt')?'':String(couverture.chapt||'').trim();
  const champ=(cls,key,valeur,repere)=>`<span class="${cls}" data-book-edit="${key}" contenteditable="${verrou?'false':'true'}" spellcheck="true" role="textbox" data-placeholder="${escAttr(repere)}" style="font-family:${police}">${esc(valeur)}</span>`;
  box.innerHTML=champ('book-title-main','serie',titre,'Titre du livre')+champ('book-title-sub','chapt',sousTitre,'Sous-titre');
}
function renderDashboard(){
  const box=el('dashboard');
  if(!box)return;
  const s=bookStats();
  const interieures=Math.max(2,totalInteriorPages());
  const dos=coverMetrics(interieures).spine;
  const dosTexte=interieures>=79?dos.toFixed(1).replace('.',',')+' mm':'trop fin';
  const carte=(libelle,valeur,detail,alerte)=>`<div class="dash-card${alerte?' alert':''}">
      <span class="dash-label">${esc(libelle)}</span>
      <strong class="dash-value">${esc(valeur)}</strong>
      <span class="dash-detail">${esc(detail)}</span>
    </div>`;
  box.innerHTML=
    carte('Avancement',s.illustrees+' / '+s.vues,s.illustrees===s.vues?'toutes les vues illustrées':(s.vues-s.illustrees)+' vue(s) sans image',false)+
    carte('Qualité',s.aRevoir?s.aRevoir+' à revoir':(s.placees?'OK':'—'),s.aRevoir?'résolution trop juste pour l\'impression':(s.placees?s.placees+' image(s) nette(s) pour l\'impression':'aucune image chargée'),!!s.aRevoir)+
    carte('Format',(TRIM_W_MM/10).toFixed(1).replace('.',',')+' × '+(TRIM_H_MM/10).toFixed(1).replace('.',',')+' cm',interieures+' pages · dos '+dosTexte,false)+
    carte('Export',EXPORT_DPI+' dpi',Math.round(spreadWidthMm()/25.4*EXPORT_DPI)+' px de large · prêt à imprimer',false);
}
function syncBookPages(){
  const count=Math.max(2,totalInteriorPages());
  el('bookPages').value=count;
  el('bookPagesV').textContent=count+' pages';
  if(el('stripPrev'))el('stripPrev').disabled=activeIndex===0;
  if(el('stripNext'))el('stripNext').disabled=activeIndex===pages.length-1;
  setText('exportCount',pages.length+(pages.length>1?' fichiers':' fichier'));
}
function canUseSecondImage(page){
  return page.layout==='dual'&&!isFullCover(page)&&!isSingleCover(page);
}
function visibleImageSlot(page=currentPage()){
  if(!canUseSecondImage(page)&&activeImageSlot==='img2')activeImageSlot='img';
  return activeImageSlot;
}
// Le dos reprend la couleur et la police du titre et de la mention d'auteur de
// la couverture, mais pas leur taille : une tranche fait quelques millimètres,
// un titre de couverture y déborderait largement. On plafonne donc après la
// mise en page, quand la largeur réelle du dos est connue.
const SPINE_TEXT_RATIO=0.62;
function fitSpineText(){
  document.querySelectorAll('.cover-spine-zone').forEach(zone=>{
    const large=zone.clientWidth;
    if(!large)return;
    const plafond=large*SPINE_TEXT_RATIO;
    zone.querySelectorAll('span').forEach(span=>{
      span.style.removeProperty('font-size');
      const voulu=parseFloat(getComputedStyle(span).fontSize)||0;
      if(voulu>plafond)span.style.fontSize=plafond.toFixed(2)+'px';
    });
  });
}
function fitTextTools(){
  const spread=el('spread');
  spread.querySelectorAll('.text-tools').forEach(tt=>{
    tt.classList.remove('flip-below');
    const page=tt.closest('.page')||spread;
    if(tt.getBoundingClientRect().top<page.getBoundingClientRect().top)tt.classList.add('flip-below');
  });
  const toolRects=[...spread.querySelectorAll('.object-tools')].map(t=>t.getBoundingClientRect());
  spread.querySelectorAll('.guide-label').forEach(label=>{
    const lr=label.getBoundingClientRect();
    const labelArea=lr.width*lr.height;
    const covered=labelArea>0&&toolRects.some(tr=>{
      const ox=Math.max(0,Math.min(tr.right,lr.right)-Math.max(tr.left,lr.left));
      const oy=Math.max(0,Math.min(tr.bottom,lr.bottom)-Math.max(tr.top,lr.top));
      return (ox*oy)/labelArea>0.3;
    });
    label.classList.toggle('label-hidden',covered);
  });
}
function sizeStage(){
  const stage=document.querySelector('.stage');
  if(!stage)return;
  const top=stage.getBoundingClientRect().top+window.scrollY;
  stage.style.setProperty('--stage-top',top+'px');
}
function refresh(){
  refreshAutoNames();
  renderExportNote();
  renderBookTitle();
  renderDashboard();
  renderSpread();
  renderRail();
  updateTextToolbars();
  renderReader();
  fitTextTools();
  fitSpineText();
  sizeStage();
  // Dernier mot sur la taille du livre : la place disponible n'est connue
  // qu'une fois tout le reste dessiné, sinon le livre garde la taille de la
  // vue précédente pendant un tour.
  sizeSpread();
  applyLanguage();
}
window.addEventListener('resize',()=>{sizeStage();sizeSpread();});

function setSegment(box,value){
  const node=el(box);
  if(!node)return;
  [...node.children].forEach(button=>button.classList.toggle('on',button.dataset.v===value));
}
function setFolioColorButton(value){
  const box=el('folioColors');
  if(!box)return;
  const courant=String(value||'').toLowerCase();
  let connu=false;
  box.querySelectorAll('button[data-c]').forEach(b=>{
    const on=b.dataset.c.toLowerCase()===courant;
    b.classList.toggle('on',on);
    if(on)connu=true;
  });
  const pick=el('folioColor');
  if(pick){
    if(courant)pick.value=courant;
    const cell=pick.closest('.pick');
    if(cell)cell.classList.toggle('on',!connu&&!!courant);
  }
}
function setRuleButton(value){
  const box=el('rules');
  if(!box)return;
  const courant=String(value||'').toLowerCase();
  let connu=false;
  box.querySelectorAll('button[data-c]').forEach(b=>{
    const on=b.dataset.c.toLowerCase()===courant;
    b.classList.toggle('on',on);
    if(on)connu=true;
  });
  // La pipette s'allume quand la couleur ne correspond à aucune teinte.
  const pick=el('rule');
  if(pick){
    if(courant)pick.value=courant;
    const cell=pick.closest('.pick');
    if(cell)cell.classList.toggle('on',!connu&&!!courant);
  }
}
// Le filet se pose sur la page de papier : le modèle « Deux images » n'en a pas.
function decorPossible(page=currentPage()){
  return page.layout!=='dual';
}
// « Deux images » et « Grande image » remplissent la double page d'images :
// aucune ligne de texte n'y est rendue, les réglages de texte n'auraient donc
// aucun effet. Même convention de grisage que pour le trait.
function syncTexteDisponible(page=currentPage()){
  const sansTexte=(page.layout==='dual'||page.layout==='panorama')&&!isFullCover(page)&&!isSingleCover(page);
  ['kick','chapt','serie','intro','tw','tx','ty','tg','m','resetTextBlock'].forEach(id=>{
    const n=el(id);
    if(n)n.disabled=sansTexte;
  });
  const align=el('textAlign');
  if(align)align.querySelectorAll('button').forEach(b=>{b.disabled=sansTexte;});
  const note=el('textNote');
  if(note){
    note.hidden=!sansTexte;
    note.textContent=sansTexte?"Non disponible : ce modèle remplit la double page d'images, aucun texte n'y est affiché.":'';
  }
}
function syncDecorDisponible(){
  const possible=decorPossible();
  ['filetOn','rw','rl','rx','ry','resetRule','ruleToAll'].forEach(id=>{const n=el(id);if(n)n.disabled=!possible;});
  // Seules les pastilles sont grisées : la pipette reste active car cette
  // couleur sert aussi au trait autour des images, disponible sur « Deux images ».
  const box=el('rules');
  if(box)box.querySelectorAll('button[data-c]').forEach(b=>{b.disabled=!possible;});
  const note=el('decorNote');
  if(note){
    note.hidden=possible;
    note.textContent=possible?'':"Non disponible : « Deux images » remplit la double page d'images bord à bord, il n'y a pas de page de papier où poser un trait.";
  }
}
function setRuleStyleButton(value){
  const actif=value==='line';
  const b=el('filetOn');
  if(b){b.classList.toggle('on',actif);b.setAttribute('aria-pressed',actif?'true':'false');}
  // Tant que le trait n'est pas affiché, ses réglages ne servent à rien : on
  // les replie pour ne laisser que le bouton et la couleur.
  const section=document.querySelector('.section-decor');
  if(section)section.classList.toggle('rule-off',!actif);
}
function surfacePresetForPage(page){
  if(page.surface==='cover-wrap')return 'fullCover';
  if(page.surface==='cover-front')return 'cover';
  if(page.surface==='inside-front')return 'insideFront';
  if(page.surface==='inside-back')return 'insideBack';
  if(page.surface==='cover-back')return 'backCover';
  return 'interior';
}
function templatePresetForPage(page){
  if(isFullCover(page)||isSingleCover(page))return '';
  if(page.layout==='dual'||page.kind==='2 images'||page.kind==='Deux images')return 'dual';
  if(page.layout==='panorama'||page.kind==='1 image sur 2 pages'||page.kind==='Grande image')return 'panorama';
  if(page.kind==='Texte seul'||page.kind==='Page texte')return 'preface';
  if(page.kind==='Image seule')return 'plate';
  if(page.kind==='Crédits')return 'colophon';
  return 'series';
}
function setPresetButton(surfaceValue,templateValue){
  [...el('presets').children].forEach(button=>button.classList.toggle('on',button.dataset.preset===surfaceValue));
  [...el('presetsInner').children].forEach(button=>button.classList.toggle('on',button.dataset.preset===templateValue));
}
function setControlLock(box,locked){
  const node=el(box);
  if(!node)return;
  [...node.children].forEach(button=>{button.disabled=locked;});
}
function setInputLock(ids,locked){
  ids.forEach(id=>{el(id).disabled=locked;});
}
function renderImageQuality(page){
  const slots=canUseSecondImage(page)?['img','img2']:['img'];
  el('imageQuality').innerHTML=slots.map(slot=>{
    const q=qualityState(page,slot);
    const label=q.status==='ok'?'OK':q.status==='warn'?'Limite':q.status==='bad'?'Qualité trop basse':'À vérifier';
    return `<div class="quality ${q.status}">
      <strong>${esc(label)}</strong>
      <span>${esc(q.title)}</span>
      <small>${esc(q.text)}</small>
    </div>`;
  }).join('');
}
function renderPrintReadout(){
  const count=activePrintPageCount();
  const inside=insideSafeMm(count).toFixed(1).replace('.',',');
  const m=coverMetrics(count);
  const spine=m.spine.toFixed(1).replace('.',',');
  const spineText=count>=79?'texte possible':'pas de texte sur le dos';
  const spineNote=count<30?'aperçu 30 pages':spineText;
  const kdpText=count<24?'min. 24 pages':'OK';
  const bleedStr=BLEED_MM.toFixed(1).replace('.',',');
  const safeStr=KDP_SAFE_OUT_MM.toFixed(1).replace('.',',');
  const fmtStr=`${(TRIM_W_MM/10).toFixed(1)} × ${(TRIM_H_MM/10).toFixed(1)} cm`;
  el('printReadout').innerHTML=`<div><span>Format</span><strong>${fmtStr}</strong></div>
    <div><span>Pages intérieures</span><strong>${count}</strong></div>
    <div><span>Fond perdu</span><strong>${bleedStr} mm</strong></div>
    <div><span>Zone sûre</span><strong>${safeStr} mm</strong></div>
    <div><span>Près du pli</span><strong>${inside} mm</strong></div>
    <div><span>Pli couverture</span><strong>${spine} mm · ${spineNote}</strong></div>
    <div><span>KDP papier</span><strong>${kdpText}</strong></div>`;
}
function syncControls(){
  const page=currentPage();
  applySurfaceRules(page);
  activeTextArea=currentTextArea(page,activeTextArea);
  const slot=visibleImageSlot(page);
  const hasSecond=canUseSecondImage(page);
  el('file').value='';
  el('file2').value='';
  el('pageName').value=page.name;
  el('pageKind').value=page.kind;
  el('fileText').textContent=isFullCover(page)?"Charger ou remplacer la couverture":hasSecond?"Charger ou remplacer l'image gauche":page.layout==='panorama'?"Charger ou remplacer l'image double":"Charger ou remplacer l'image";
  el('file2Wrap').hidden=!hasSecond;
  el('clearImage').disabled=!imageUrl(page,slot);
  el('clearTopImage').disabled=!page.topImg;
  el('hue').value=page.hue;
  el('rule').value=page.rule;
  el('rw').value=liseretWeight(page);
  el('rwV').textContent=liseretWeight(page)+' px';
  el('rl').value=filetLongueur(page);
  el('rlV').textContent=filetLongueur(page)+' %';
  el('rx').value=filetX(page);
  el('rxV').textContent=filetX(page)+' %';
  el('ry').value=filetY(page);
  el('ryV').textContent=filetY(page)+' %';
  el('iz').value=imageZoom(page,slot);
  el('izV').textContent=imageZoom(page,slot)+' %';
  el('ix').value=imageOffsetX(page,slot);
  el('ixV').textContent=imageOffsetX(page,slot);
  el('iy').value=imageOffsetY(page,slot);
  el('iyV').textContent=imageOffsetY(page,slot);
  el('ir').value=imageRotation(page,slot);
  el('irV').textContent=imageRotation(page,slot)+'°';
  const flipBtn=el('flipImage');
  if(flipBtn){const on=imageFlipped(page,slot);flipBtn.classList.toggle('on',on);flipBtn.setAttribute('aria-pressed',on?'true':'false');}
  el('panoColor').value=page.panoColor;
  el('panoWidth').value=panoWidth(page);
  el('panoWidthV').textContent=panoWidth(page)+' px';
  el('panoOpacity').value=panoOpacity(page);
  el('panoOpacityV').textContent=panoOpacity(page)+' %';
  el('int').value=page.intensity;
  el('intV').textContent=page.intensity;
  syncHueSwatches();
  syncTextBlockPanel(page,activeTextArea);
  el('m').value=page.margin;
  el('mV').textContent=page.margin+' mm';
  el('kick').value=page.kick;
  el('chapt').value=page.chapt;
  el('serie').value=page.serie;
  el('intro').value=page.intro;
  ['kick','chapt','serie','intro','coverBackKick','coverBackTitle','coverBackText'].forEach(key=>{
    const field=el(key);
    if(!field)return;
    const hidden=isTextHidden(page,key);
    field.disabled=hidden;
    field.closest('.field')?.classList.toggle('field-removed',hidden);
  });
  // « Mention du haut, au verso » et « Texte sur le dos » n'ont plus de champ
  // dans le panneau : ils sont jumelés au recto (voir COVER_TWIN) et se
  // modifient directement sur la page.
  el('coverBackTitle').value=page.coverBackTitle||page.chapt||'';
  el('coverBackText').value=page.coverBackText||page.intro||'';
  // Détourage : les boutons suivent l'image en cours, et tout est grisé quand
  // l'image est à fond perdu (elle doit déborder, pas être découpée).
  const dispoForme=shapeAvailable(page,slot);
  const formeActive=imageShape(page,slot);
  const boiteForme=el('imgShape');
  if(boiteForme)boiteForme.querySelectorAll('button[data-v]').forEach(b=>{
    b.classList.toggle('on',dispoForme&&b.dataset.v===formeActive);
    b.disabled=!dispoForme;
  });
  const curseurForme=el('ishape');
  if(curseurForme){
    const valeur=imageShapeAmount(page,slot);
    curseurForme.value=valeur;
    curseurForme.disabled=!dispoForme||formeActive==='none'||formeActive==='oval';
    el('ishapeV').textContent=valeur+' %';
  }
  // Dos : dire clairement pourquoi le texte y est possible ou non. Le seuil de
  // 79 pages n'est pas une estimation, c'est la règle d'Amazon KDP.
  const noteDos=el('spineNote');
  if(noteDos){
    const interieures=Math.max(2,totalInteriorPages());
    const epaisseur=coverMetrics(interieures).spine;
    noteDos.textContent=interieures>=79
      ? `Dos de ${epaisseur.toFixed(1).replace('.',',')} mm : le titre et la mention d'auteur y sont repris automatiquement, en haut et en bas.`
      : `Pas de texte sur le dos : Amazon KDP l'interdit sous 79 pages, et le livre en compte ${interieures} (dos de ${epaisseur.toFixed(1).replace('.',',')} mm). Le nombre de pages se règle dans « Pages ».`;
  }
  const verrou=el('frameLock');
  if(verrou){
    const fige=imageFrameLocked(page,slot);
    const actif=dispoForme&&formeActive!=='none';
    verrou.classList.toggle('on',fige);
    verrou.setAttribute('aria-pressed',fige?'true':'false');
    verrou.textContent=fige?'Cadre figé':'Figer le cadre';
    verrou.disabled=!actif;
    applyLanguage(verrou);
    const aide=el('frameHint');
    if(aide)aide.hidden=!actif;
  }
  const noteForme=el('shapeNote');
  if(noteForme){
    noteForme.hidden=dispoForme;
    noteForme.textContent=dispoForme?'':"Non disponible en « Remplir » : l'image doit déborder pour être massicotée. Choisis « Voir entière » juste au-dessus pour pouvoir la détourer.";
  }
  setSegment('folioPosition',folioPosition);
  const selFolio=el('folioFont');
  if(selFolio){
    if(!selFolio.options.length)selFolio.innerHTML=fontOptions(FOLIO_FONT_OPTIONS,folioFont);
    selFolio.value=folioFont;
  }
  if(el('folioX')){el('folioX').value=folioX;el('folioXV').textContent=folioX+' %';}
  if(el('folioY')){el('folioY').value=folioY;el('folioYV').textContent=folioY+' %';}
  setFolioColorButton(folioColor);
  setSegment('side',effectiveSide(page));
  setSegment('imageSlot',slot);
  setSegment('imgFit',imageFit(page,slot));
  setSegment('imgRule',imageRule(page,slot)?'yes':'no');
  setSegment('panoSep',panoSep(page));
  setSegment('textAlign',textAlign(page,activeTextArea));
  setSegment('printGuides',showPrintGuides?'on':'off');
  syncUiShell(page);
  setControlLock('side',isFullCover(page)||isMixedCover(page)||isSingleCover(page)||page.layout==='dual'||page.layout==='panorama');
  setControlLock('panoSep',page.layout!=='panorama'||isFullCover(page)||isSingleCover(page));
  setInputLock(['panoColor','panoWidth','panoOpacity'],page.layout!=='panorama'||panoSep(page)==='none'||isFullCover(page)||isSingleCover(page));
  setRuleButton(page.rule);
  setRuleStyleButton(page.ruleStyle);
  syncDecorDisponible();
  syncTexteDisponible(page);
  setPresetButton(surfacePresetForPage(page),templatePresetForPage(page));
  renderImageQuality(page);
  renderPrintReadout();
  syncBookPages();
  syncCoverPresets();
  syncTemplatePresets();
}
// Un plat de couverture ajouté automatiquement et resté vide peut être repris
// sans rien perdre : il ne doit donc pas bloquer le retour à la couverture double.
function isDisposableCover(page){
  return page.autoBack&&!page.img&&!page.img2&&!page.topImg;
}
function syncCoverPresets(){
  const others=pages.filter((_,i)=>i!==activeIndex);
  const hasWrap=others.some(p=>p.surface==='cover-wrap');
  const hasFront=others.some(p=>p.surface==='cover-front'&&!isDisposableCover(p));
  const hasBack=others.some(p=>p.surface==='cover-back'&&!isDisposableCover(p));
  const btnWrap=el('presets').querySelector('[data-preset="fullCover"]');
  const btnFront=el('presets').querySelector('[data-preset="cover"]');
  const btnBack=el('presets').querySelector('[data-preset="backCover"]');
  if(btnWrap)btnWrap.disabled=hasWrap||hasFront||hasBack;
  if(btnFront)btnFront.disabled=hasWrap||hasFront;
  if(btnBack)btnBack.disabled=hasWrap||hasBack;
}
function syncTemplatePresets(){
  const page=currentPage();
  const isCover=isFullCover(page)||isSingleCover(page);
  [...el('presetsInner').querySelectorAll('button')].forEach(b=>{
    b.disabled=isCover;
  });
  if(el('presetsInnerNote'))el('presetsInnerNote').hidden=!isCover;
}
function activatePage(index){
  if(index<0||index>=pages.length)return;
  activeIndex=index;
  syncControls();
  refresh();
}
function syncPreviewDock(){
  const right=previewDock==='right';
  el('workspace').classList.toggle('preview-right',right);
}
function syncCleanPreview(){
  const button=el('cleanPreview');
  el('appWrap').classList.toggle('clean-preview',cleanPreview);
  if(!button)return;
  button.classList.toggle('on',cleanPreview);
  button.setAttribute('aria-pressed',cleanPreview?'true':'false');
  button.textContent=cleanPreview?'Afficher les outils':'Masquer les outils';
  applyLanguage(button);
}
function syncUiShell(page=currentPage()){
  const wrap=el('appWrap');
  const isSimple=uiMode==='simple';
  const isPano=page.layout==='panorama'&&!isFullCover(page)&&!isSingleCover(page);
  const isDual=canUseSecondImage(page);
  wrap.classList.toggle('simple-ui',isSimple);
  wrap.classList.toggle('full-ui',!isSimple);
  wrap.classList.toggle('is-panorama',isPano);
  wrap.classList.toggle('is-dual',isDual);
  wrap.classList.toggle('is-full-cover',isFullCover(page));
  syncCleanPreview();
}

// Les URL d'images peuvent être partagées par une page dupliquée.
function releaseImage(url){
  if(url&&!pages.some(page=>page.img===url||page.img2===url||page.topImg===url))URL.revokeObjectURL(url);
}
function releaseImageSet(list){
  [...new Set(list.flatMap(page=>[page.img,page.img2,page.topImg]).filter(Boolean))].forEach(url=>URL.revokeObjectURL(url));
}
function imageSizeFields(slot='img'){
  const fields=IMAGE_FIELDS[slot]||IMAGE_FIELDS.img;
  return {url:fields.url,name:fields.name,w:fields.w,h:fields.h};
}
function readImageSize(url){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve({w:img.naturalWidth,h:img.naturalHeight});
    img.onerror=()=>resolve({w:null,h:null});
    img.src=url;
  });
}
function replaceActiveImage(file,slot='img'){
  if(!file||!file.type.startsWith('image/'))return;
  const page=currentPage();
  if(isPageLocked(page))return;
  activeImageSlot=slot==='img2'?'img2':'img';
  const fields=imageSizeFields(slot);
  const oldUrl=page[fields.url];
  const url=URL.createObjectURL(file);
  page[fields.url]=url;
  page[fields.name]=file.name;
  page[fields.w]=null;
  page[fields.h]=null;
  page.hue=DEFAULT_IMAGE_BG;
  page.intensity=100;
  releaseImage(oldUrl);
  el(fields.url==='img2'?'file2':'file').value='';
  readImageSize(url).then(size=>{
    if(page[fields.url]!==url)return;
    page[fields.w]=size.w;
    page[fields.h]=size.h;
    syncControls();
    refresh();
  });
  syncControls();
  refresh();
}
function replaceTopImage(file){
  if(!file||!file.type.startsWith('image/'))return;
  const page=currentPage();
  const oldUrl=page.topImg;
  const slot=visibleImageSlot(page);
  const url=URL.createObjectURL(file);
  page.topImg=url;
  page.topImgName=file.name;
  page.topImgW=null;
  page.topImgH=null;
  page.topImgSlot=slot;
  page.topImgX=0;
  page.topImgY=0;
  page.topImgSize=36;
  page.topImgRot=0;
  page.topImgOpacity=100;
  releaseImage(oldUrl);
  el('topFile').value='';
  readImageSize(url).then(size=>{
    if(page.topImg!==url)return;
    page.topImgW=size.w;
    page.topImgH=size.h;
    syncControls();
    refresh();
  });
  syncControls();
  refresh();
}
function clearActiveImage(slot=visibleImageSlot()){
  const page=currentPage();
  const fields=imageSizeFields(slot);
  const oldUrl=page[fields.url];
  page[fields.url]=null;
  page[fields.name]='';
  page[fields.w]=null;
  page[fields.h]=null;
  releaseImage(oldUrl);
  if(!page.img&&!page.img2){
    page.hue=BLANK_IMAGE_BG;
    page.intensity=100;
  }
  syncControls();
  refresh();
}
function clearTopImage(){
  const page=currentPage();
  const oldUrl=page.topImg;
  page.topImg=null;
  page.topImgName='';
  page.topImgW=null;
  page.topImgH=null;
  releaseImage(oldUrl);
  syncControls();
  refresh();
}

function addPage(){
  const next=makePage({kind:'Image seule',surface:'interior',kick:'IMAGE',chapt:'image seule',serie:'Titre de cette page',tsize:34,intro:''});
  pages.splice(activeIndex+1,0,next);
  activatePage(activeIndex+1);
}
function normalizeBookPageCount(value){
  let count=Math.max(2,Math.min(240,Math.round(+value||8)));
  if(count%2)count+=1;
  return Math.min(240,count);
}
function makeBookPages(count){
  const built=[
    makePage(PRESETS.fullCover),
    makePage(PRESETS.insideFront)
  ];
  let view=1;
  for(let pageNo=2;pageNo<=count-1;pageNo+=2){
    built.push(makePage({
      ...PRESETS.series,
      name:`Pages ${pad2(pageNo)}-${pad2(pageNo+1)}`,
      kind:'Image + texte',
      kick:`SÉRIE ${pad2(view)}`,
      serie:'Titre de cette page',
      intro:'Une courte légende ou un texte de présentation pour cette double page.'
    }));
    view++;
  }
  built.push(makePage(PRESETS.insideBack));
  return built;
}
function generatedInteriorPage(pageNo,view){
  return makePage({
    ...PRESETS.series,
    name:`Pages ${pad2(pageNo)}-${pad2(pageNo+1)}`,
    kind:'Image + texte',
    kick:`SÉRIE ${pad2(view)}`,
    serie:'Titre de cette page',
    intro:'Une courte légende ou un texte de présentation pour cette double page.'
  });
}
function applyBookPageCount(count){
  count=normalizeBookPageCount(count);
  if(count===totalInteriorPages())return;
  const previous=pages;
  const previousActive=currentPage();
  const cover=previous.find(isFullCover)||makePage(PRESETS.fullCover);
  const start=previous.find(page=>page.surface==='inside-front')||makePage(PRESETS.insideFront);
  const end=previous.find(page=>page.surface==='inside-back')||makePage(PRESETS.insideBack);
  const existingInterior=previous.filter(page=>page.surface==='interior'&&interiorPageCount(page)===2);
  const neededInteriorSpreads=Math.max(0,(count-2)/2);
  const built=[cover,start];
  for(let i=0;i<neededInteriorSpreads;i++){
    const pageNo=2+i*2;
    built.push(existingInterior[i]||generatedInteriorPage(pageNo,i+1));
  }
  built.push(end);
  const kept=new Set(built);
  releaseImageSet(previous.filter(page=>!kept.has(page)));
  pages=built;
  const nextActiveIndex=built.indexOf(previousActive);
  activeIndex=nextActiveIndex>=0?nextActiveIndex:Math.min(built.length-1,1);
  el('bookPages').value=count;
  el('bookPagesV').textContent=count+' pages';
  syncControls();
  refresh();
}
function buildBook(){
  applyBookPageCount(el('bookPages').value);
}
function scheduleBookPageUpdate(){
  const raw=+el('bookPages').value;
  const count=normalizeBookPageCount(el('bookPages').value);
  el('bookPagesV').textContent=count+' pages';
  clearTimeout(bookPageTimer);
  if(!Number.isFinite(raw)||raw<2)return;
  bookPageTimer=setTimeout(()=>applyBookPageCount(count),650);
}
function duplicatePage(){
  pages.splice(activeIndex+1,0,makePage({...currentPage()}));
  activatePage(activeIndex+1);
}
function deletePage(){
  if(pages.length===1)return;
  const removed=pages.splice(activeIndex,1)[0];
  releaseImage(removed.img);
  releaseImage(removed.img2);
  releaseImage(removed.topImg);
  activeIndex=Math.min(activeIndex,pages.length-1);
  syncControls();
  refresh();
}
function reorderPages(from,to){
  if(from===to||from<0||to<0||from>=pages.length||to>=pages.length)return;
  const [moved]=pages.splice(from,1);
  pages.splice(to,0,moved);
  if(activeIndex===from)activeIndex=to;
  else if(from<activeIndex&&to>=activeIndex)activeIndex--;
  else if(from>activeIndex&&to<=activeIndex)activeIndex++;
  syncControls();
  refresh();
}

el('file').addEventListener('change',e=>replaceActiveImage(e.target.files[0],'img'));
el('file2').addEventListener('change',e=>replaceActiveImage(e.target.files[0],'img2'));
el('topFile').addEventListener('change',e=>replaceTopImage(e.target.files[0]));
el('bookPages').addEventListener('input',scheduleBookPageUpdate);
el('bookPages').addEventListener('change',()=>applyBookPageCount(el('bookPages').value));
el('bookPages').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyBookPageCount(el('bookPages').value);}});
el('buildBook').addEventListener('click',buildBook);
el('pagesDown').addEventListener('click',()=>{const v=Math.max(2,(+el('bookPages').value||8)-2);el('bookPages').value=v;applyBookPageCount(v);});
el('pagesUp').addEventListener('click',()=>{const v=Math.min(240,(+el('bookPages').value||8)+2);el('bookPages').value=v;applyBookPageCount(v);});
el('hue').addEventListener('input',e=>{currentPage().hue=e.target.value;syncHueSwatches();refresh();});
onEl('hueSwatches','click',e=>{
  const b=e.target.closest('button[data-c]');
  if(!b||isPageLocked(currentPage()))return;
  currentPage().hue=b.dataset.c;
  el('hue').value=b.dataset.c;
  syncHueSwatches();
  refresh();
});
onEl('huePick','input',e=>{
  if(isPageLocked(currentPage())){syncHueSwatches();return;}
  currentPage().hue=e.target.value;
  el('hue').value=e.target.value;
  syncHueSwatches();
  refresh();
});
function syncHueSwatches(){
  const box=el('hueSwatches');
  if(!box)return;
  const current=String(currentPage().hue||'').toLowerCase();
  let known=false;
  box.querySelectorAll('button[data-c]').forEach(b=>{
    const on=b.dataset.c.toLowerCase()===current;
    b.classList.toggle('on',on);
    if(on)known=true;
  });
  const pick=el('huePick');
  if(pick){
    if(current)pick.value=current;
    const cell=pick.closest('.pick');
    if(cell)cell.classList.toggle('on',!known&&!!current);
  }
}
el('rule').addEventListener('input',e=>{currentPage().rule=e.target.value;setRuleButton(e.target.value);refresh();});
el('rw').addEventListener('input',e=>{currentPage().ruleWeight=+e.target.value;el('rwV').textContent=e.target.value+' px';refresh();});
el('rl').addEventListener('input',e=>{currentPage().ruleLength=+e.target.value;el('rlV').textContent=e.target.value+' %';refresh();});
el('rx').addEventListener('input',e=>{currentPage().ruleX=+e.target.value;el('rxV').textContent=e.target.value+' %';refresh();});
el('ry').addEventListener('input',e=>{currentPage().ruleY=+e.target.value;el('ryV').textContent=e.target.value+' %';refresh();});
el('iz').addEventListener('input',e=>{setImageSetting(currentPage(),visibleImageSlot(),'zoom',+e.target.value);el('izV').textContent=e.target.value+' %';refresh();});
el('ix').addEventListener('input',e=>{setImageSetting(currentPage(),visibleImageSlot(),'x',+e.target.value);el('ixV').textContent=e.target.value;refresh();});
el('iy').addEventListener('input',e=>{setImageSetting(currentPage(),visibleImageSlot(),'y',+e.target.value);el('iyV').textContent=e.target.value;refresh();});
el('ir').addEventListener('input',e=>{setImageSetting(currentPage(),visibleImageSlot(),'rot',+e.target.value);el('irV').textContent=e.target.value+'°';refresh();});
el('panoColor').addEventListener('input',e=>{currentPage().panoColor=e.target.value;refresh();});
el('panoWidth').addEventListener('input',e=>{currentPage().panoWidth=+e.target.value;el('panoWidthV').textContent=e.target.value+' px';refresh();});
el('panoOpacity').addEventListener('input',e=>{currentPage().panoOpacity=+e.target.value;el('panoOpacityV').textContent=e.target.value+' %';refresh();});
el('int').addEventListener('input',e=>{currentPage().intensity=+e.target.value;el('intV').textContent=e.target.value;refresh();});
function updateActiveTextAreaSetting(prop,value,readoutId,suffix=''){
  const page=currentPage();
  activeTextArea=currentTextArea(page,activeTextArea);
  setTextAreaValue(page,activeTextArea,prop,value);
  setText(readoutId,value+suffix);
  refresh();
}
el('tw').addEventListener('input',e=>updateActiveTextAreaSetting('Width',+e.target.value,'twV',' %'));
el('tx').addEventListener('input',e=>updateActiveTextAreaSetting('X',+e.target.value,'txV'));
el('ty').addEventListener('input',e=>updateActiveTextAreaSetting('Y',+e.target.value,'tyV'));
el('tg').addEventListener('input',e=>updateActiveTextAreaSetting('Gap',+e.target.value,'tgV'));
el('m').addEventListener('input',e=>{currentPage().margin=+e.target.value;el('mV').textContent=e.target.value+' mm';refresh();});
['kick','chapt','serie','intro','coverBackKick','coverBackTitle','coverBackText','spineText'].forEach(id=>onEl(id,'input',e=>{
  const page=currentPage();
  page[id]=e.target.value;
  const twin=syncCoverTwin(page,id,page[id]);
  if(twin&&el(twin))el(twin).value=page[twin];
  refresh();
}));
el('pageName').addEventListener('input',e=>{
  const page=currentPage();
  page.name=e.target.value;
  page.autoName=e.target.value.trim()===''||e.target.value===autoPageName(activeIndex,page);
  refresh();
});
el('pageKind').addEventListener('change',e=>{
  const page=currentPage();
  page.kind=e.target.value;
  page.surface=surfaceForKind(page.kind);
  applySurfaceRules(page);
  syncControls();
  refresh();
});
function seg(box,key){
  const node=el(box);
  if(!node)return;
  node.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(!b||b.disabled)return;
    const page=currentPage();
    if(box==='imgFit')setImageSetting(page,visibleImageSlot(),'fit',b.dataset.v);
    else page[key]=b.dataset.v;
    setSegment(box,b.dataset.v);
    syncControls();
    refresh();
  });
}
seg('side','side');
seg('imgFit','imgFit');
seg('panoSep','panoSep');
el('textAlign').addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b||b.disabled)return;
  const page=currentPage();
  activeTextArea=currentTextArea(page,activeTextArea);
  setTextAreaValue(page,activeTextArea,'Align',b.dataset.v);
  setSegment('textAlign',b.dataset.v);
  refresh();
});
el('imageSlot').addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b||b.disabled)return;
  activeImageSlot=b.dataset.v==='img2'?'img2':'img';
  syncControls();
  refresh();
});
el('formatPresets').addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b||!b.dataset.format)return;
  applyBookFormat(b.dataset.format);
});
el('applyFormat').addEventListener('click',applyCustomFormat);
el('applyMargins').addEventListener('click',applyCustomMargins);
// Numéros de page : réglages du livre entier.
onEl('folioPosition','click',e=>{
  const b=e.target.closest('button');
  if(!b)return;
  folioPosition=b.dataset.v;
  setSegment('folioPosition',folioPosition);
  refresh();
});
onEl('folioFont','change',e=>{
  folioFont=e.target.value;
  refresh();
});
onEl('imgShape','click',e=>{
  const b=e.target.closest('button[data-v]');
  if(!b||b.disabled)return;
  setImageSetting(currentPage(),visibleImageSlot(),'shape',b.dataset.v);
  syncControls();
  refresh();
});
onEl('frameLock','click',()=>{
  const page=currentPage();
  const slot=visibleImageSlot();
  if(imageFrameLocked(page,slot)){
    // En libérant, on remet le zoom au niveau du cadre : sinon le cadre
    // sauterait brutalement à la taille dictée par le zoom en cours.
    const taille=imageFrameScale(page,slot);
    setImageSetting(page,slot,'framelock',false);
    setImageSetting(page,slot,'zoom',Math.round(taille*100));
  }else{
    // On fige à la taille qu'a le cadre en cet instant.
    setImageSetting(page,slot,'frame',imageFrameScale(page,slot));
    setImageSetting(page,slot,'framelock',true);
  }
  syncControls();
  refresh();
});
onEl('ishape','input',e=>{
  setImageSetting(currentPage(),visibleImageSlot(),'amount',+e.target.value);
  el('ishapeV').textContent=e.target.value+' %';
  refresh();
});
onEl('folioX','input',e=>{
  folioX=+e.target.value;
  el('folioXV').textContent=folioX+' %';
  refresh();
});
onEl('folioY','input',e=>{
  folioY=+e.target.value;
  el('folioYV').textContent=folioY+' %';
  refresh();
});
onEl('folioColors','click',e=>{
  const b=e.target.closest('button[data-c]');
  if(!b)return;
  folioColor=b.dataset.c;
  setFolioColorButton(folioColor);
  refresh();
});
onEl('folioColor','input',e=>{
  folioColor=e.target.value;
  setFolioColorButton(folioColor);
  refresh();
});
// La molette parcourt la liste des polices, comme sur les boîtes de texte.
onEl('folioFont','wheel',e=>{
  e.preventDefault();
  const ordre=FOLIO_FONT_OPTIONS.map(o=>o[0]);
  const pos=Math.max(0,ordre.indexOf(folioFont));
  const suivant=(pos+(e.deltaY<0?-1:1)+ordre.length)%ordre.length;
  folioFont=ordre[suivant];
  e.target.value=folioFont;
  refresh();
});
el('printGuides').addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b)return;
  showPrintGuides=b.dataset.v==='on';
  syncControls();
  refresh();
});
el('imgRule').addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b)return;
  setImageSetting(currentPage(),visibleImageSlot(),'rule',b.dataset.v==='yes');
  setSegment('imgRule',b.dataset.v);
  refresh();
});
el('clearImage').addEventListener('click',()=>clearActiveImage());
el('clearTopImage').addEventListener('click',clearTopImage);
onEl('flipImage','click',()=>{
  const page=currentPage();
  if(isPageLocked(page))return;
  const slot=visibleImageSlot();
  setImageSetting(page,slot,'flip',!imageFlipped(page,slot));
  syncControls();
  refresh();
});
el('resetImage').addEventListener('click',()=>{
  const page=currentPage();
  const slot=visibleImageSlot();
  setImageSetting(page,slot,'fit','fill');
  setImageSetting(page,slot,'zoom',100);
  setImageSetting(page,slot,'x',0);
  setImageSetting(page,slot,'y',0);
  setImageSetting(page,slot,'inset',8);
  setImageSetting(page,slot,'rule',false);
  setImageSetting(page,slot,'rot',0);
  syncControls();
  refresh();
});
el('resetRule').addEventListener('click',()=>{
  const page=currentPage();
  page.ruleWeight=PAGE_TEMPLATE.ruleWeight;
  page.ruleLength=PAGE_TEMPLATE.ruleLength;
  page.ruleX=50;
  page.ruleY=50;
  syncControls();
  refresh();
});
el('resetTextBlock').addEventListener('click',()=>{
  const page=currentPage();
  activeTextArea=currentTextArea(page,activeTextArea);
  setTextAreaValue(page,activeTextArea,'Width',PAGE_TEMPLATE.textWidth);
  setTextAreaValue(page,activeTextArea,'X',PAGE_TEMPLATE.textX);
  setTextAreaValue(page,activeTextArea,'Y',PAGE_TEMPLATE.textY);
  setTextAreaValue(page,activeTextArea,'Gap',PAGE_TEMPLATE.textGap);
  setTextAreaValue(page,activeTextArea,'Align',PAGE_TEMPLATE.textAlign);
  syncControls();
  refresh();
});

function setLiveTextReadout(x,y){
  el('tx').value=x;
  el('txV').textContent=x;
  el('ty').value=y;
  el('tyV').textContent=y;
}
function setLiveImageReadout(slot,x,y){
  if(visibleImageSlot()!==slot)return;
  el('ix').value=x;
  el('ixV').textContent=x;
  el('iy').value=y;
  el('iyV').textContent=y;
}
function startStageDrag(e,kind,target,slot='img'){
  const page=currentPage();
  const bounds=(target.closest('.page,.full-cover-page')||target).getBoundingClientRect();
  const area=kind==='text'?currentTextArea(page,copyAreaFromElement(target)):'main';
  if(kind==='text')activeTextArea=area;
  stageDrag={
    kind,
    slot,
    area,
    target,
    bounds,
    started:kind==='text',
    startClientX:e.clientX,
    startClientY:e.clientY,
    startX:kind==='text'?textX(page,area):kind==='topImage'?topImageX(page):imageOffsetX(page,slot),
    startY:kind==='text'?textY(page,area):kind==='topImage'?topImageY(page):imageOffsetY(page,slot)
  };
  if(kind==='text'){
    document.body.classList.add('dragging-stage');
    suppressSpreadClick=true;
    e.preventDefault();
  }
}
function moveStageDrag(e){
  if(!stageDrag)return;
  const dx=e.clientX-stageDrag.startClientX;
  const dy=e.clientY-stageDrag.startClientY;
  if(!stageDrag.started){
    if(Math.hypot(dx,dy)<4)return;
    stageDrag.started=true;
    document.body.classList.add('dragging-stage');
    suppressSpreadClick=true;
  }
  const page=currentPage();
  e.preventDefault();
  if(stageDrag.kind==='text'){
    const x=Math.max(-320,Math.min(320,Math.round(stageDrag.startX+dx)));
    const y=Math.max(-420,Math.min(420,Math.round(stageDrag.startY+dy)));
    activeTextArea=currentTextArea(page,stageDrag.area);
    setTextAreaValue(page,activeTextArea,'X',x);
    setTextAreaValue(page,activeTextArea,'Y',y);
    stageDrag.target.style.setProperty('--copyx',x+'px');
    stageDrag.target.style.setProperty('--copyy',y+'px');
    setLiveTextReadout(x,y);
    return;
  }
  if(stageDrag.kind==='topImage'){
    const x=Math.max(-65,Math.min(65,Math.round(stageDrag.startX+(dx/stageDrag.bounds.width)*100)));
    const y=Math.max(-65,Math.min(65,Math.round(stageDrag.startY+(dy/stageDrag.bounds.height)*100)));
    page.topImgX=x;
    page.topImgY=y;
    stageDrag.target.style.setProperty('--topx',x+'%');
    stageDrag.target.style.setProperty('--topy',y+'%');
    return;
  }
  const zoom=imageZoom(page,stageDrag.slot)/100;
  const x=Math.max(-100,Math.min(100,Math.round(stageDrag.startX+(dx/stageDrag.bounds.width/zoom)*100)));
  const y=Math.max(-100,Math.min(100,Math.round(stageDrag.startY+(dy/stageDrag.bounds.height/zoom)*100)));
  setImageSetting(page,stageDrag.slot,'x',x);
  setImageSetting(page,stageDrag.slot,'y',y);
  stageDrag.target.style.setProperty('--imgx',x+'%');
  stageDrag.target.style.setProperty('--imgy',y+'%');
  setLiveImageReadout(stageDrag.slot,x,y);
}
function finishStageDrag(){
  if(!stageDrag)return;
  const didDrag=stageDrag.started;
  stageDrag=null;
  document.body.classList.remove('dragging-stage');
  if(didDrag){
    syncControls();
    refresh();
    setTimeout(()=>{suppressSpreadClick=false;},0);
  }
}
function useImageTool(action,slot='img'){
  const page=currentPage();
  if(isPageLocked(page))return;
  activeImageSlot=slot==='img2'?'img2':'img';
  if(action==='replace'){
    syncControls();
    el(activeImageSlot==='img2'?'file2':'file').click();
    return;
  }
  if(action==='clear'){
    clearActiveImage(activeImageSlot);
    return;
  }
  if(action==='zoom-in')setImageSetting(page,activeImageSlot,'zoom',Math.min(260,imageZoom(page,activeImageSlot)+10));
  if(action==='zoom-out')setImageSetting(page,activeImageSlot,'zoom',Math.max(20,imageZoom(page,activeImageSlot)-10));
  if(action==='rot-left')setImageSetting(page,activeImageSlot,'rot',Math.max(-180,imageRotation(page,activeImageSlot)-5));
  if(action==='rot-right')setImageSetting(page,activeImageSlot,'rot',Math.min(180,imageRotation(page,activeImageSlot)+5));
  if(action==='flip')setImageSetting(page,activeImageSlot,'flip',!imageFlipped(page,activeImageSlot));
  if(action==='fit'){
    const modes=['fill','contain'];
    const current=modes.indexOf(imageFit(page,activeImageSlot));
    setImageSetting(page,activeImageSlot,'fit',modes[(current+1)%modes.length]);
  }
  syncControls();
  refresh();
}
function useTopImageTool(action){
  const page=currentPage();
  if(action==='replace'){
    el('topFile').click();
    return;
  }
  if(action==='clear'){
    clearTopImage();
    return;
  }
  if(action==='bigger')page.topImgSize=Math.min(120,topImageSize(page)+6);
  if(action==='smaller')page.topImgSize=Math.max(8,topImageSize(page)-6);
  if(action==='rot-left')page.topImgRot=Math.max(-180,topImageRotation(page)-5);
  if(action==='rot-right')page.topImgRot=Math.min(180,topImageRotation(page)+5);
  syncControls();
  refresh();
}
function useTextTool(action,value,key=activeTextKey,area=activeTextArea){
  const page=currentPage();
  if(isPageLocked(page))return;
  key=normalizeTextKey(key);
  activeTextArea=currentTextArea(page,area);
  activeTextKey=key;
  let needsRefresh=false;
  if(action==='smaller'||action==='size-smaller'||action==='body-smaller')setTextStyle(page,key,'size',textSize(page,key)-2);
  if(action==='bigger'||action==='size-bigger'||action==='body-bigger')setTextStyle(page,key,'size',textSize(page,key)+2);
  if(action==='bold')setTextStyle(page,key,'bold',!textBool(page,key,'bold'));
  if(action==='italic')setTextStyle(page,key,'italic',!textBool(page,key,'italic'));
  if(action==='upper')setTextStyle(page,key,'upper',!textBool(page,key,'upper'));
  if(action==='leading-smaller')setTextStyle(page,key,'leading',textLeading(page,key)-.1);
  if(action==='leading-bigger')setTextStyle(page,key,'leading',textLeading(page,key)+.1);
  // L'alignement se pose en direct sur le bloc : reconstruire le rendu ferait
  // disparaître sous la souris la boîte que l'on est en train d'utiliser.
  if(action==='align'){
    setTextAreaValue(page,activeTextArea,'Align',value);
    document.querySelectorAll('#spread .copy-block').forEach(block=>{
      if(currentTextArea(page,copyAreaFromElement(block))===activeTextArea)block.style.setProperty('--copyalign',value);
    });
  }
  if(action==='clear'){page.textHidden[key]=true;page.lastClearedKey=key;needsRefresh=true;}
  if(action==='undo-clear'&&page.lastClearedKey){page.textHidden[page.lastClearedKey]=false;page.lastClearedKey=null;needsRefresh=true;}
  syncControls();
  if(needsRefresh)refresh();
  else{
    syncTextSizePanel(key,activeTextArea);
    applyLiveTextStyle(key);
    updateTextToolbars();
  }
}
el('spread').addEventListener('pointerdown',e=>{
  const range=e.target.closest('[data-text-range="size"]');
  if(!range)return;
  e.preventDefault();
  const toolbar=range.closest('.text-tools');
  const key=textKeyFromToolbar(toolbar);
  const area=textAreaFromToolbar(toolbar);
  activeTextKey=key;
  activeTextArea=area;
  textRangeDrag={
    range,
    key,
    area,
    rect:range.getBoundingClientRect(),
    min:+range.min||5,
    max:+range.max||96
  };
  updateTextRangeFromPointer(e);
});
window.addEventListener('pointermove',updateTextRangeFromPointer);
window.addEventListener('pointerup',finishTextRangeDrag);
window.addEventListener('pointercancel',finishTextRangeDrag);
// Une sélection de texte à la souris se termine presque toujours hors de la
// ligne (on dépasse le dernier mot). Le clic est alors attribué à l'image
// située dessous : sans ce drapeau, on changeait d'image active et on
// reconstruisait la page, ce qui effaçait la sélection et faisait disparaître
// la boîte d'outils au moment précis où l'utilisateur allait taper.
let textDragFromEditable=false;
el('spread').addEventListener('mousedown',e=>{
  textDragFromEditable=!!e.target.closest('[data-edit]');
  if(e.target.closest('.object-tools'))return;
  setActiveTextFromTarget(e.target);
},true);
el('spread').addEventListener('pointerdown',e=>{
  if(e.target.closest('.object-tools'))return;
  if(setActiveTextFromTarget(e.target))return;
  const topImage=e.target.closest('[data-top-img]');
  if(topImage){
    startStageDrag(e,'topImage',topImage,topImageSlot(currentPage()));
    return;
  }
  const handle=e.target.closest('[data-drag="text"]');
  if(handle){
    startStageDrag(e,'text',handle.closest('.copy-block')||handle);
    return;
  }
  const imageBox=e.target.closest('[data-img-slot]');
  if(!imageBox||e.target.closest('[data-edit]'))return;
  activeImageSlot=imageBox.dataset.imgSlot==='img2'?'img2':'img';
  setSegment('imageSlot',visibleImageSlot());
  if(!imageUrl(currentPage(),visibleImageSlot())){
    syncControls();
    refresh();
    return;
  }
  startStageDrag(e,'image',imageBox,visibleImageSlot());
});
window.addEventListener('pointermove',moveStageDrag);
window.addEventListener('pointerup',finishStageDrag);
window.addEventListener('pointercancel',finishStageDrag);

el('spread').addEventListener('click',e=>{
  if(suppressSpreadClick){
    suppressSpreadClick=false;
    return;
  }
  const topTool=e.target.closest('[data-top-tool]');
  if(topTool){
    e.preventDefault();
    useTopImageTool(topTool.dataset.topTool);
    return;
  }
  const imageTool=e.target.closest('[data-image-tool]');
  if(imageTool){
    e.preventDefault();
    useImageTool(imageTool.dataset.imageTool,imageTool.dataset.slot);
    return;
  }
  const undoBadge=e.target.closest('[data-text-tool="undo-clear"]');
  if(undoBadge){
    e.preventDefault();
    useTextTool('undo-clear');
    return;
  }
  const textSizeTool=e.target.closest('[data-text-tool]');
  if(textSizeTool){
    e.preventDefault();
    if(textSizeTool.dataset.textTool==='clear')return;
    const toolbar=textSizeTool.closest('.text-tools');
    useTextTool(textSizeTool.dataset.textTool,null,textKeyFromToolbar(toolbar),textAreaFromToolbar(toolbar));
    return;
  }
  const textAlignTool=e.target.closest('[data-text-align]');
  if(textAlignTool){
    e.preventDefault();
    const toolbar=textAlignTool.closest('.text-tools');
    useTextTool('align',textAlignTool.dataset.textAlign,textKeyFromToolbar(toolbar),textAreaFromToolbar(toolbar));
    return;
  }
  if(e.target.closest('.object-tools,.copy-block,select,button,input,textarea,label'))return;
  if(e.target.closest('[data-edit]'))return;
  if(textDragFromEditable)return;
  const imageBox=e.target.closest('[data-img-slot]');
  if(imageBox){
    activeImageSlot=imageBox.dataset.imgSlot==='img2'?'img2':'img';
    syncControls();
    refresh();
  }
});
el('spread').addEventListener('dblclick',e=>{
  const clearTool=e.target.closest('[data-text-tool="clear"]');
  if(clearTool){
    e.preventDefault();
    const toolbar=clearTool.closest('.text-tools');
    useTextTool('clear',null,textKeyFromToolbar(toolbar),textAreaFromToolbar(toolbar));
    return;
  }
  if(e.target.closest('[data-edit],.object-tools,.copy-block,select,button,input,textarea,label'))return;
  const imageBox=e.target.closest('[data-img-slot]');
  if(!imageBox)return;
  activeImageSlot=imageBox.dataset.imgSlot==='img2'?'img2':'img';
  syncControls();
});
el('spread').addEventListener('wheel',e=>{
  if(e.ctrlKey||e.metaKey){
    const editable=e.target.closest('[data-edit]');
    if(editable){
      e.preventDefault();
      const key=normalizeTextKey(editable.dataset.edit);
      const area=copyAreaFromElement(editable);
      activeTextArea=currentTextArea(currentPage(),area);
      setTextStyle(currentPage(),key,'size',textSize(currentPage(),key)+(e.deltaY<0?1:-1));
      activeTextKey=key;
      syncControls();
      syncTextSizePanel(key,activeTextArea);
      applyLiveTextStyle(key);
      updateTextToolbars();
      return;
    }
  }
  const fontSelect=e.target.closest('[data-text-select="font"]');
  if(fontSelect){
    e.preventDefault();
    const toolbar=fontSelect.closest('.text-tools');
    const page=currentPage();
    const key=textKeyFromToolbar(toolbar);
    const area=textAreaFromToolbar(toolbar);
    activeTextKey=key;
    activeTextArea=area;
    // La liste boucle : après la dernière police on revient à la première, et
    // inversement. Les deux sens répondent toujours, quel que soit le point de départ.
    const ordre=TEXT_FONT_OPTIONS.map(o=>o[0]);
    const pos=Math.max(0,ordre.indexOf(textFontKey(page,key)));
    const suivant=ordre[(pos+(e.deltaY<0?-1:1)+ordre.length)%ordre.length];
    if(suivant&&suivant!==ordre[pos]){
      setTextStyle(page,key,'font',suivant);
      syncControls();
      applyLiveTextStyle(key);
      updateTextToolbars();
    }
    return;
  }
  const skipEl=e.target.closest('.object-tools,.copy-block,select,button,input,textarea,label');
  if(skipEl&&!skipEl.closest('[data-img-slot]'))return;
  const topImage=e.target.closest('[data-top-img]');
  if(topImage){
    e.preventDefault();
    const page=currentPage();
    const delta=e.deltaY<0?4:-4;
    page.topImgSize=Math.max(8,Math.min(120,topImageSize(page)+delta));
    syncControls();
    refresh();
    return;
  }
  const imageBox=e.target.closest('[data-img-slot]');
  if(!imageBox||e.target.closest('.object-tools'))return;
  const slot=imageBox.dataset.imgSlot==='img2'?'img2':'img';
  if(!imageUrl(currentPage(),slot))return;
  e.preventDefault();
  const page=currentPage();
  activeImageSlot=slot;
  const delta=e.deltaY<0?5:-5;
  setImageSetting(page,slot,'zoom',Math.max(20,Math.min(260,imageZoom(page,slot)+delta)));
  syncControls();
  refresh();
},{passive:false});
el('spread').addEventListener('change',e=>{
  const select=e.target.closest('[data-text-select]');
  if(!select)return;
  const page=currentPage();
  const toolbar=select.closest('.text-tools');
  const key=textKeyFromToolbar(toolbar);
  const area=textAreaFromToolbar(toolbar);
  activeTextKey=key;
  activeTextArea=area;
  if(select.dataset.textSelect==='font')setTextStyle(page,key,'font',select.value);
  else page[select.dataset.textSelect]=select.value;
  syncControls();
  applyLiveTextStyle(key);
  updateTextToolbars();
});
el('spread').addEventListener('input',e=>{
  const sizeRange=e.target.closest('[data-text-range="size"]');
  if(sizeRange){
    const toolbar=sizeRange.closest('.text-tools');
    const key=textKeyFromToolbar(toolbar);
    const area=textAreaFromToolbar(toolbar);
    activeTextKey=key;
    activeTextArea=area;
    setTextStyle(currentPage(),key,'size',+sizeRange.value);
    syncControls();
    syncTextSizePanel(key,area);
    applyLiveTextStyle(key);
    updateTextToolbars();
    return;
  }
  const color=e.target.closest('[data-text-color]');
  if(color){
    const toolbar=color.closest('.text-tools');
    const key=textKeyFromToolbar(toolbar);
    const area=textAreaFromToolbar(toolbar);
    activeTextKey=key;
    activeTextArea=area;
    setTextStyle(currentPage(),key,'color',color.value);
    syncControls();
    applyLiveTextStyle(key);
    updateTextToolbars();
  }
});
el('spread').addEventListener('focusin',e=>{
  const editable=e.target.closest('[data-edit]');
  if(editable)setActiveTextKey(editable.dataset.edit,copyAreaFromElement(editable));
});
el('spread').addEventListener('keydown',e=>{
  const editable=e.target.closest('[data-edit]');
  if(!editable||e.key!=='Enter'||editable.dataset.edit==='intro')return;
  e.preventDefault();
  editable.blur();
});
el('spread').addEventListener('paste',e=>{
  const editable=e.target.closest('[data-edit]');
  if(!editable)return;
  e.preventDefault();
  let text=e.clipboardData.getData('text/plain');
  if(editable.dataset.edit!=='intro')text=text.replace(/\s+/g,' ').trim();
  document.execCommand('insertText',false,text);
});
el('spread').addEventListener('input',e=>{
  const editable=e.target.closest('[data-edit]');
  if(!editable)return;
  const key=editable.dataset.edit;
  const page=currentPage();
  activeTextKey=normalizeTextKey(key);
  activeTextArea=currentTextArea(page,copyAreaFromElement(editable));
  const value=editable.innerText.replace(/\u00a0/g,' ').replace(/\r/g,'');
  page[key]=key==='intro'?value:value.replace(/\n+/g,' ').trim();
  if(el(key))el(key).value=page[key];
  // La même clé peut être affichée à plusieurs endroits (la mention d'auteur
  // apparaît au recto et sur le dos) : on répercute sur toutes ses lignes.
  paintTextLine(key,page[key],editable);
  // Mention d'auteur : les deux faces de la couverture double suivent.
  const twin=syncCoverTwin(page,key,page[key]);
  if(twin){
    if(el(twin))el(twin).value=page[twin];
    paintTextLine(twin,page[twin],editable);
  }
  // Titre et sous-titre : l'en-t\u00eate suit la page en direct (y compris quand
  // c'est le dos qui a \u00e9t\u00e9 modifi\u00e9, puisqu'il est jumel\u00e9 au titre).
  if([key,twin].some(k=>k==='serie'||k==='chapt'))renderBookTitle();
  updateTextToolbars();
});
el('spread').addEventListener('blur',e=>{
  if(!e.target.closest('[data-edit]'))return;
  // Quand le focus passe à une autre ligne ou dans la boîte d'outils, on ne
  // reconstruit pas la page : sinon la ligne ou le bouton visé est détruit entre
  // l'appui et le relâchement, et le clic se perd. Le texte saisi est déjà
  // enregistré par le gestionnaire de frappe, il n'y a rien à rattraper ici.
  const suite=e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.object-tools,[data-edit]');
  syncControls();
  if(suite)return;
  refresh();
},true);
// Titre du livre modifiable directement dans l'en-tête. Les deux sens sont
// liés : ce qu'on tape ici va dans la couverture, et l'inverse est assuré par
// renderBookTitle() appelé pendant la frappe dans la page.
onEl('bookTitle','input',e=>{
  const node=e.target.closest&&e.target.closest('[data-book-edit]');
  if(!node)return;
  const couverture=coverPageForTitle();
  if(!couverture||isPageLocked(couverture))return;
  const key=node.dataset.bookEdit;
  const value=node.innerText.replace(/ /g,' ').replace(/\r/g,'').replace(/\n+/g,' ').trim();
  couverture[key]=value;
  if(couverture.textHidden)couverture.textHidden[key]=false;
  const twin=syncCoverTwin(couverture,key,value);
  if(couverture===currentPage()){
    if(el(key))el(key).value=value;
    paintTextLine(key,value,node);
    if(twin){
      if(el(twin))el(twin).value=couverture[twin];
      paintTextLine(twin,couverture[twin],node);
    }
  }
});
onEl('bookTitle','keydown',e=>{
  const node=e.target.closest&&e.target.closest('[data-book-edit]');
  if(!node||e.key!=='Enter')return;
  e.preventDefault();
  node.blur();
});
onEl('bookTitle','paste',e=>{
  const node=e.target.closest&&e.target.closest('[data-book-edit]');
  if(!node)return;
  e.preventDefault();
  document.execCommand('insertText',false,e.clipboardData.getData('text/plain').replace(/\s+/g,' ').trim());
});
onEl('bookTitle','focusout',e=>{
  if(!(e.target.closest&&e.target.closest('[data-book-edit]')))return;
  refresh();
});
// Sections repliables. Pas de stockage navigateur : « Format du livre » et
// « Repères d'impression » démarrent repliées (on les règle une fois), tout le
// reste est déplié, et on repart de ces valeurs à chaque rechargement.
function groupesPanneau(){
  return [...document.querySelectorAll('.panel .group')];
}
function setGroupeReplie(groupe,replie){
  groupe.classList.toggle('folded',replie);
  const titre=groupe.querySelector('h2');
  if(titre)titre.setAttribute('aria-expanded',replie?'false':'true');
}
function majBoutonReplier(){
  const b=el('foldAll');
  if(!b)return;
  b.textContent=groupesPanneau().every(g=>g.classList.contains('folded'))?'Tout déplier':'Tout replier';
  applyLanguage(b);
}
function titreDeGroupe(cible){
  const titre=cible&&cible.closest?cible.closest('h2'):null;
  if(!titre)return null;
  const groupe=titre.closest('.group');
  return groupe&&titre.parentElement===groupe?titre:null;
}
function basculerGroupe(titre){
  const groupe=titre.parentElement;
  setGroupeReplie(groupe,!groupe.classList.contains('folded'));
  majBoutonReplier();
}
(function initReplis(){
  const panneau=document.querySelector('.panel');
  if(!panneau)return;
  groupesPanneau().forEach(g=>{
    const titre=g.querySelector('h2');
    if(titre){titre.setAttribute('role','button');titre.setAttribute('tabindex','0');}
    setGroupeReplie(g,g.classList.contains('section-format')||g.classList.contains('section-print'));
  });
  panneau.addEventListener('click',e=>{
    const titre=titreDeGroupe(e.target);
    if(titre)basculerGroupe(titre);
  });
  panneau.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const titre=titreDeGroupe(e.target);
    if(!titre)return;
    e.preventDefault();
    basculerGroupe(titre);
  });
  onEl('foldAll','click',()=>{
    const tout=groupesPanneau().every(g=>g.classList.contains('folded'));
    groupesPanneau().forEach(g=>setGroupeReplie(g,!tout));
    majBoutonReplier();
  });
  majBoutonReplier();
})();
el('rules').addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b)return;
  currentPage().rule=b.dataset.c;
  el('rule').value=b.dataset.c;
  setRuleButton(b.dataset.c);
  refresh();
});
onEl('filetOn','click',()=>{
  const page=currentPage();
  page.ruleStyle=filetActif(page)?'none':'line';
  setRuleStyleButton(page.ruleStyle);
  refresh();
});
// Un livre garde en général le même décor d'un bout à l'autre : le régler une
// fois puis le poser partout évite de refaire soixante fois le même geste.
const CHAMPS_DECOR=['rule','ruleStyle','ruleWeight','ruleLength','ruleX','ruleY'];
onEl('ruleToAll','click',()=>{
  const source=currentPage();
  const autres=pages.filter(page=>page!==source&&!isPageLocked(page));
  if(!autres.length){alert("Il n'y a pas d'autre page à mettre d'accord.");return;}
  if(!confirm('Appliquer ce filet aux '+autres.length+' autre(s) vue(s) ?'))return;
  autres.forEach(page=>{CHAMPS_DECOR.forEach(champ=>{page[champ]=source[champ];});});
  refresh();
  const bouton=el('ruleToAll');
  if(bouton){const t=bouton.textContent;bouton.textContent='Appliqué ✓';setTimeout(()=>{bouton.textContent=t;},1600);}
});

function handlePresetClick(e){
  const b=e.target.closest('button');
  if(!b||b.disabled)return;
  const preset=PRESETS[b.dataset.preset];
  if(!preset)return;
  const page=currentPage();
  if(isPageLocked(page))return;
  const isTemplateOnly=b.closest('#presetsInner')!=null;
  Object.assign(page,preset,{
    img:page.img,imgName:page.imgName,imgW:page.imgW,imgH:page.imgH,
    img2:page.img2,img2Name:page.img2Name,img2W:page.img2W,img2H:page.img2H,
    topImg:page.topImg,topImgName:page.topImgName,topImgW:page.topImgW,topImgH:page.topImgH,
    topImgSlot:page.topImgSlot,topImgX:page.topImgX,topImgY:page.topImgY,topImgSize:page.topImgSize,topImgRot:page.topImgRot,topImgOpacity:page.topImgOpacity,topImgRule:page.topImgRule,
    textStyles:{},
    textHidden:{},
    lastClearedKey:null,
    ...(isTemplateOnly?{surface:page.surface,name:page.name,autoName:page.autoName}:{autoName:true})
  });
  if(b.dataset.preset==='series')page.kick=`SÉRIE ${pad2(activeIndex+1)}`;
  applySurfaceRules(page);
  if(!isTemplateOnly)syncCoverPair(page);
  syncControls();
  refresh();
}
// Le recto seul appelle son verso : on l'ajoute en dernière vue, comme dans un livre.
// À l'inverse, la couverture double contient déjà le verso : on retire celui resté vide.
function syncCoverPair(page){
  if(page.surface==='cover-front'&&!pages.some(p=>p.surface==='cover-back')){
    pages.push(makePage({...PRESETS.backCover,autoBack:true}));
    return;
  }
  if(page.surface==='cover-wrap'){
    for(let i=pages.length-1;i>=0;i--){
      if(pages[i]!==page&&isDisposableCover(pages[i]))pages.splice(i,1);
    }
    if(activeIndex>=pages.length)activeIndex=pages.length-1;
  }
}
el('presets').addEventListener('click',handlePresetClick);
el('presetsInner').addEventListener('click',handlePresetClick);

const stage=document.querySelector('.stage');
stage.addEventListener('dragover',e=>{e.preventDefault();});
stage.addEventListener('drop',e=>{
  e.preventDefault();
});

// Les flèches ‹ › de la barre d'actions ont été retirées : elles appelaient
// exactement la même chose que les flèches rondes de la pellicule, juste à côté.
onEl('exportFormat','click',e=>{
  const b=e.target.closest('button');
  if(!b)return;
  exportFormat=b.dataset.v==='png'?'png':'jpeg';
  setSegment('exportFormat',exportFormat);
  setText('exportFormatNote',exportFormat==='png'
    ?'Sans perte, mais environ six fois plus lourd. Repère : au-delà d’une cinquantaine de vues, le PNG risque de dépasser la limite d’Amazon. Le poids réel s’affiche après « Tout le livre ».'
    :'Recommandé par Cewe, accepté par Amazon. Six fois plus léger que le PNG, sans perte visible sur des photos.');
  applyLanguage(el('exportFormatNote'));
  syncExportFormatLabels();
});
onEl('stripPrev','click',()=>activatePage(activeIndex-1));
onEl('stripNext','click',()=>activatePage(activeIndex+1));
el('addPage').addEventListener('click',addPage);
el('dupPage').addEventListener('click',duplicatePage);
el('delPage').addEventListener('click',deletePage);
el('cleanPreview').addEventListener('click',()=>{
  cleanPreview=!cleanPreview;
  syncCleanPreview();
});
el('toggleGuides').addEventListener('click',()=>{
  showPrintGuides=!showPrintGuides;
  el('toggleGuides').textContent=showPrintGuides?'Masquer les repères':'Afficher les repères';
  setSegment('printGuides',showPrintGuides?'on':'off');
  refresh();
});
el('readerPreview').addEventListener('click',openReader);
el('readerClose').addEventListener('click',closeReader);
el('readerPrev').addEventListener('click',()=>navigateReader(-1));
el('readerNext').addEventListener('click',()=>navigateReader(1));
document.addEventListener('keydown',e=>{
  if(!readerOpen)return;
  if(e.key==='Escape')closeReader();
  if(e.key==='ArrowLeft')navigateReader(-1);
  if(e.key==='ArrowRight')navigateReader(1);
});
let readerWheelAt=0;
el('reader').addEventListener('wheel',e=>{
  if(!readerOpen)return;
  e.preventDefault();
  const now=Date.now();
  if(now-readerWheelAt<380)return;
  readerWheelAt=now;
  navigateReader(e.deltaY>0?1:-1);
},{passive:false});

function togglePageLock(index){
  const page=pages[index];
  if(!page)return;
  page.locked=!page.locked;
  syncControls();
  refresh();
}
el('filmstrip').addEventListener('pointerdown',e=>{
  if(e.target.closest('[data-lock]')){
    e.preventDefault();
    e.stopPropagation();
  }
},true);
el('filmstrip').addEventListener('click',e=>{
  const lock=e.target.closest('[data-lock]');
  if(lock){
    e.preventDefault();
    e.stopPropagation();
    togglePageLock(+lock.dataset.lock);
    return;
  }
  const thumb=e.target.closest('.thumb');
  if(!thumb)return;
  if(suppressThumbClick){
    suppressThumbClick=false;
    return;
  }
  activatePage(+thumb.dataset.index);
});
el('filmstrip').addEventListener('keydown',e=>{
  const lock=e.target.closest('[data-lock]');
  if(!lock||(e.key!=='Enter'&&e.key!==' '))return;
  e.preventDefault();
  e.stopPropagation();
  togglePageLock(+lock.dataset.lock);
});
el('filmstrip').addEventListener('dragstart',e=>{
  const thumb=e.target.closest('.thumb');
  if(!thumb)return;
  draggedIndex=+thumb.dataset.index;
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain',String(draggedIndex));
  thumb.classList.add('dragging');
});
el('filmstrip').addEventListener('dragover',e=>{
  if(!e.target.closest('.thumb'))return;
  e.preventDefault();
  e.dataTransfer.dropEffect='move';
});
el('filmstrip').addEventListener('drop',e=>{
  const thumb=e.target.closest('.thumb');
  if(!thumb||draggedIndex===null)return;
  e.preventDefault();
  reorderPages(draggedIndex,+thumb.dataset.index);
  draggedIndex=null;
});
el('filmstrip').addEventListener('dragend',()=>{
  draggedIndex=null;
  document.querySelectorAll('.thumb.dragging').forEach(thumb=>thumb.classList.remove('dragging'));
});
el('filmstrip').addEventListener('pointerdown',e=>{
  const thumb=e.target.closest('.thumb');
  if(!thumb||e.button!==0)return;
  pointerDrag={index:+thumb.dataset.index,startX:e.clientX,startY:e.clientY,dragging:false,thumb};
  if(thumb.setPointerCapture)thumb.setPointerCapture(e.pointerId);
});
el('filmstrip').addEventListener('pointermove',e=>{
  if(!pointerDrag)return;
  const dx=e.clientX-pointerDrag.startX;
  const dy=e.clientY-pointerDrag.startY;
  if(!pointerDrag.dragging&&Math.hypot(dx,dy)>8){
    pointerDrag.dragging=true;
    pointerDrag.thumb.classList.add('dragging');
  }
  if(pointerDrag.dragging)e.preventDefault();
});
el('filmstrip').addEventListener('pointerup',e=>{
  if(!pointerDrag)return;
  const drag=pointerDrag;
  pointerDrag=null;
  if(drag.thumb.releasePointerCapture)drag.thumb.releasePointerCapture(e.pointerId);
  drag.thumb.classList.remove('dragging');
  if(!drag.dragging)return;
  suppressThumbClick=true;
  const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.thumb');
  if(target)reorderPages(drag.index,+target.dataset.index);
});
el('filmstrip').addEventListener('pointercancel',()=>{
  if(pointerDrag)pointerDrag.thumb.classList.remove('dragging');
  pointerDrag=null;
});

function flash(id,msg){
  const b=el(id),old=b.textContent;
  b.textContent=tr(msg);
  setTimeout(()=>b.textContent=old,1500);
}
function recap(page,index){
  const sideLabel=isSingleCover(page)?'plat seul':page.layout==='dual'?'image gauche + image droite':page.layout==='panorama'?'image sur les deux pages':`image à ${effectiveSide(page)==='left'?'gauche':'droite'}`;
  const imageLine=slot=>'Image '+(slot==='img2'?'droite':'principale')+' : '+(imageFit(page,slot)==='fill'?'remplir':imageFit(page,slot)==='contain'?'voir entière':'avec marge '+imageInset(page,slot)+' %')+' · taille '+imageZoom(page,slot)+' % · déplacement '+imageOffsetX(page,slot)+' / '+imageOffsetY(page,slot)+' · pivot '+imageRotation(page,slot)+'°'+(imageFlipped(page,slot)?' · miroir':'')+' · trait '+(imageRule(page,slot)?'avec':'sans');
  const blockLine=(area,label)=>`${label} : largeur ${textWidth(page,area)} % · position ${textX(page,area)} / ${textY(page,area)} · écart ${textGap(page,area)} · alignement ${textAlign(page,area)==='left'?'gauche':textAlign(page,area)==='center'?'centre':'droite'}`;
  const middleSep=page.layout==='panorama'
    ? 'Séparation au milieu : '+(panoSep(page)==='none'?'sans':panoSep(page)==='line'?'trait fin':'bande douce')+' · '+panoWidth(page)+' px · discrétion '+panoOpacity(page)+' %'
    : null;
  return [
    'ICHKA — réglages de la vue',
    `Vue : ${index+1} / ${pages.length} · ${pageRange(index,page)}`,
    'Nom : '+page.name,
    'Type : '+page.kind,
    `Format : ${(TRIM_W_MM/10).toFixed(1)} × ${(TRIM_H_MM/10).toFixed(1)} cm (${TRIM_W_MM} × ${TRIM_H_MM} mm) · fond perdu ${BLEED_MM} mm`,
    'Rendu et fichiers : RVB sRGB',
    'Disposition : '+layoutLabel(page)+' · '+sideLabel,
    imageLine('img'),
    ...(canUseSecondImage(page)?[imageLine('img2')]:[]),
    ...(middleSep?[middleSep]:[]),
    "Fond derrière l'image : "+page.hue+' · force '+page.intensity+' %',
    'Filet : '+(filetActif(page)?page.rule+' · '+liseretWeight(page)+' px · longueur '+filetLongueur(page)+' % · position '+filetX(page)+' / '+filetY(page):'aucun'),
    'Papier : '+page.paper,
    'Marges du texte : '+page.margin+' mm',
    ...(isFullCover(page)?[
      blockLine('back','Bloc texte gauche'),
      blockLine('front','Bloc texte droite')
    ]:[blockLine('main','Bloc texte')]),
    'Polices : titre '+titleFontKey(page)+' · texte '+bodyFontKey(page),
    recapTextLine(page,'serie','Titre')+' — '+textSize(page,'serie')+' px',
    recapTextLine(page,'chapt','Sous-titre'),
    recapTextLine(page,'kick','Mention du haut'),
    ...(isFullCover(page)?[
      recapTextLine(page,'spineText','Texte sur le dos',page.spineText||page.serie),
      recapTextLine(page,'coverBackKick','Mention du haut, au verso',page.coverBackKick||page.kick),
      recapTextLine(page,'coverBackTitle','Titre au verso',page.coverBackTitle),
      recapTextLine(page,'coverBackText','Texte au verso',page.coverBackText)
    ]:[]),
    recapTextLine(page,'intro','Paragraphe')
  ].join('\n');
}
function recapTextLine(page,key,label,value=page[key]){
  if(isTextHidden(page,key))return label+' : ligne supprimée';
  return label+' : '+(value||'(vide)');
}
el('copy').addEventListener('click',async()=>{
  const t=recap(currentPage(),activeIndex);
  try{
    await navigator.clipboard.writeText(t);
    flash('copy','Copié \u2713');
  }catch(_){
    const c=el('clip');
    c.style.display='block';
    c.value=t;
    c.focus();
    c.select();
    flash('copy','Sélectionne puis Ctrl/Cmd+C');
  }
});

// Un onglet en arrière-plan ne déclenche plus requestAnimationFrame : sans ce
// filet de sécurité, un export lancé puis laissé de côté resterait figé.
function waitForPaint(){
  return new Promise(resolve=>{
    let fait=false;
    const finir=()=>{if(!fait){fait=true;resolve();}};
    requestAnimationFrame(()=>requestAnimationFrame(finir));
    setTimeout(finir,80);
  });
}
function hexToRgb(hex){
  const clean=String(hex||'#000000').replace('#','');
  const full=clean.length===3?clean.split('').map(c=>c+c).join(''):clean.padEnd(6,'0').slice(0,6);
  return [parseInt(full.slice(0,2),16),parseInt(full.slice(2,4),16),parseInt(full.slice(4,6),16)];
}
function rgba(hex,alpha){
  const [r,g,b]=hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
function trackedTextWidth(ctx,text,spacing){
  const chars=[...String(text||'')];
  return chars.reduce((sum,char)=>sum+ctx.measureText(char).width,0)+Math.max(0,chars.length-1)*spacing;
}
function drawTrackedText(ctx,text,x,y,spacing,align='left'){
  if(align==='center')x-=trackedTextWidth(ctx,text,spacing)/2;
  if(align==='right')x-=trackedTextWidth(ctx,text,spacing);
  [...String(text||'')].forEach(char=>{
    ctx.fillText(char,x,y);
    x+=ctx.measureText(char).width+spacing;
  });
}
function alignedTextX(x,maxWidth,align){
  if(align==='center')return x+maxWidth/2;
  if(align==='right')return x+maxWidth;
  return x;
}
function drawWrappedText(ctx,text,x,y,maxWidth,lineHeight,maxLines,align='left'){
  const words=String(text||'').split(/\s+/).filter(Boolean);
  let line='';
  let lines=0;
  const oldAlign=ctx.textAlign;
  ctx.textAlign=align;
  for(const word of words){
    const test=line?line+' '+word:word;
    if(line&&ctx.measureText(test).width>maxWidth){
      ctx.fillText(line,alignedTextX(x,maxWidth,align),y);
      y+=lineHeight;
      lines++;
      line=word;
      if(maxLines&&lines>=maxLines){
        ctx.textAlign=oldAlign;
        return y;
      }
    }else{
      line=test;
    }
  }
  if(line&&(!maxLines||lines<maxLines)){
    ctx.fillText(line,alignedTextX(x,maxWidth,align),y);
    y+=lineHeight;
  }
  ctx.textAlign=oldAlign;
  return y;
}
function imageCanvasBox(page,x,y,w,h,slot='img'){
  const inset=imageFit(page,slot)==='inset'?Math.min(w,h)*(imageInset(page,slot)/100):0;
  return {x:x+inset,y:y+inset,w:w-inset*2,h:h-inset*2};
}
function drawPlacedImage(ctx,page,img,x,y,w,h,slot='img'){
  const box=imageCanvasBox(page,x,y,w,h,slot);
  const base=imageFit(page,slot)==='fill'
    ? Math.max(box.w/img.width,box.h/img.height)
    : Math.min(box.w/img.width,box.h/img.height);
  const scale=base*(imageZoom(page,slot)/100);
  const dw=img.width*scale;
  const dh=img.height*scale;
  const cx=box.x+box.w/2+(imageOffsetX(page,slot)/100)*box.w;
  const cy=box.y+box.h/2+(imageOffsetY(page,slot)/100)*box.h;
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(imageRotation(page,slot)*Math.PI/180);
  if(imageFlipped(page,slot))ctx.scale(-1,1);
  ctx.drawImage(img,-dw/2,-dh/2,dw,dh);
  ctx.restore();
  return box;
}
function loadCanvasImage(src){
  if(!src)return Promise.resolve(null);
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>resolve(null);
    img.src=src;
  });
}
// Chemin à coins arrondis, chaque coin ayant un rayon horizontal et vertical
// distincts — c'est ainsi que fonctionne border-radius, et c'est nécessaire
// pour reproduire l'arche (haut arrondi, bas droit).
function cheminCoinsArrondis(ctx,b,tl,tr,br,bl){
  const {x,y,w,h}=b;
  ctx.beginPath();
  ctx.moveTo(x+tl.x,y);
  ctx.lineTo(x+w-tr.x,y);
  if(tr.x||tr.y)ctx.ellipse(x+w-tr.x,y+tr.y,tr.x,tr.y,0,-Math.PI/2,0);
  ctx.lineTo(x+w,y+h-br.y);
  if(br.x||br.y)ctx.ellipse(x+w-br.x,y+h-br.y,br.x,br.y,0,0,Math.PI/2);
  ctx.lineTo(x+bl.x,y+h);
  if(bl.x||bl.y)ctx.ellipse(x+bl.x,y+h-bl.y,bl.x,bl.y,0,Math.PI/2,Math.PI);
  ctx.lineTo(x,y+tl.y);
  if(tl.x||tl.y)ctx.ellipse(x+tl.x,y+tl.y,tl.x,tl.y,0,Math.PI,Math.PI*1.5);
  ctx.closePath();
}
// Rendu de secours du détourage : mêmes formules que imageShapeCss() côté écran.
function tracerFormeImage(ctx,page,box,slot='img'){
  const forme=shapeAvailable(page,slot)?imageShape(page,slot):'none';
  if(forme==='none')return false;
  const t=imageShapeAmount(page,slot)/100;
  if(forme==='oval'){
    ctx.beginPath();
    ctx.ellipse(box.x+box.w/2,box.y+box.h/2,box.w/2,box.h/2,0,0,Math.PI*2);
    return true;
  }
  if(forme==='round'){
    // Rayon circulaire : on prend le plus petit des deux, comme à l'écran où
    // les pourcentages sont appariés par le rapport d'image.
    const r0=Math.min(box.w*(2+t*22)/100,box.h/2);
    const r={x:r0,y:r0};
    cheminCoinsArrondis(ctx,box,r,r,r,r);
    return true;
  }
  if(forme==='arch'){
    const r={x:box.w*.5,y:Math.min(box.h/2,box.h*(25+t*25)/100)};
    cheminCoinsArrondis(ctx,box,r,r,{x:0,y:0},{x:0,y:0});
    return true;
  }
  if(forme==='bevel'){
    const c=Math.min(box.w,box.h)*(3+t*17)/100;
    ctx.beginPath();
    ctx.moveTo(box.x+c,box.y);
    ctx.lineTo(box.x+box.w-c,box.y);
    ctx.lineTo(box.x+box.w,box.y+c);
    ctx.lineTo(box.x+box.w,box.y+box.h-c);
    ctx.lineTo(box.x+box.w-c,box.y+box.h);
    ctx.lineTo(box.x+c,box.y+box.h);
    ctx.lineTo(box.x,box.y+box.h-c);
    ctx.lineTo(box.x,box.y+c);
    ctx.closePath();
    return true;
  }
  if(forme==='deckle'){
    // Vagues creusées dans les quatre bords : on longe le contour en retirant
    // un demi-disque à chaque pas.
    // Mêmes valeurs qu'à l'écran (voir imageCarveMarkup) : période en % de la
    // largeur, rayon = 0,46 × le pas, pas vertical égal au pas horizontal.
    const periode=3+t*7;
    const nx=Math.max(4,Math.round(100/periode));
    const sx=box.w/nx;
    const prof=sx*0.46;
    const ny=Math.max(4,Math.round(box.h/sx));
    const sy=box.h/ny;
    // anticlockwise=true dans les quatre cas : en canvas l'angle croît dans le
    // sens horaire, et il faut que chaque demi-disque creuse VERS L'INTÉRIEUR
    // de l'image, pas vers l'extérieur.
    ctx.beginPath();
    ctx.moveTo(box.x,box.y);
    for(let i=0;i<nx;i++)ctx.arc(box.x+sx*(i+.5),box.y,prof,Math.PI,0,true);
    ctx.lineTo(box.x+box.w,box.y);
    for(let i=0;i<ny;i++)ctx.arc(box.x+box.w,box.y+sy*(i+.5),prof,-Math.PI/2,Math.PI/2,true);
    ctx.lineTo(box.x+box.w,box.y+box.h);
    for(let i=nx-1;i>=0;i--)ctx.arc(box.x+sx*(i+.5),box.y+box.h,prof,0,Math.PI,true);
    ctx.lineTo(box.x,box.y+box.h);
    for(let i=ny-1;i>=0;i--)ctx.arc(box.x,box.y+sy*(i+.5),prof,Math.PI/2,-Math.PI/2,true);
    ctx.closePath();
    return true;
  }
  return false;
}
// Boîte sur laquelle porte la découpe. Quand une forme est active, elle épouse
// l'image réellement dessinée et non le cadre de la page — pendant exact du
// « hug » côté écran.
function imageShapeBox(page,img,x,y,w,h,slot='img'){
  const box=imageCanvasBox(page,x,y,w,h,slot);
  const A=imageAspect(page,slot);
  if(!img||!imageHugs(page,slot)||!(A>0))return box;
  let bw=box.w, bh=box.w/A;
  if(bh>box.h){bh=box.h;bw=box.h*A;}
  const cadre=imageFrameScale(page,slot);   // même facteur qu'à l'écran
  bw*=cadre; bh*=cadre;
  return {x:box.x+(box.w-bw)/2,y:box.y+(box.h-bh)/2,w:bw,h:bh};
}
function drawImagePanel(ctx,page,img,x,y,w,h,fallback,slot='img'){
  ctx.save();
  ctx.beginPath();
  ctx.rect(x,y,w,h);
  ctx.clip();
  const box=imageShapeBox(page,img,x,y,w,h,slot);
  if(!img){
    ctx.fillStyle=page.paper||BLANK_IMAGE_BG;
    ctx.fillRect(x,y,w,h);
  }else{
    ctx.fillStyle=fallback||'#0E0C10';
    ctx.fillRect(x,y,w,h);
    ctx.globalAlpha=page.intensity/100;
    ctx.fillStyle=page.hue;
    ctx.fillRect(x,y,w,h);
    ctx.globalAlpha=1;
    // Le fond de page reste entier ; seule la fenêtre d'image est découpée,
    // exactement comme .image-window et son border-radius à l'écran.
    ctx.save();
    if(tracerFormeImage(ctx,page,box,slot))ctx.clip();
    drawPlacedImage(ctx,page,img,x,y,w,h,slot);
    const grd=ctx.createLinearGradient(x,y+h*.55,x,y+h);
    grd.addColorStop(0,'rgba(0,0,0,0)');
    grd.addColorStop(1,'rgba(0,0,0,.28)');
    ctx.fillStyle=grd;
    ctx.fillRect(x,y,w,h);
    ctx.restore();
  }
  if(imageRule(page,slot)){
    ctx.strokeStyle=page.rule;
    ctx.lineWidth=liseretWeight(page);
    if(tracerFormeImage(ctx,page,box,slot))ctx.stroke();
    else ctx.strokeRect(box.x,box.y,box.w,box.h);
  }
  ctx.restore();
}
function drawTopImageCanvas(ctx,page,img,x,y,w,h,slot='img'){
  if(!img||topImageSlot(page)!==slot)return;
  const dw=w*(topImageSize(page)/100);
  const dh=dw*(img.height/img.width);
  const cx=x+w/2+(topImageX(page)/100)*w;
  const cy=y+h/2+(topImageY(page)/100)*h;
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(topImageRotation(page)*Math.PI/180);
  ctx.globalAlpha=topImageOpacity(page)/100;
  ctx.drawImage(img,-dw/2,-dh/2,dw,dh);
  if(page.topImgRule){
    ctx.strokeStyle=page.rule;
    ctx.lineWidth=liseretWeight(page);
    ctx.strokeRect(-dw/2,-dh/2,dw,dh);
  }
  ctx.restore();
}
function drawPanoramaDecorCanvas(ctx,page,x,y,w,h){
  drawRuleOrnamentCanvas(ctx,page,x,y,w,h);
}
function drawRuleOrnamentCanvas(ctx,page,x,y,w,h){
  // Le filet, dans le rendu de secours : mêmes proportions qu'à l'écran.
  if(!filetActif(page))return;
  const largeur=w*filetLongueur(page)/100;
  const epaisseur=liseretWeight(page);
  ctx.save();
  ctx.fillStyle=page.rule;
  ctx.fillRect(x+w*filetX(page)/100-largeur/2,y+h*filetY(page)/100-epaisseur/2,largeur,epaisseur);
  ctx.restore();
}
function drawPaperPage(ctx,page,index,x,y,w,h){
  const pad=page.margin/203*w;
  const align=textAlign(page);
  const gap=textGap(page);
  const copyW=Math.min(w-pad*2,w*(textWidth(page)/100));
  const copyX=x+pad+textX(page);
  const midY=y+h*.55+textY(page);
  const textAnchor=alignedTextX(copyX,copyW,align);
  ctx.fillStyle=page.paper;
  ctx.fillRect(x,y,w,h);
  drawRuleOrnamentCanvas(ctx,page,x,y,w,h,Math.min(pad,w*.1));
  if(!isTextHidden(page,'kick')){
    ctx.fillStyle=textColorInput(page,'kick');
    ctx.font=`${textSize(page,'kick')}px ${canvasBodyFont(page)}`;
    drawTrackedText(ctx,page.kick,textAnchor,y+pad+textY(page)+8,3,align);
  }

  if(!isTextHidden(page,'chapt')){
    ctx.fillStyle=textColorInput(page,'chapt');
    ctx.font=`italic ${textSize(page,'chapt')}px ${canvasTitleFont(page)}`;
    ctx.textAlign=align;
    ctx.fillText(page.chapt,textAnchor,midY);
  }

  const serieSize=textSize(page,'serie');
  let textYPos=midY+serieSize+2+gap;
  if(!isTextHidden(page,'serie')){
    ctx.fillStyle=textColorInput(page,'serie');
    ctx.font=`700 ${serieSize}px ${canvasTitleFont(page)}`;
    textYPos=drawWrappedText(ctx,page.serie,copyX,textYPos,copyW,serieSize*textLeading(page,'serie'),3,align);
  }

  textYPos+=10+gap;
  const ruleBottom=textYPos;

  if(!isTextHidden(page,'intro')){
    ctx.fillStyle=textColorInput(page,'intro');
    ctx.font=`${textSize(page,'intro')}px ${canvasBodyFont(page)}`;
    drawWrappedText(ctx,page.intro,copyX,ruleBottom+16+gap,copyW,textSize(page,'intro')*textLeading(page,'intro'),4,align);
  }

  // Le folio n'est plus dessiné ici : il est posé au niveau de la double-page
  // par drawFolios(), pour pouvoir apparaître à gauche, à droite ou des deux
  // côtés selon le réglage du livre.
}
function drawEditorialTile(ctx,page,img,x,y,w,h,fallback){
  drawImagePanel(ctx,page,img,x,y,w,h,fallback);
}
function drawEditorialLines(ctx,x,y,width,count){
  ctx.fillStyle='#D5D0C7';
  for(let i=0;i<count;i++){
    const shrink=i===count-1 ? .85 : 1;
    ctx.fillRect(x,y+i*17,width*shrink,.5);
  }
}
function drawEditorialLeft(ctx,page,img,index,x,y,w,h){
  const folio=pad2(interiorPageStart(index));
  ctx.fillStyle=page.paper;
  ctx.fillRect(x,y,w,h);
  drawEditorialTile(ctx,page,img,x+w*.08,y+h*.09,w*.84,h*.40,'#26215C');
  drawEditorialTile(ctx,page,img,x+w*.08,y+h*.56,w*.38,h*.32,'#4A1B0C');
  drawEditorialLines(ctx,x+w*.52,y+h*.58,w*.40,4);
  ctx.fillStyle='#B4AFA6';
  ctx.font='8px ui-monospace, Menlo, monospace';
  ctx.fillText(folio,x+w*.08,y+h*.94);
}
function drawEditorialRight(ctx,page,img,index,x,y,w,h){
  const folio=pad2(interiorPageStart(index)+1);
  ctx.fillStyle=page.paper;
  ctx.fillRect(x,y,w,h);
  if(!isTextHidden(page,'kick')){
    ctx.fillStyle=textColorInput(page,'kick');
    ctx.font=`${textSize(page,'kick')}px ${canvasBodyFont(page)}`;
    drawTrackedText(ctx,page.kick,x+w*.09,y+h*.08+8,3);
  }
  drawEditorialTile(ctx,page,img,x+w*.09,y+h*.16,w*.40,h*.44,'#04342C');
  drawEditorialLines(ctx,x+w*.53,y+h*.18,w*.38,3);
  drawEditorialTile(ctx,page,img,x+w*.09,y+h*.64,w*.82,h*.24,'#501313');
  ctx.fillStyle='#B4AFA6';
  ctx.font='8px ui-monospace, Menlo, monospace';
  ctx.textAlign='right';
  ctx.fillText(folio,x+w*.91,y+h*.94);
  ctx.textAlign='left';
}
function drawGutter(ctx,w,h){
  const mid=w/2;
  const grd=ctx.createLinearGradient(mid-18,0,mid+18,0);
  grd.addColorStop(0,'rgba(0,0,0,0)');
  grd.addColorStop(.5,'rgba(0,0,0,.18)');
  grd.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grd;
  ctx.fillRect(mid-18,0,36,h);
}
function drawPanoramaSeparation(ctx,page,x,y,w,h){
  const style=panoSep(page);
  if(style==='none')return;
  const width=style==='line'?Math.max(1,panoWidth(page)):panoWidth(page);
  const mid=x+w/2;
  const color=rgba(page.panoColor||PAGE_TEMPLATE.panoColor,panoOpacity(page)/100);
  ctx.save();
  if(style==='line'){
    ctx.fillStyle=color;
    ctx.fillRect(mid-width/2,y,width,h);
  }else{
    const grd=ctx.createLinearGradient(mid-width/2,y,mid+width/2,y);
    grd.addColorStop(0,'rgba(255,255,255,0)');
    grd.addColorStop(.5,color);
    grd.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=grd;
    ctx.fillRect(mid-width/2,y,width,h);
  }
  ctx.restore();
}
// Fallback PNG quand html2canvas n'est pas disponible : une couverture est une page seule.
function drawSingleCover(ctx,page,img,topImg,x,y,w,h){
  drawImagePanel(ctx,page,img,x,y,w,h,page.hue);
  drawTopImageCanvas(ctx,page,topImg,x,y,w,h,'img');
  drawRuleOrnamentCanvas(ctx,page,x,y,w,h,w*.07);
  ctx.save();
  const pad=w*.12;
  const align=textAlign(page);
  const gap=textGap(page);
  const copyW=Math.min(w-pad*2,w*(textWidth(page)/100));
  const copyX=x+pad+textX(page);
  const textAnchor=alignedTextX(copyX,copyW,align);
  let textYPos=y+h*.62+textY(page);
  if(!isTextHidden(page,'kick')){
    ctx.fillStyle=textColorInput(page,'kick');
    ctx.font=`${textSize(page,'kick')}px ${canvasBodyFont(page)}`;
    drawTrackedText(ctx,page.kick,textAnchor,textYPos,3,align);
  }
  textYPos+=h*.065+gap;
  if(!isTextHidden(page,'chapt')){
    ctx.fillStyle=textColorInput(page,'chapt');
    ctx.font=`italic ${textSize(page,'chapt')}px ${canvasTitleFont(page)}`;
    ctx.textAlign=align;
    ctx.fillText(page.chapt,textAnchor,textYPos);
  }
  const serieSize=textSize(page,'serie');
  textYPos+=serieSize*1.08+gap;
  if(!isTextHidden(page,'serie')){
    ctx.fillStyle=textColorInput(page,'serie');
    ctx.font=`700 ${serieSize}px ${canvasTitleFont(page)}`;
    textYPos=drawWrappedText(ctx,page.serie,copyX,textYPos,copyW,serieSize*textLeading(page,'serie'),3,align);
  }
  textYPos+=12+gap;
  const ruleBottom=textYPos;
  if(!isTextHidden(page,'intro')){
    const introSize=textSize(page,'intro');
    ctx.fillStyle=textColorInput(page,'intro');
    ctx.font=`${introSize}px ${canvasBodyFont(page)}`;
    drawWrappedText(ctx,page.intro,copyX,ruleBottom+18+gap,copyW,introSize*textLeading(page,'intro'),5,align);
  }
  ctx.restore();
}
function drawFullCoverCanvas(ctx,page,img,topImg,x,y,w,h){
  const m=coverMetrics();
  drawImagePanel(ctx,page,img,x,y,w,h,page.hue);
  drawTopImageCanvas(ctx,page,topImg,x,y,w,h,'img');
  const backX=x+w*(BLEED_MM/m.totalW);
  const panelW=w*(TRIM_W_MM/m.totalW);
  const spineX=x+w*((BLEED_MM+TRIM_W_MM)/m.totalW);
  const spineW=w*(m.spine/m.totalW);
  const frontX=x+w*((BLEED_MM+TRIM_W_MM+m.spine)/m.totalW);
  const top=y+h*(BLEED_MM/m.totalH);
  const panelH=h*(TRIM_H_MM/m.totalH);
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.22)';
  ctx.fillRect(spineX,top,Math.max(1,spineW),panelH);
  ctx.strokeStyle='rgba(255,255,255,.18)';
  ctx.lineWidth=1;
  ctx.strokeRect(backX,top,panelW,panelH);
  ctx.strokeRect(frontX,top,panelW,panelH);

  const backAlign=textAlign(page,'back');
  const backGap=textGap(page,'back');
  const backCopyW=Math.min(panelW*.76,panelW*(textWidth(page,'back')/100));
  const backCopyX=backX+panelW*.12+textX(page,'back');
  const backAnchor=alignedTextX(backCopyX,backCopyW,backAlign);
  let backTextY=top+panelH*.18+textY(page,'back');
  if(!isTextHidden(page,'coverBackKick')){
    ctx.fillStyle=textColorInput(page,'coverBackKick');
    ctx.font=`${textSize(page,'coverBackKick')}px ${canvasBodyFont(page)}`;
    drawTrackedText(ctx,page.coverBackKick||page.kick,backAnchor,backTextY,3,backAlign);
  }
  backTextY+=Math.max(20,textSize(page,'coverBackKick')*2)+backGap;
  if(!isTextHidden(page,'coverBackTitle')){
    ctx.fillStyle=textColorInput(page,'coverBackTitle');
    ctx.font=`700 ${textSize(page,'coverBackTitle')}px ${canvasTitleFont(page)}`;
    backTextY=drawWrappedText(ctx,page.coverBackTitle||page.chapt,backCopyX,backTextY,backCopyW,textSize(page,'coverBackTitle')*textLeading(page,'coverBackTitle'),3,backAlign);
  }
  backTextY+=12+backGap;
  if(!isTextHidden(page,'coverBackText')){
    ctx.fillStyle=textColorInput(page,'coverBackText');
    ctx.font=`${textSize(page,'coverBackText')}px ${canvasBodyFont(page)}`;
    drawWrappedText(ctx,page.coverBackText||page.intro,backCopyX,backTextY,backCopyW,textSize(page,'coverBackText')*textLeading(page,'coverBackText'),8,backAlign);
  }

  drawRuleOrnamentCanvas(ctx,page,frontX,top,panelW,panelH,panelW*.07);
  const align=textAlign(page,'front');
  const gap=textGap(page,'front');
  const copyW=Math.min(panelW*.76,panelW*(textWidth(page,'front')/100));
  const copyX=frontX+panelW*.12+textX(page,'front');
  const textAnchor=alignedTextX(copyX,copyW,align);
  let textYPos=top+panelH*.62+textY(page,'front');
  if(!isTextHidden(page,'kick')){
    ctx.fillStyle=textColorInput(page,'kick');
    ctx.font=`${textSize(page,'kick')}px ${canvasBodyFont(page)}`;
    drawTrackedText(ctx,page.kick,textAnchor,textYPos,3,align);
  }
  textYPos+=panelH*.065+gap;
  if(!isTextHidden(page,'chapt')){
    ctx.fillStyle=textColorInput(page,'chapt');
    ctx.font=`italic ${textSize(page,'chapt')}px ${canvasTitleFont(page)}`;
    ctx.textAlign=align;
    ctx.fillText(page.chapt,textAnchor,textYPos);
  }
  textYPos+=textSize(page,'serie')*1.08+gap;
  if(!isTextHidden(page,'serie')){
    ctx.fillStyle=textColorInput(page,'serie');
    ctx.font=`700 ${textSize(page,'serie')}px ${canvasTitleFont(page)}`;
    drawWrappedText(ctx,page.serie,copyX,textYPos,copyW,textSize(page,'serie')*textLeading(page,'serie'),3,align);
  }
  // Dos : titre dans le premier tiers, auteur dans le dernier — mêmes repères
  // qu'à l'écran (1/6 et 5/6 de la hauteur).
  if(m.pageCount>=79&&spineW>8){
    // Même plafond de taille qu'à l'écran (voir fitSpineText).
    const plafond=spineW*SPINE_TEXT_RATIO;
    const surLeDos=(texte,cle,style,fraction,police)=>{
      if(!texte||isTextHidden(page,cle))return;
      ctx.save();
      ctx.translate(spineX+spineW/2,top+panelH*fraction);
      ctx.rotate(-Math.PI/2);
      ctx.fillStyle=textColorInput(page,style);
      ctx.font=`${Math.min(textSize(page,style),plafond)}px ${police}`;
      ctx.textAlign='center';
      ctx.fillText(texte,0,3);
      ctx.restore();
    };
    surLeDos(page.spineText||page.serie,'spineText','serie',1/6,canvasTitleFont(page));
    surLeDos(page.kick,'kick','kick',5/6,canvasBodyFont(page));
  }
  ctx.restore();
}
async function captureSpreadNative(scale=2){
  if(document.fonts&&document.fonts.ready)await document.fonts.ready.catch(()=>{});
  const page=currentPage();
  const img=await loadCanvasImage(page.img);
  const img2=await loadCanvasImage(page.img2);
  const topImg=await loadCanvasImage(page.topImg);
  const rect=el('spread').getBoundingClientRect();
  const w=Math.round(rect.width||560);
  const h=Math.round(rect.height||w*(isSingleCover(page)?5/4:5/8));
  const canvas=document.createElement('canvas');
  canvas.width=w*scale;
  canvas.height=h*scale;
  const ctx=canvas.getContext('2d');
  ctx.scale(scale,scale);
  ctx.fillStyle='rgba(0,0,0,0)';
  ctx.fillRect(0,0,w,h);
  if(isFullCover(page)){
    drawFullCoverCanvas(ctx,page,img,topImg,0,0,w,h);
    return canvas;
  }
  if(isSingleCover(page)){
    drawSingleCover(ctx,page,img,topImg,0,0,w,h);
    return canvas;
  }
  const pageW=w/2;
  if(page.layout==='panorama'){
    drawImagePanel(ctx,page,img,0,0,w,h,'#241A3D');
    drawTopImageCanvas(ctx,page,topImg,0,0,w,h,'img');
    drawPanoramaDecorCanvas(ctx,page,0,0,w,h);
    drawPanoramaSeparation(ctx,page,0,0,w,h);
    drawFolios(ctx,page,activeIndex,w,h);
    return canvas;
  }else if(page.layout==='dual'){
    drawImagePanel(ctx,page,img,0,0,pageW,h,'#241A3D');
    drawImagePanel(ctx,page,img2,pageW,0,pageW,h,'#241A3D','img2');
    drawTopImageCanvas(ctx,page,topImg,0,0,pageW,h,'img');
    drawTopImageCanvas(ctx,page,topImg,pageW,0,pageW,h,'img2');
  }else if(page.layout==='galerie'){
    const side=effectiveSide(page);
    const imageX=side==='right'?pageW:0;
    const paperX=side==='right'?0:pageW;
    drawImagePanel(ctx,page,img,imageX,0,pageW,h,'#241A3D');
    drawTopImageCanvas(ctx,page,topImg,imageX,0,pageW,h,'img');
    drawPaperPage(ctx,page,activeIndex,paperX,0,pageW,h);
  }else if(effectiveSide(page)==='right'){
    drawEditorialRight(ctx,page,img,activeIndex,0,0,pageW,h);
    drawEditorialLeft(ctx,page,img,activeIndex,pageW,0,pageW,h);
  }else{
    drawEditorialLeft(ctx,page,img,activeIndex,0,0,pageW,h);
    drawEditorialRight(ctx,page,img,activeIndex,pageW,0,pageW,h);
  }
  drawGutter(ctx,w,h);
  drawFolios(ctx,page,activeIndex,w,h);
  return canvas;
}
// Rendu de secours des folios : doit suivre exactement les mêmes règles que
// folioMarks() côté écran (position, police, pages numérotées).
function drawFolios(ctx,page,index,w,h){
  if(folioPosition==='none')return;
  if(isFullCover(page)||isSingleCover(page))return;
  const debut=interiorPageStart(index);
  let gauche='',droite='';
  if(isMixedCover(page)){
    if(page.surface==='inside-front')droite=pad2(debut);
    else gauche=pad2(debut);
  }else{
    gauche=pad2(debut);
    droite=pad2(debut+1);
  }
  if(!folioSideAllowed(page,'left'))gauche='';
  if(!folioSideAllowed(page,'right'))droite='';
  if(!gauche&&!droite)return;
  const {x,y}=folioOffsets();               // exactement le calcul de l'écran
  const dx=x/100*w;
  const dy=y/100*h;
  const pile=folioFont==='mono'?'ui-monospace, Menlo, monospace':(FONT_STACKS[folioFont]||'ui-monospace, Menlo, monospace');
  ctx.save();
  ctx.fillStyle=folioColor;
  ctx.font=`8px ${pile}`;
  ctx.textBaseline='alphabetic';
  const veut=cote=>folioPosition==='both'||folioPosition===cote;
  if(gauche&&veut('left')){ctx.textAlign='left';ctx.fillText(gauche,dx,h-dy);}
  if(droite&&veut('right')){ctx.textAlign='right';ctx.fillText(droite,w-dx,h-dy);}
  ctx.restore();
}
const EXPORT_DPI=300;
// Largeur réelle de la vue, en millimètres, fond perdu compris.
// Rappel affiché juste avant les boutons d'export : ce que contient réellement
// le fichier produit, et l'alerte si le fond perdu s'écarte du gabarit d'Amazon,
// qui impose une taille exacte et non un minimum.
const BLEED_KDP_MM=3.2;
function renderExportNote(){
  renderRelinkItem();
  const node=el('exportNote');
  if(!node)return;
  const page=currentPage();
  const cover=isFullCover(page);
  const larg=spreadWidthMm(page);
  const haut=cover?coverMetrics().totalH:innerMetrics(1).totalH;
  const px=(mm)=>Math.round(mm/25.4*EXPORT_DPI);
  const nb=v=>String(Math.round(v*10)/10).replace('.',',');
  const vue=cover?'La couverture sort':'Chaque double page sort';
  let texte=`${vue} en <b>${nb(larg)} × ${nb(haut)} mm</b> à 300 dpi (${px(larg)} × ${px(haut)} px), `
    +`fond perdu de ${nb(BLEED_MM)} mm compris. Ne recadre pas les fichiers : cette marge est faite pour être coupée.`;
  // Bilan des images : c'est au moment de déposer chez l'imprimeur qu'il faut
  // savoir combien sortiront en dessous des 300 dpi.
  let faibles=0,pireDpi=null;
  pages.forEach(pg=>imageSlotsOf(pg).filter(s=>imageUrl(pg,s)).forEach(s=>{
    const q=qualityState(pg,s);
    if(q.status==='bad'||q.status==='warn'){
      faibles++;
      if(pireDpi===null||q.dpi<pireDpi)pireDpi=q.dpi;
    }
  }));
  const ecart=Math.abs(BLEED_MM-BLEED_KDP_MM)>0.05;
  node.classList.toggle('alert',ecart||faibles>0);
  if(faibles){
    texte+=` <b>${faibles} image${faibles>1?'s':''}</b> ${faibles>1?'sortiront':'sortira'} en dessous des 300 dpi`
      +(pireDpi?` (la plus faible à ${pireDpi} dpi)`:'')
      +` : à cette taille l'impression sera floue. Remplace-${faibles>1?'les':'la'} par ${faibles>1?'des versions plus grandes':'une version plus grande'}.`;
  }
  if(ecart){
    texte+=` <b>Attention :</b> Amazon exige exactement ${nb(BLEED_KDP_MM)} mm de fond perdu, pas davantage. `
      +`À ${nb(BLEED_MM)} mm, le fichier est hors gabarit chez eux — remets 3,2 mm dans « Format du livre » avant de déposer.`;
  }
  node.innerHTML=texte;
}
function syncExportFormatLabels(){
  const nom=exportFormat==='png'?'PNG':'JPEG';
  setText('exportFmt1',nom);
  setText('exportFmt2',nom);
}
function spreadWidthMm(page=currentPage()){
  // Largeur réellement contenue dans l'image exportée. La couverture double est
  // dessinée fond perdu compris ; les pages intérieures sont dessinées au format
  // rogné. Décrire autre chose fausserait le calcul des 300 dpi.
  if(isFullCover(page))return coverMetrics().totalW;
  return innerMetrics(isSingleCover(page)?1:2).totalW;
}
// L'échelle se calcule sur les millimètres du livre, pas sur les pixels écran :
// le fichier sort à 300 dpi quels que soient la fenêtre, le zoom ou l'écran.
function exportScale(page=currentPage()){
  const affiche=el('spread').getBoundingClientRect().width;
  if(!affiche)return 2;
  // La largeur finale ne dépend que du format du livre ; le garde-fou porte
  // donc sur elle, pas sur le facteur d'agrandissement.
  const voulu=Math.min(12000,spreadWidthMm(page)/25.4*EXPORT_DPI);
  return Math.max(1,voulu/affiche);
}
async function captureSpread(){
  const node=el('spread');
  node.classList.add('exporting');
  try{
    return await captureSpreadRaw(exportScale());
  }finally{
    node.classList.remove('exporting');
  }
}
function captureSpreadRaw(scale=2){
  if(typeof html2canvas==='function')return html2canvas(el('spread'),{
    scale,
    backgroundColor:null,
    useCORS:true,
    ignoreElements:node=>node.classList&&(node.classList.contains('print-guides')||node.classList.contains('print-zone-map'))
  });
  return captureSpreadNative(scale);
}
function safeName(value){
  return String(value||'sans-titre').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase()||'sans-titre';
}
// JPEG 95 % par défaut : c'est le format recommandé par Cewe, accepté par KDP,
// et il divise le poids par six sans perte visible sur des photos.
const EXPORT_QUALITY=0.95;
let exportFormat='jpeg';
function exportExtension(){
  return exportFormat==='png'?'png':'jpg';
}
function spreadToDataUrl(canvas){
  if(exportFormat==='png')return canvas.toDataURL('image/png');
  // Le JPEG ne gère pas la transparence : on pose un fond papier avant d'aplatir.
  const plat=document.createElement('canvas');
  plat.width=canvas.width;
  plat.height=canvas.height;
  const ctx=plat.getContext('2d');
  ctx.fillStyle='#FFFFFF';
  ctx.fillRect(0,0,plat.width,plat.height);
  ctx.drawImage(canvas,0,0);
  return plat.toDataURL('image/jpeg',EXPORT_QUALITY);
}
function pageFileName(index){
  return `ichka-${pad2(index+1)}-${safeName(pageRange(index,pages[index]))}-${safeName(pages[index].name||pages[index].serie)}.${exportExtension()}`;
}
function downloadDataUrl(url,name){
  const a=document.createElement('a');
  a.href=url;
  a.download=name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
const KDP_LIMITE_MO=650;
// Une data-URL est en base64 : son poids réel vaut environ les trois quarts.
function poidsMo(dataUrl){
  return String(dataUrl||'').length*0.75/1048576;
}
function bilanExport(items){
  const total=items.reduce((somme,item)=>somme+poidsMo(item.url),0);
  const depasse=total>KDP_LIMITE_MO;
  const ko=Math.round(total*1024);
  const affiche=ko<1000?ko+' Ko':total.toFixed(total<10?1:0).replace('.',',')+' Mo';
  return `<p class="export-total${depasse?' alert':''}">${items.length} fichier${items.length>1?'s':''} · ${affiche} · ${
    depasse
      ? 'au-dessus de la limite de '+KDP_LIMITE_MO+' Mo d’Amazon — passe en JPEG ou allège les images'
      : 'dans la limite de '+KDP_LIMITE_MO+' Mo d’Amazon'
  }</p>`;
}
function showExports(items,multiple){
  preparedExports=items;
  const out=el('out');
  out.hidden=false;
  if(multiple){
    out.innerHTML='<div class="bulk-actions"><button class="act" id="downloadPrepared" type="button">Télécharger les fichiers préparés</button></div>'+bilanExport(items)+'<div class="out-grid">'+items.map(item=>`<figure class="export-card"><figcaption>${esc(item.name)}</figcaption><img src="${item.url}" alt="Vue ${item.index+1}"><a class="act" download="${escAttr(item.name)}" href="${item.url}">Enregistrer</a></figure>`).join('')+'</div><p class="hint">Un fichier a été préparé pour chaque vue. Le bouton ci-dessus lance les téléchargements seulement quand tu le demandes.</p>';
  }else{
    const item=items[0];
    out.innerHTML='<img src="'+item.url+'" alt="Aperçu de la vue">'+bilanExport(items)+'<a class="act" download="'+escAttr(item.name)+'" href="'+escAttr(item.url)+'">Enregistrer le fichier</a><p class="hint">Sur mobile : appui long sur l&#39;image pour l&#39;enregistrer.</p>';
  }
  applyLanguage(out);
  out.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function exportActive(){
  const btn=el('png');
  const old=btn.textContent;
  let failed=false;
  btn.disabled=true;
  btn.textContent=tr('Rendu...');
  try{
    const cv=await captureSpread();
    const url=spreadToDataUrl(cv);
    const name=pageFileName(activeIndex);
    showExports([{url,name,index:activeIndex}],false);
  }catch(err){
    failed=true;
    console.error(err);
    btn.textContent=tr('Export indispo ici');
    setTimeout(()=>btn.textContent=old,1600);
  }finally{
    btn.disabled=false;
    if(!failed)btn.textContent=old;
  }
}
async function exportAll(){
  const btn=el('pngAll');
  const old=btn.textContent;
  const originalIndex=activeIndex;
  const items=[];
  let failed=false;
  btn.disabled=true;
  el('png').disabled=true;
  try{
    for(let i=0;i<pages.length;i++){
      activeIndex=i;
      syncControls();
      refresh();
      btn.textContent=`Export ${i+1}/${pages.length}`;
      await waitForPaint();
    const cv=await captureSpread();
    const url=spreadToDataUrl(cv);
    const name=pageFileName(i);
    items.push({url,name,index:i});
  }
    showExports(items,true);
  }catch(err){
    failed=true;
    console.error(err);
    btn.textContent=tr('Export indispo ici');
    setTimeout(()=>btn.textContent=old,1600);
  }finally{
    activeIndex=originalIndex;
    syncControls();
    refresh();
    btn.disabled=false;
    el('png').disabled=false;
    if(!failed)btn.textContent=old;
  }
}
el('png').addEventListener('click',exportActive);
el('pngAll').addEventListener('click',exportAll);
el('out').addEventListener('click',e=>{
  const b=e.target.closest('#downloadPrepared');
  if(!b)return;
  preparedExports.forEach(item=>downloadDataUrl(item.url,item.name));
});
el('reset').addEventListener('click',()=>{
  const oldUrl=currentPage().img;
  const oldSecondUrl=currentPage().img2;
  const oldTopUrl=currentPage().topImg;
  pages[activeIndex]=makePage({name:`Image + texte ${pad2(activeIndex+1)}`,kind:'Image + texte',surface:'interior',kick:`SÉRIE ${pad2(activeIndex+1)}`});
  releaseImage(oldUrl);
  releaseImage(oldSecondUrl);
  releaseImage(oldTopUrl);
  syncControls();
  refresh();
});

window.addEventListener('beforeunload',()=>{
  [...new Set(pages.flatMap(page=>[page.img,page.img2,page.topImg]).filter(Boolean))].forEach(url=>URL.revokeObjectURL(url));
});

syncPreviewDock();
syncControls();
updateFormatUI();
initLanguageSwitch();

document.addEventListener('click',e=>{
  const val=e.target.closest('.val');
  if(!val)return;
  const label=val.closest('label');
  if(!label)return;
  const range=label.parentElement.querySelector('input[type=range]');
  if(!range)return;
  const raw=val.textContent.replace(/[^0-9.\-]/g,'');
  const inp=document.createElement('input');
  inp.type='number';
  inp.value=raw;
  inp.min=range.min;
  inp.max=range.max;
  inp.step=range.step||1;
  inp.style.cssText='width:52px;font:13px/1 var(--mono);background:var(--sunk);color:var(--tx);border:1px solid var(--brass-line);border-radius:var(--r);padding:2px 4px;text-align:right;float:right';
  val.hidden=true;
  val.after(inp);
  inp.focus();
  inp.select();
  // finish() est déclenché par Entrée ET par le blur que provoque le retrait du
  // champ : sans ce verrou, on retirait deux fois le même nœud (NotFoundError).
  // On retire aussi le champ AVANT de déclencher le rendu, car celui-ci
  // reconstruit le panneau et détacherait le nœud sous nos pieds.
  let termine=false;
  const finish=()=>{
    if(termine)return;
    termine=true;
    const v=Math.max(+range.min,Math.min(+range.max,parseFloat(inp.value)||0));
    range.value=v;
    inp.remove();
    val.hidden=false;
    range.dispatchEvent(new Event('input',{bubbles:true}));
  };
  inp.addEventListener('blur',finish);
  inp.addEventListener('keydown',ev=>{
    if(ev.key==='Enter'){ev.preventDefault();finish();}
    if(ev.key==='Escape'){termine=true;inp.remove();val.hidden=false;}
  });
});

/* ---- Enregistrer et rouvrir un projet ----
   Le fichier retient la composition entière : pages, textes, réglages, cadrages,
   et le nom de chaque image. Les images elles-mêmes n'y sont pas — les embarquer
   donnerait un fichier de plusieurs centaines de mégaoctets, et elles sont déjà
   sur le disque. « Remettre les images » les recolle d'un coup, par nom de
   fichier, ce qui évite de les replacer une par une. */

function titreProjet(){
  const couverture=pages.find(isFullCover)||pages.find(isSingleCover)||pages[0];
  return safeName((couverture&&couverture.serie)||'ichka');
}
function serialiserProjet(){
  return {
    format:PROJET_FORMAT,
    version:PROJET_VERSION,
    enregistre:new Date().toISOString(),
    livre:{trimW:TRIM_W_MM,trimH:TRIM_H_MM,bleed:BLEED_MM,safe:KDP_SAFE_OUT_MM},
    reglages:{previewDock,uiMode,showPrintGuides,exportFormat,folioPosition,folioFont,folioX,folioY,folioColor},
    // Les adresses d'images sont temporaires : on garde la clé, vidée, pour que
    // la page rechargée conserve ses couleurs de fond au lieu de repasser au blanc.
    pages:pages.map(page=>{
      const copie={...page};
      CHAMPS_IMAGE.forEach(champ=>{copie[champ]='';});
      return copie;
    })
  };
}
let empreinteProjetDepart='';
function empreinteProjet(){
  try{return JSON.stringify(serialiserProjet().pages);}catch(e){return '';}
}
function projetModifie(){
  if(pages.some(page=>page.img||page.img2||page.topImg))return true;
  return !!empreinteProjetDepart&&empreinteProjet()!==empreinteProjetDepart;
}
function marquerProjetEnregistre(){
  empreinteProjetDepart=empreinteProjet();
}
function imagesAttendues(){
  let n=0;
  pages.forEach(page=>CHAMPS_IMAGE.forEach(champ=>{
    if(!page[champ]&&page[NOMS_IMAGE[champ]])n++;
  }));
  return n;
}
function renderRelinkItem(){
  const item=el('relinkItem');
  if(!item)return;
  const n=imagesAttendues();
  item.hidden=n===0;
  setText('relinkCount',n===1?'1 image attendue':n+' images attendues');
}
function enregistrerProjet(){
  const texte=JSON.stringify(serialiserProjet(),null,1);
  const blob=new Blob([texte],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const lien=document.createElement('a');
  lien.href=url;
  lien.download=titreProjet()+'-projet.json';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  marquerProjetEnregistre();
  const bouton=el('saveProject');
  if(bouton){
    const libelle=bouton.textContent;
    bouton.textContent='Enregistré ✓';
    setTimeout(()=>{bouton.textContent=libelle;},1600);
  }
}
function appliquerProjet(data){
  const nouvelles=Array.isArray(data.pages)?data.pages:[];
  if(!nouvelles.length){alert("Ce projet ne contient aucune page.");return;}
  [...new Set(pages.flatMap(page=>[page.img,page.img2,page.topImg]).filter(Boolean))]
    .forEach(url=>URL.revokeObjectURL(url));
  const livre=data.livre||{};
  const nombre=(valeur,min,max,defaut)=>{
    const v=parseFloat(valeur);
    return Number.isFinite(v)&&v>=min&&v<=max?v:defaut;
  };
  TRIM_W_MM=nombre(livre.trimW,80,400,TRIM_W_MM);
  TRIM_H_MM=nombre(livre.trimH,80,400,TRIM_H_MM);
  BLEED_MM=nombre(livre.bleed,0,10,BLEED_MM);
  KDP_SAFE_OUT_MM=nombre(livre.safe,0,25,KDP_SAFE_OUT_MM);
  const reglages=data.reglages||{};
  if(reglages.previewDock==='left'||reglages.previewDock==='right')previewDock=reglages.previewDock;
  if(reglages.uiMode==='simple'||reglages.uiMode==='advanced')uiMode=reglages.uiMode;
  if(typeof reglages.showPrintGuides==='boolean')showPrintGuides=reglages.showPrintGuides;
  if(reglages.exportFormat==='png'||reglages.exportFormat==='jpeg')exportFormat=reglages.exportFormat;
  if(['none','left','right','both'].includes(reglages.folioPosition))folioPosition=reglages.folioPosition;
  if(FOLIO_FONT_OPTIONS.some(o=>o[0]===reglages.folioFont))folioFont=reglages.folioFont;
  if(Number.isFinite(+reglages.folioX))folioX=Math.min(46,Math.max(4,+reglages.folioX));
  if(Number.isFinite(+reglages.folioY))folioY=Math.min(97,Math.max(3,+reglages.folioY));
  if(/^#[0-9a-f]{6}$/i.test(String(reglages.folioColor||'')))folioColor=reglages.folioColor;
  pages=nouvelles.map(page=>makePage(page));
  activeIndex=0;
  activeImageSlot='img';
  updateFormatUI();
  syncControls();
  refresh();
  marquerProjetEnregistre();
}
function ouvrirProjet(fichier){
  if(!fichier)return;
  const lecteur=new FileReader();
  lecteur.onload=()=>{
    let data=null;
    try{data=JSON.parse(String(lecteur.result));}catch(e){data=null;}
    if(!data||data.format!==PROJET_FORMAT){
      alert("Ce fichier n'est pas un projet ICHKA.");
      return;
    }
    if(projetModifie()&&!confirm("Ouvrir ce projet remplacera le livre en cours. Continuer ?"))return;
    appliquerProjet(data);
  };
  lecteur.onerror=()=>alert("Impossible de lire ce fichier.");
  lecteur.readAsText(fichier);
}
function remettreImages(fichiers){
  const parNom=new Map();
  [...fichiers].forEach(fichier=>parNom.set(fichier.name,fichier));
  let remises=0;
  pages.forEach(page=>{
    CHAMPS_IMAGE.forEach(champ=>{
      const nom=page[NOMS_IMAGE[champ]];
      if(page[champ]||!nom)return;
      const fichier=parNom.get(nom);
      if(!fichier)return;
      page[champ]=URL.createObjectURL(fichier);
      remises++;
    });
  });
  syncControls();
  refresh();
  const manquantes=imagesAttendues();
  const bouton=el('relinkImages');
  if(bouton){
    const libelle=bouton.textContent;
    bouton.textContent=remises?remises+' remise'+(remises>1?'s':'')+' ✓':'Aucune correspondance';
    setTimeout(()=>{bouton.textContent=libelle;},2200);
  }
  if(remises&&manquantes)alert(manquantes+" image(s) n'ont pas été retrouvées : leur nom de fichier a dû changer.");
}
onEl('saveProject','click',enregistrerProjet);
onEl('openProject','click',()=>el('projectFile')&&el('projectFile').click());
onEl('relinkImages','click',()=>el('imagesFile')&&el('imagesFile').click());
onEl('projectFile','change',e=>{
  ouvrirProjet(e.target.files&&e.target.files[0]);
  e.target.value='';
});
onEl('imagesFile','change',e=>{
  if(e.target.files&&e.target.files.length)remettreImages(e.target.files);
  e.target.value='';
});
// Filet minimal : prévenir avant de fermer quand il y a du travail en cours.
// Rien n'est enregistré tout seul, une fermeture par erreur perdrait tout.
window.addEventListener('beforeunload',e=>{
  if(!projetModifie())return;
  e.preventDefault();
  e.returnValue='';
});
marquerProjetEnregistre();
