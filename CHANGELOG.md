# Journal des évolutions

## 9 novembre 2026

### Refonte graphique

- Police Geist sur tous les appareils, Geist Mono pour les numéros de page et les étiquettes. Fini le repli sur Segoe UI sous Windows.
- Neutres zinc, action principale en encre, une seule couleur bleue réservée à ce qui se pose sur le papier.
- Boutons proportionnés au texte : 14 px dans 36 px au pointeur, 44 px au doigt. Capsules pour les commandes autonomes, arrondis concentriques dans les menus et la palette.
- Jeu d'icônes redessiné sur une grille unique, trait constant de 1,5 px.
- Page d'accueil : titre « Atelier PDF », une phrase, zone de dépôt en pointillés, légende numérotée des fonctions sur une trame de dessin.
- Largeur iPad portrait : menus sur un rang, recherche, Compresser et Exporter sur le second ; plus de bouton renvoyé seul à la ligne.
- Vignettes à la forme réelle de la page, paysage compris ; numérotation 01, 02… ; pastille de cumul discrète au repos.
- Éditeur d'annotation plein écran : en-tête avec navigation de page, bande de propriétés, palette d'outils groupée avec info-bulles, table de travail pointillée. La page se dimensionne sur la place réellement disponible.
- Au téléphone : menus en feuille basse, Compresser en icône, palette d'outils au pouce.

### Nouveautés

- Menus Modifier et Ajuster fusionnés en un menu **Éditer** : ajout, page blanche, extraction, puis recadrage et marges, puis déverrouillage.
- **Recadrer depuis l'éditeur d'annotation** : bouton dans la palette, même fenêtre de recadrage, la page se recharge recadrée.
- **Surligneur fluo** : quatre teintes propres, jaune, vert, magenta, bleu, mémorisées à part des couleurs d'encre. Encre en mode produit, opacité 0,6, à l'écran, sur les vignettes et à l'export : le texte dessous reste noir. Nouvelle icône de marqueur à nez biseauté.
- **Barre contextuelle** : une seule icône « Formes » dans la palette ; la barre propose rectangle, ellipse, flèche et trait, l'icône garde la dernière forme choisie. L'outil Texte y affiche police (sans empattement, avec empattements, chasse fixe), taille, gras et italique, applicables à la saisie en cours ou au texte sélectionné ; l'export utilise les polices standard du PDF correspondantes. L'épaisseur n'apparaît que pour les tracés et les formes.
- **Appui simple sur un objet = sélection**, quel que soit l'outil : l'éditeur passe en sélection, poignées visibles. Un glisser continue de tracer, même s'il part d'un objet existant.
- **Masque noir ou blanc** : l'outil de rédaction, renommé Masque, propose ses deux teintes dans la barre des couleurs, blanc par défaut. Le masque blanc reste repéré par un liseré pointillé dans l'éditeur ; à l'export, l'un comme l'autre efface réellement le contenu. L'outil « Corriger le texte » (masque blanc et texte) est supprimé : un masque blanc puis l'outil Texte font la même chose.
- **Insérer un PDF comme objet** : l'outil d'insertion d'image accepte aussi les PDF. Une page, elle est prête à poser ; plusieurs, une fenêtre propose de choisir laquelle. La page posée reste vectorielle à l'export, sans fond ajouté, et se déplace, se redimensionne et se recadre comme une zone copiée.
- **Recadrer un objet**, selon les usages de Photoshop et d'Office : dans l'éditeur, une image ou une zone copiée sélectionnée se recadre par le bouton Recadrer. Équerres aux coins et barrettes aux côtés, partie masquée voilée, tiers affichés pendant le réglage, image glissable sous le cadre. Entrée, double-clic, Valider ou appui hors du cadre pour appliquer, Échap pour annuler. Non destructif : rouvrir le recadrage montre l'image entière et permet de rendre ce qui avait été retiré. Une zone copiée reste vectorielle à l'export. Sans sélection, le bouton recadre la page.
- **Copie de zone, icône dynamique** : l'icône est un réceptacle. Vide, cadre pointillé, le tracé copie ; la zone copiée s'envole vers l'icône et s'y affiche en miniature. Pleine, le tracé colle, sur la même page ou une autre : la zone sort de l'icône et vient prendre place dans le cadre tracé, l'icône se vide et redevient disponible. Auparavant l'outil reposait toujours la première zone copiée.
- **Poignées affinées** : disque blanc de 8 px cerclé de bleu, posé sur un cadre de sélection continu d'un pixel, à l'écran comme au zoom. La zone de prise, invisible, reste large au doigt et au Pencil. Même traitement dans la fenêtre de recadrage de page.
- **Poignées de forme sur tout objet sélectionné** : huit poignées pour rectangles, ellipses, masquages, rédactions, tracés, images et zones copiées ; deux extrémités pour les flèches ; quatre coins pour un texte, qui en changent la taille.
- **Infobulles** sur tous les boutons à icône, dans l'application comme dans l'éditeur : souris, trackpad, survol du Pencil, focus clavier. Jamais rognées par leur conteneur.
- Éditeur : un appui sur la table, hors de la page, rend l'outil de sélection. L'outil « Déplacer la vue » disparaît : la sélection déplace les éléments, et la vue se déplace en glissant une zone vide quand la page est agrandie, à deux doigts, à la molette, ou espace maintenu.
- Dépôt d'un PDF sur le document ouvert : choix des pages, ajout à la suite.
- Copie d'une zone vers une autre page, vectorielle, redimensionnable par les coins (proportions gardées) ou par les côtés.
- Sélection exclusive au clic, cumul par la pastille ronde, suppression confirmée puis annulable. Plus de bouton de suppression sur chaque vignette.
- Une page recadrée s'ouvre recadrée dans l'éditeur ; vignettes et zones copiées rendues plus nettes.

### Corrections

- iPad : glisser dans l'éditeur, au doigt ou au Pencil, déclenchait une sélection de texte qui surlignait « 100 % » et une partie de l'écran. Plus aucun texte d'interface ne se sélectionne dans les éditeurs ; les champs restent éditables.
- Désélectionner, Supprimer les pages et le champ Taille restaient visibles malgré l'attribut `hidden` : la règle `[hidden]` est désormais prioritaire partout.

## 22 septembre 2026

### Nouveautés

- **Conversion de documents Word, en bêta.** Nouveau menu Convertir. Un .docx est composé sur l'appareil avec des polices à métrique identique à celles de Word, coupé aux endroits où Word a coupé les pages, puis réécrit en PDF vectoriel au texte sélectionnable et interrogeable. Les pages converties passent par la fenêtre de choix avant insertion, avec un avertissement listant les éléments approchés.
- **Laboratoire de conversion**, `docx-labo.html` : page autonome qui mesure la fidélité d'une conversion, nombre de pages, débordement, écart de largeur, polices substituées.

### Interface

- Menu « Pages » renommé « Modifier ». Ajouter, insérer et extraire forment une section, Déverrouiller une autre.

### Corrections

- La zone de messages restait affichée vide en permanence : une règle d'affichage neutralisait l'attribut `hidden`.

## 21 septembre 2026

### Nouveautés

- **Recherche plein texte.** Champ dans la barre d'outils et dans l'éditeur d'annotation, synchronisés. Interroge la couche de texte et les mots OCR, surligne en jaune sur les vignettes et dans l'éditeur, sans rien écrire dans le document. Signale quand un document n'a aucun texte et suggère l'OCR.
- **Images dans l'éditeur d'annotation.** Nouvel outil : choix du fichier, tracé de l'emplacement, rapport d'origine conservé, retour automatique à la sélection après la pose.
- **Ajout de pages prévisualisé.** Les fichiers choisis s'affichent en vignettes, on coche les pages à insérer.
- **Suppression au clavier**, Suppr ou Retour arrière, et **annulation** de toute suppression.

### Interface

- Barre d'outils : Pages, Ajuster, Annoter, Rechercher, puis Compresser et Exporter. Le sélecteur Éditer / Déverrouiller disparaît : Déverrouiller devient une commande du menu Pages, en fenêtre.
- Rotations déplacées dans la barre de sélection, icônes redessinées avec une pointe tangente à l'arc.
- Extraction déplacée dans le menu Pages.
- « Effacer » renommé « Désélectionner », menu « Contenu » renommé « Annoter ».
- Barre de l'éditeur d'annotation normalisée : une hauteur, une taille de texte, deux graisses.

### Conformité aux HIG d'Apple

- Préférences système de transparence réduite et de contraste renforcé prises en compte.
- Plus aucune boîte de dialogue système : messages discrets, non bloquants, annoncés aux lecteurs d'écran, proposant toujours une issue.
- Tenue de la mise en page à taille de texte doublée.
- Échelle typographique ramenée à cinq crans, plancher à 11 px.
- Propriétés CSS logiques uniquement.
- Mention exacte du téléchargement des bibliothèques au premier chargement.

### Corrections

- Le déverrouillage d'un PDF protégé à l'ouverture ne pouvait pas aboutir : les octets du document sont désormais conservés.
- L'import d'image échouait sur une page ouverte depuis le disque, par teintage du canevas.
- Le double-clic enfermait l'éditeur d'annotation sur une seule page.
- Le curseur se décalait du tracé une fois zoomé.
