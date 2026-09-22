# Atelier PDF — conventions

Contrat architectural persistant. À lire avant toute modification.

## Forme

Un seul fichier, `atelier-pdf.html` : HTML, CSS et JS en ligne, aucune étape de build, aucun npm. `index.html` n'est qu'un redirecteur pour GitHub Pages.

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

Rédaction et correction sont volontairement deux outils distincts, jamais fusionnés : la première est destructive au niveau du pixel, la seconde est un masque cosmétique réversible.

## Vue de l'éditeur d'annotation

Zoom et déplacement sont purement visuels, portés par une transformation sur la scène. Aucune coordonnée stockée n'est touchée. Le canevas est regénéré par pdf.js à la définition correspondant au zoom, avec temporisation, jeton d'annulation en cas de changement de page, et plafond à 4200 px de grand côté pour tenir dans la mémoire d'un iPad.

Les vignettes sont rendues sur-échantillonnées, taille de case multipliée par la densité d'écran : c'est la réduction opérée par le navigateur qui lisse les traits fins des plans.

## Apparence

Le mode clair est l'état par défaut. Le mode sombre s'active par l'attribut `data-theme="dark"` sur la racine, jamais par `prefers-color-scheme`. Le choix est mémorisé dans le stockage local, lecture et écriture enveloppées car certains contextes le refusent.

Les éléments posés sur le papier — poignées de recadrage, cadre de rognage, sélection d'annotation — utilisent `--paper-accent`, volontairement non redéfini en apparence sombre : une page PDF reste blanche.

## Interface : règles de conduite

**Pas de mode.** L'outil est un éditeur. Déverrouiller n'est pas un onglet mais une modale du menu Pages, comme Reconnaissance de texte et Compresser. Ne pas réintroduire de sélecteur de mode.

**Jamais de boîte système.** `alert()` et `confirm()` sont proscrits. Tout message passe par `notify(message, {kind, action})` : zone discrète, non bloquante, annoncée aux lecteurs d'écran, au-dessus des modales. Chaque message d'erreur dit ce qui s'est passé et ce qu'il est possible de faire.

**Annuler plutôt que confirmer.** Une action réversible ne se confirme pas : elle s'exécute et `notify` propose « Annuler ». La suppression de pages prend un instantané de l'ordre et de la sélection ; les objets de page étant conservés par référence, l'annulation restitue tout, annotations et OCR compris. On ne confirme que l'irréversible.

**Toujours une issue.** Une commande lancée sans ce qu'elle requiert, une extraction sans sélection par exemple, affiche un message, jamais un silence. Un état vide porte l'action qui le remplit.

**Barres.** Une seule hauteur par barre, via une variable locale, 36 px au pointeur fin et 44 px au doigt. Une seule taille de texte, 15 px. Deux graisses : 500 pour ce qui agit, 400 en gris pour ce qui étiquette.

**Échelle typographique.** Cinq crans d'interface, 11, 13, 14, 15 et 17 px, plus 20 px pour les titres de fenêtre. Tout en rem. Aucune taille intermédiaire.

**Propriétés logiques.** `margin-inline-start` et consorts, jamais `margin-left`. Le fichier n'en contient plus aucune.

**Préférences système.** `prefers-reduced-transparency`, `prefers-contrast` et `prefers-reduced-motion` sont traités. Toute nouvelle surface en verre doit s'ajouter aux trois blocs.

**Raccourcis et saisie.** Un raccourci à touche unique s'efface dès que le focus est dans un champ, sinon il avale la frappe. `typingInAnnot()` sert de garde dans l'éditeur d'annotation.

## Recherche

Les résultats vivent dans `findHits`, table indexée par identifiant de page, hors du modèle : ils ne partent jamais à l'export. Sources interrogées : couche de texte pdf.js, puis mots OCR. Position déduite au prorata des caractères dans chaque fragment. Un jeton d'annulation abandonne un balayage dès la frappe suivante. Les deux champs, grille et annotation, partagent un seul terme.

## Images

**Jamais d'URL d'objet.** Une image chargée depuis `createObjectURL` teinte le canevas quand la page est ouverte depuis le disque, dont l'origine est opaque, et `toDataURL` lève alors une erreur de sécurité. Lire par `FileReader` en data URL, via `readDataUrl` et `decodeImage`.

Une image insérée dans l'éditeur est une annotation de type `image`, stockée en data URL dans le modèle, réduite à 1600 px de grand côté, PNG conservé pour la transparence. Un JPEG ou un PNG déjà sous ce seuil est gardé tel quel. Comme le texte, elle mémorise l'orientation d'affichage à la pose. pdf-lib faisant pivoter autour de l'origine de dessin, l'origine change de coin selon le quart de tour : table dans `drawAnnots`, devenue asynchrone.

## Documents protégés

`currentBytes` conserve les octets du document ouvert. Indispensable : quand pdf.js refuse un PDF faute de mot de passe, aucune source n'est enregistrée, et le déverrouillage n'aurait rien à traiter.

## Ajout de pages

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

Variables CSS : `--surface`, `--panel`, `--well`, `--ink`, `--muted`, `--hair`, `--hair-strong`, `--accent` (#0E6B72), `--accent-deep`, `--accent-tint`, `--ok`, `--warn`.

- Cibles tactiles unifiées à 32 px
- Icônes au trait, épaisseur 1,4 à 1,6, `currentColor`, angles arrondis
- Bordure en pointillés : convention « provisoire, éditable » (poignées de recadrage, masquage, emplacement de dépose)
- Remplissage noir plein : exclusif à la rédaction
- Une fonction, une seule façon de l'appeler. Minimiser les boutons

## Piège CSS déjà rencontré

Un sélecteur d'ID (`#intake{display:block}`) a un jour écrasé silencieusement le `display:flex` d'une classe posée sur le même élément. Un ID l'emporte toujours sur une classe, quel que soit l'ordre dans la feuille. Vérifier ce type de collision si un flex ou une grille ne s'affiche pas comme prévu.

## Pistes ouvertes

Conversion Word : trames à motif, zones de texte, polices Cousine pour Courier New. Recadrage orienté comme le reste de l'interface. Rendu des vignettes au fil du défilement pour les longs documents.


Tampon de page (numérotation, filigrane, cartouche), PDF vers images, protection par mot de passe, changement de format de page, insertion d'image dans les annotations, métadonnées, superposition et comparaison d'indices, version embarquée hors-ligne.
