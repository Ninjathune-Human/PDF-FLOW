# Atelier PDF — conventions

Contrat architectural persistant. À lire avant toute modification.

## Forme

Un seul fichier, `atelier-pdf.html` : HTML, CSS et JS en ligne, aucune étape de build, aucun npm. `index.html` n'est qu'un redirecteur pour GitHub Pages. `sw.js`, facultatif, ne sert que l'adresse publiée (pas `file://`) : il garde l'application, réseau d'abord, et les bibliothèques du CDN, cache d'abord, celles chargées à la demande à leur premier usage. Changer `CACHE` dans `sw.js` à chaque changement de version d'une bibliothèque ou de la liste `CORE`.

Bibliothèques chargées par CDN à l'exécution : pdf-lib 1.17.1 et pdf.js 3.11.174 en balise `<script>` UMD, qpdf-wasm et tesseract.js 5 par `import()` dynamique à la demande.

## Modèle de données

Tableau `pages[]`, un objet par page :

```
{ id, srcId, srcIndex, mediaBox, baseRotation, crop, blank, annots:[], rotation, ocr }
```

`mediaBox` porte en réalité la **CropBox** de la page, avec repli sur la MediaBox si elle est absente. C'est impératif : pdf.js rend la CropBox, et un modèle calé sur la MediaBox décale vignettes, recadrage et annotations sur tout PDF où les deux diffèrent, ce qui est courant sur les exports CAO.

`baseRotation` est la rotation déjà inscrite dans le fichier source. L'orientation affichée vaut `baseRotation + rotation`, et se calcule par `pageDeg(pg)`.

`sources` est une `Map(srcId → {bytes, jsdoc, libdoc})`, ce qui permet la fusion multi-fichiers. Toutes les transformations sont conservées en état et appliquées uniquement à l'export : le modèle est non destructif.

Une image ajoutée est convertie en PDF d'une page au moment de l'ajout, puis traitée comme n'importe quelle source. Aucune branche spécifique aux images en aval.

## Orientation

`renderPage()` force `rotation:0` : le repère de stockage est toujours celui de la page non tournée. L'affichage, lui, applique `pageDeg(pg)`.

- Grille : la vignette pivote, le conteneur intérieur échange ses dimensions pour ne pas déborder de sa case.
- Annotation : la scène entière pivote via un conteneur dédié, et `evtUV` ramène le pointeur dans le repère de stockage en annulant d'abord l'échelle du zoom, puis la rotation. L'ordre importe peu, la mise à l'échelle étant uniforme, mais l'oubli de l'échelle décale le tracé proportionnellement à la distance au centre.
- Recadrage : la modale affiche encore la page non tournée. Incohérence connue, non résolue.

Une annotation texte mémorise dans `rot` l'orientation d'affichage au moment de la saisie, et se dessine avec la rotation inverse autour de son ancre. Elle reste donc solidaire du papier. Les conventions d'angle s'inversent entre l'écran, en y vers le bas, et le format PDF, en y vers le haut : les décalages de ligne d'un texte multiligne doivent subir la même rotation que le texte, sans quoi les lignes s'empilent selon l'axe vertical de la page.

## Convention de coordonnées

Annotations, mots OCR et zones de rédaction sont stockés en coordonnées normalisées `u,v` de 0 à 1, relatives au `mediaBox` d'origine, en espace non tourné. `renderPage()` force systématiquement `rotation:0` : tous les outils interactifs travaillent dans ce repère canonique.

`pg.rotation` est un pur indicateur d'affichage (`/Rotate`), orthogonal aux coordonnées de contenu. Recadrer ou pivoter n'oblige jamais à recalculer les annotations.

## Chemins d'export

`buildPdf(list)` est la source unique : l'export complet et l'extraction d'une sélection l'appellent avec des listes différentes. La compression a son propre chemin, rasterisé.

`drawAnnots` et `drawOcrLayer` prennent un paramètre `offset` pour repositionner le contenu quand une page est rastérisée dans une page plus petite (compression, rédaction) par rapport à l'export normal. Un bug réel de positionnement sur des pages recadrées puis compressées a été corrigé à ce niveau.

Masque : un seul outil, noir ou blanc (blanc par défaut), destructif au niveau du pixel à l'export. L'ancien outil de correction (masque blanc cosmétique suivi d'un texte) a été retiré à la demande ; les annotations `white` déjà présentes restent rendues et exportées.

## Vue de l'éditeur d'annotation

Zoom et déplacement sont purement visuels, portés par une transformation sur la scène. Aucune coordonnée stockée n'est touchée. Le canevas est regénéré par pdf.js à la définition correspondant au zoom, avec temporisation, jeton d'annulation en cas de changement de page, et plafond à 4200 px de grand côté pour tenir dans la mémoire d'un iPad.

Les vignettes sont rendues au fil du défilement : `thumbIO`, un `IntersectionObserver` à un écran de marge, lance `renderThumb` à l'approche de chaque carte ; `renderGrid` le déconnecte avant de reconstruire, et `refreshCard` ignore une carte jamais affichée. Une vignette pas encore rendue n'a pas de `.thumbrot` : `paintFind` la marquera au rendu. Elles sont rendues sur-échantillonnées, taille de case multipliée par la densité d'écran : c'est la réduction opérée par le navigateur qui lisse les traits fins des plans.

## Apparence

Le mode clair est l'état par défaut. Le mode sombre s'active par l'attribut `data-theme="dark"` sur la racine, jamais par `prefers-color-scheme`. Le choix est mémorisé dans le stockage local, lecture et écriture enveloppées car certains contextes le refusent.

Les éléments posés sur le papier — poignées de recadrage, cadre de rognage, sélection d'annotation — utilisent `--paper-accent`, volontairement non redéfini en apparence sombre : une page PDF reste blanche.

## Interface : règles de conduite

**Pas de mode.** L'outil est un éditeur. Déverrouiller n'est pas un onglet mais une modale du menu Modifier, comme Reconnaissance de texte (menu Convertir) et Compresser. Barre : menu Modifier, bouton direct Éditer (`btnAnnot`, ouvre l'éditeur, pas de chevron puisqu'il ne déplie rien), menu Convertir. Ne pas réintroduire de sélecteur de mode.

**Jamais de boîte système.** `alert()` et `confirm()` sont proscrits. Tout message passe par `notify(message, {kind, action})` : zone discrète, non bloquante, annoncée aux lecteurs d'écran, au-dessus des modales. Chaque message d'erreur dit ce qui s'est passé et ce qu'il est possible de faire.

**Annuler plutôt que confirmer.** Une action réversible ne se confirme pas : elle s'exécute et `notify` propose « Annuler ». La suppression de pages prend un instantané de l'ordre et de la sélection ; les objets de page étant conservés par référence, l'annulation restitue tout, annotations et OCR compris. On ne confirme que l'irréversible.

**Historique de l'éditeur.** Toute modification d'annotation passe d'abord par `checkpoint()`, qui empile un instantané de `pg.annots` (pile `u`, rétablissements `r`, par page dans la `WeakMap` `anHist`, 100 pas). `cloneAnnot` copie les structures mais partage les chaînes : une image en data URL n'est jamais dupliquée. Une clé (`'w'+i`, `'s'+i`) regroupe les réglages continus d'un même objet en un seul pas, remise à zéro à l'évènement `change`. Déplacement et poignées : l'instantané est reconstruit au relâcher depuis `anDrag.orig`, et seulement s'il y a eu mouvement. Recadrage d'objet : instantané pris dans `startObjCrop`, empilé à la validation si le cadre a changé. Toute nouvelle commande qui modifie une annotation appelle `checkpoint()` avant.

**Toujours une issue.** Une commande lancée sans ce qu'elle requiert, une extraction sans sélection par exemple, affiche un message, jamais un silence. Un état vide porte l'action qui le remplit.

**Barres.** Trois hauteurs de commande, `--h-sm` 32 px, `--h-md` 36 px, `--h-lg` 44 px, portées à 40, 44 et 48 px au doigt. Texte de 14 px dans 36 px : c'est cette proportion qui rend les boutons justes. Deux graisses : 500 pour ce qui agit, 400 en gris pour ce qui étiquette.

**Échelle typographique.** Six crans d'interface, 11, 12, 13, 14, 15 et 17 px, en rem. Police Geist (variable, @fontsource-variable 5.3.0) pour tout ; Geist Mono réservée aux numéros de page, aux étiquettes en capitales et aux légendes numérotées. Les compteurs restent en Geist à chiffres tabulaires.

**Propriétés logiques.** `margin-inline-start` et consorts, jamais `margin-left`. Le fichier n'en contient plus aucune.

**Préférences système.** `prefers-reduced-transparency`, `prefers-contrast` et `prefers-reduced-motion` sont traités. Toute nouvelle surface en verre doit s'ajouter aux trois blocs.

**Raccourcis et saisie.** `typingInAnnot()` couvre tout champ de saisie (zone de texte, champ autre que bouton, case, curseur), pas une liste d'identifiants. Les flèches et Page précédente / suivante changent de page par `anGo`, sauf sur le curseur d'épaisseur. Un raccourci à touche unique s'efface dès que le focus est dans un champ, sinon il avale la frappe. `typingInAnnot()` sert de garde dans l'éditeur d'annotation.

## Recherche

Marquage des pages : `markFindCard` pose `data-find` (nombre d'occurrences) sur la carte, `grid.dataset.finding` estompe les autres ; `clearFindMarks` à chaque nouvelle recherche, `renderGrid` réapplique. Le filtre sélectionne : `selectFound` met la sélection sur les pages trouvées à la fin de chaque balayage (aucune si rien n'est trouvé), après avoir gardé la sélection d'avant dans `findSelBase` ; `restoreSelection` la rend quand le champ se vide. Une page trouvée et sélectionnée garde son jaune, la pastille noire dit la sélection. Dans l'éditeur, filtre de navigation : tant que `findHits` n'est pas vide, `anStep` ne mène qu'aux pages trouvées, `updateAnNav` compte parmi elles et teinte le sélecteur (`data-filter`). Occurrence courante : `findCur={pgId,h}` (h, l'objet même de `findHits`), remis à zéro par chaque recherche ; `occOf(pg)` donne les occurrences visibles dans la zone conservée, triées en ordre de lecture ; `stepOcc(back)`, appelé par Entrée et Maj + Entrée dans `anFindIn`, boucle sur les pages de l'éditeur et recentre la vue agrandie. `findPulse` fait rebondir les occurrences une seule fois, à l'arrivée sur la page ou au résultat d'une recherche, jamais à chaque rendu.

Les résultats vivent dans `findHits`, table indexée par identifiant de page, hors du modèle : ils ne partent jamais à l'export. Sources interrogées : couche de texte pdf.js, puis mots OCR. Position déduite au prorata des caractères dans chaque fragment. Un jeton d'annulation abandonne un balayage dès la frappe suivante. Les deux champs, grille et annotation, partagent un seul terme.

## Images

**Jamais d'URL d'objet.** Une image chargée depuis `createObjectURL` teinte le canevas quand la page est ouverte depuis le disque, dont l'origine est opaque, et `toDataURL` lève alors une erreur de sécurité. Lire par `FileReader` en data URL, via `readDataUrl` et `decodeImage`.

Une image insérée dans l'éditeur est une annotation de type `image`, stockée en data URL dans le modèle, réduite à 1600 px de grand côté, PNG conservé pour la transparence. Un JPEG ou un PNG déjà sous ce seuil est gardé tel quel. Comme le texte, elle mémorise l'orientation d'affichage à la pose. pdf-lib faisant pivoter autour de l'origine de dessin, l'origine change de coin selon le quart de tour : table dans `drawAnnots`, devenue asynchrone.

## Documents protégés

`currentBytes` conserve les octets du document ouvert. Indispensable : quand pdf.js refuse un PDF faute de mot de passe, aucune source n'est enregistrée, et le déverrouillage n'aurait rien à traiter.

## Ajout de pages

Un seul chemin de lecture, `fileToPdf` : image en page (`imageToPdfBytes`), Word composé par `WordConvert` (bêta), PDF tel quel. Il sert à l'accueil (`onFile`, le premier fichier déposé ouvre la session, les suivants passent par l'ajout), au dépôt sur un document ouvert, à Modifier › Ajouter et à Convertir › Document Word, qui appellent tous `addFiles`. Les échecs passent par `readFailMsg`.

En deux temps : chargement et prévisualisation, puis insertion des seules pages cochées, toutes cochées par défaut. Vignettes rendues séquentiellement. Les sources entièrement écartées sont retirées de `sources` à la fermeture.

## Conversion Word (bêta)

Module isolé `WordConvert`, repris tel quel de `docx-labo.html`, qui reste la page de référence pour mesurer la fidélité : toute évolution du moteur se fait d'abord dans le laboratoire, se mesure, puis se reporte.

**Principe.** Un .docx ne contient pas de pages. Plutôt que de recalculer la mise en page de Word, on relit ses notes : la balise `<w:lastRenderedPageBreak/>` marque où Word a coupé chaque page lors de son dernier enregistrement. docx-preview y coupe si `ignoreLastRenderedPageBreak:false`, contrairement à son réglage par défaut. Les erreurs de composition restent alors confinées à leur page au lieu de s'accumuler.

**Polices.** Chaque famille du document est redéclarée, via l'API FontFace, vers son jumeau métrique : Arimo pour Arial, Tinos pour Times, Carlito pour Calibri. Le navigateur compose ainsi avec exactement le fichier que le PDF intégrera. Format **WOFF uniquement** : le WOFF2 fait planter le sous-ensemblage de fontkit.

**Écriture.** Le navigateur compose, on relit la position de chaque mot par `Range.getClientRects`, et pdf-lib le réécrit en texte vectoriel. Jamais de rastérisation du HTML : elle teinte le canevas sous Safari. Images en data URL, `useBase64URL:true`.

**Pièges déjà rencontrés.**
- Les puces et numéros sont des pseudo-éléments `::before`, invisibles au parcours du texte. Leur contenu relu est **sérialisé** : une tabulation y vaut `\9`, à décoder par `cssUnescape`, sinon « -\ » chevauche le texte.
- Un mot coupé en fin de ligne : le tiret de césure n'existe pas dans le DOM, il faut le redessiner ; et le caractère suivant la coupure renvoie deux rectangles dont l'union le place entre deux lignes. `splitByLine` regroupe par ligne en ne gardant que le rectangle réel de chaque glyphe.
- La composition hors écran se fait par décalage, jamais par `visibility:hidden`, qui s'hérite et ferait ignorer tout le texte.
- docx-preview lit `window.JSZip` à son propre chargement : JSZip doit être chargé avant.

## Rituel de validation

Avant toute livraison, extraire le contenu du `<script type="module">` et lancer `node --check` dessus.

Les fonctions qui déclenchent un téléchargement (exporter, extraire, compresser, déverrouiller) ne fonctionnent pas dans un aperçu en bac à sable. Toujours tester depuis le fichier ouvert directement dans Safari.

Ne jamais deviner une API tierce. Les points d'API pdf-lib et tesseract.js sont vérifiés dans la documentation avant d'écrire le code.

## Système de design

Neutres zinc, une seule couleur d'action : l'encre. Les pages portent la couleur, l'interface reste en retrait.

Variables : `--bg`, `--surface`, `--subtle`, `--line`, `--line-strong`, `--ink`, `--ink-2`, `--muted`, `--faint`, `--primary` (encre, inversée en sombre), `--on-primary`, `--danger`, `--ok`, `--canvas` et `--dot` pour la table de travail, `--paper-accent` (bleu) pour tout ce qui se pose sur le papier. Les anciens noms (`--panel`, `--well`, `--accent`, `--warn`…) restent des alias.

- Commandes autonomes en capsule ; commandes imbriquées (menu, palette d'outils) en arrondi concentrique au conteneur : 14 = 8 + 6, 14 = 9 + 5
- Action principale : fond encre, texte clair. Secondaire : fond blanc, filet. Discrète : sans fond, survol gris
- Icônes au trait, grille 24, classe `.i`, trait de 1,5 px à l'écran quelle que soit la taille (`vector-effect:non-scaling-stroke`), `currentColor`
- Bordure en pointillés : convention « provisoire, éditable » (zone de dépôt, poignées, emplacement de dépose)
- Remplissage noir plein dans une icône : exclusif à la rédaction
- Vignettes : la page garde sa forme réelle, ombre portée par `drop-shadow` sur la case ; la sélection cerne la case, pas la page
- Éditeur d'annotation plein écran : en-tête, bande de propriétés, table de travail pointillée. La taille de la page se mesure sur la table (`clientWidth` moins les marges), jamais sur la fenêtre
- Copie de zone : l'état de `anClip`, et lui seul, décide. Vide = prélèvement (`clipsrc`), plein = pose (`clipdst`), quelle que soit la page ; la pose le vide. Rappeler l'outil ne le vide pas. `updateClipIcon` reflète l'état (classe `full`, miniature, infobulle), `flyToClip` et `flyFromClip` animent l'envol dans les deux sens via `clipFly`, élément volant toujours dimensionné côté page pour que liseré et arrondi restent fins
- Barre contextuelle : `#anShapes` (formes, l'icône `#anShapeTool` porte la forme courante dans `data-tool`), `#anSizeWrap` regroupe les options de texte (police `anFont`, `anBold`, `anItalic`, taille), `#anWWrap` l'épaisseur. Texte : familles `FONT_CSS` à l'écran, `FONT_STD` (polices standard pdf-lib) à l'export, intégrées une fois par document. Un appui sur une option ne retire pas le focus de la saisie
- Appui sur un objet avec un outil de tracé : `hitIndex` à l'appui ; au relâcher, moins de 5 px de déplacement = `selectHit`, sinon tracé normal. Texte et image sans fichier en attente décident dès l'appui
- Insertion d'un PDF par l'outil image : `importPdfObject` enregistre la source (`addSource`), le sélecteur de pages passe en choix unique (`openAddPicker(..., pick)`, classe `over`), `preparePdfPending` rend un aperçu transparent (`background` de pdf.js) ; la pose crée une annotation `clip` sur la page entière, d'où export vectoriel, poignées et recadrage hérités
- Recadrage d'objet, non destructif : l'objet garde son original (`src`, et `box0` pour une zone copiée) et un cadre `cr` normalisé dans l'image. En édition, `anObjCrop={pg,i,full,n}` : `full` est le rectangle de l'image entière sur la page, `n` le cadre dans `full` ; `cropView` affiche l'objet entier. `cropToImage` et `imageToCrop` passent du repère affiché à celui de l'image selon `rot`. Dans le cadre, le glisser déplace l'image dessous (le cadre reste). Validation : `data` redécoupée depuis `src`, `box` recalculé depuis `box0`, rectangle posé sur le cadre. Changer d'outil, de page, sortir, double-cliquer ou appuyer hors du cadre valide ; Échap annule
- Éditeurs (`#annotModal`, `#cropModal`) : `user-select:none` et `selectstart` annulé hors champs, sinon Safari iPad sélectionne le texte de l'interface pendant un glisser
- Poignées dessinées petites (`.an-h`, sans événement) doublées d'une prise invisible (`.an-hit`, porteuse de `data-h`), traits en `non-scaling-stroke`
- Poignées : `handlesOf` choisit le jeu (extrémités `p0`/`p1` pour trait et flèche, quatre coins pour le texte, huit points ailleurs), `resizeAnnot` applique : coins proportionnels pour image et zone copiée, libres pour le reste, mise à l'échelle des points pour les tracés, du corps pour le texte
- Surligneur : nuancier fluo `#anFluo` distinct, couleur `anHlColor`, opacité `HL_OPACITY` et mode produit partout (SVG, vignette, `BlendMode.Multiply` de pdf-lib)
- Infobulles : un seul élément `#tip`, en position fixe, géré par délégation. Tout bouton sans texte visible affiche `data-tip`, sinon `aria-label`. Pas d'attribut `title` sur ces boutons, il doublerait l'infobulle. Le doigt n'en déclenche aucune
- Au téléphone : menus en feuille basse, palette d'outils en bas, au pouce
- Le recadrage s'ouvre aussi depuis l'éditeur (bouton `anCrop`, hors des outils à mode) : même fenêtre, passée au-dessus par la classe `over`. Échap ne ferme que le recadrage (`stopImmediatePropagation`), et l'éditeur recharge sa page à la fermeture
- Mode d'emploi : tableau `HELP` (sections, fiches `t`, `d`, mots-clés `k`, `tool` pour le bouton Utiliser), panneau `#anHelpPanel`. Recherche `helpSearch` : normalisation sans accents, mots vides retirés, mot exact 3, début de mot 2, même racine 1,5, faute de frappe (distance de Damerau-Levenshtein 1, ou 2 au-delà de six lettres) 1, titre compté double. Toute nouvelle fonction de l'éditeur ajoute sa fiche, avec ses synonymes, et `MODE-EMPLOI.md` se régénère depuis `HELP`
- Double appui : `isDoubleTap` le reconnaît dans le `pointerdown` de la scène (moins de 400 ms, moins de 10 px), `doubleTap` valide un recadrage d'objet ou ouvre un texte en modification. Pas d'évènement `dblclick` sur la scène : le premier appui redessine l'objet sous le pointeur, et le navigateur ne l'émet plus
- Une fonction, une seule façon de l'appeler. Minimiser les boutons
