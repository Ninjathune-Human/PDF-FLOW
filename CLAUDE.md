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

Tampon de page (numérotation, filigrane, cartouche), PDF vers images, protection par mot de passe, changement de format de page, insertion d'image dans les annotations, métadonnées, superposition et comparaison d'indices, version embarquée hors-ligne.
