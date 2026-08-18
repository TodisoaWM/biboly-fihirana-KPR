CONTEXTE
--------
Crée une animation de chargement (loading) pour l'app mobile "Mofon'aina" —
une appli de lecture biblique quotidienne en malgache. Cette animation
s'affiche brièvement pendant le chargement de contenu (ex: ouverture d'un
chant, chargement d'un chapitre).

Charte graphique à respecter (voir document CHARTE_GRAPHIQUE_MOFONAINA.md en
référence) :
- Fond crème/blanc cassé (#FBF6EC)
- Accent jaune doré (#E3B341) et corail (#D85A30)
- Style illustré, traits fins, chaleureux — pas de rendu 3D réaliste ni glossy
- Cohérent avec des illustrations dessinées à la main, jamais austère

CONCEPT DE L'ANIMATION
-----------------------
Un livre (une Bible stylisée, pas besoin d'être identifiable comme "La
Bible" précisément — juste un livre ouvert) dont les pages se tournent en
boucle, comme si on le feuilletait doucement.

Détails attendus :
- Le livre est vu de face ou en légère perspective 3/4, fermé ou entrouvert
  au repos
- Une page se soulève et se tourne (mouvement de gauche à droite ou droite à
  gauche), révélant la page suivante, puis recommence en boucle infinie
- Couvertures du livre dans les tons de la charte (corail ou jaune doré),
  pages en blanc/crème
- Mouvement doux et fluide, pas saccadé — vitesse d'un tour de page toutes
  les 0,8 à 1,2 seconde environ
- Optionnel : un léger sous-titre discret sous l'animation type "Miandry..."
  (= "En attente...") en malgache, dans la police Fraunces, mais l'animation
  doit rester lisible sans texte si besoin

CONTRAINTES TECHNIQUES
-----------------------
- Format carré ou légèrement rectangulaire, pensé pour être affiché au
  centre d'un écran mobile (petite taille, ex: 120-160px de large maximum à
  l'usage final)
- Boucle parfaite (le dernier état de l'animation doit s'enchaîner sans
  saccade avec le premier)
- Cette version est une RÉFÉRENCE VISUELLE (HTML/CSS/SVG) pour une
  implémentation ultérieure en React Native avec react-native-reanimated —
  pas besoin de produire du code final, juste un rendu fidèle du mouvement,
  du timing et du style pour que l'animation puisse être fidèlement recréée
