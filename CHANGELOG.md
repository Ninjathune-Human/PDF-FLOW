# Journal des évolutions

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
