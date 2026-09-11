<p align="center">
  <img src="banner.svg" alt="Atelier PDF" width="100%">
</p>

# Atelier PDF

Outil de manipulation de PDF en un seul fichier HTML. Aucune installation, aucun compte, aucun serveur : tout le traitement se fait dans le navigateur, aucun fichier ni mot de passe ne transite par le réseau.

Application : https://ninjathune-human.github.io/atelier-pdf/

## Fonctions

| Fonction | Détail |
|---|---|
| Déverrouiller | Retire un mot de passe connu ou des restrictions de permissions (qpdf-wasm) |
| Organiser | Sélection, suppression, réorganisation des pages par glisser-déposer, fusion multi-fichiers |
| Ajouter | Pages d'un autre PDF, page blanche, images (JPEG, PNG, HEIC, WebP) converties en pages |
| Extraire | Sort la sélection courante dans un fichier séparé, sans altérer le document de travail |
| Recadrer | Rectangle ajustable, détection automatique du contenu, page par page ou par lot |
| Pivoter | ±90°, par page ou par lot |
| Supprimer les marges | Détection du contenu, marge conservée réglable, annulation à bascule |
| Annoter | Stylo, surligneur, rectangle, ellipse, flèche, texte, correction par masquage. Vectoriel à l'export |
| Rédiger | Suppression réellement destructive : la zone est peinte au niveau du pixel avant réencodage |
| OCR | Français, anglais ou les deux. Couche de texte invisible calée sur les mots détectés |
| Compresser | Trois préréglages, rastérisation et réencodage JPEG |
| Exporter | Vectoriel préservé, sauf sur les pages contenant une rédaction |

Le modèle est non destructif : recadrage, rotation, annotations, rédaction et OCR sont conservés en état et appliqués uniquement à l'export.

## Usage

Ouvrir `atelier-pdf.html` dans un navigateur, ou passer par le lien ci-dessus. Conçu pour PC, iPad et iPhone, avec prise en charge du tactile et du stylet.

## Dépendances

Chargées par CDN à l'exécution, pas de build :

- [pdf-lib](https://pdf-lib.js.org/) 1.17.1, mutation des pages et dessin vectoriel
- [pdf.js](https://mozilla.github.io/pdf.js/) 3.11.174, rendu des pages en canvas
- [qpdf-wasm](https://github.com/neslinesli93/qpdf-wasm), déverrouillage, chargé à la demande
- [tesseract.js](https://tesseract.projectnaptha.com/) 5, OCR, chargé au premier usage

Une connexion est donc nécessaire au premier chargement. Une version entièrement embarquée hors-ligne est une piste ouverte.

## Limites connues

- Le déverrouillage suppose un mot de passe connu. Aucune tentative par force brute n'est possible ni prévue.
- La compression transforme le texte natif en image : il n'est plus sélectionnable dans le fichier compressé.
- Les images ne peuvent pas encore ouvrir une session vide, un PDF de départ est requis.

## Licence

À définir.
