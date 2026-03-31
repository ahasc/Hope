import type { CharacterID, EventCard, ManiganceCard, ManiganceMechanicKey } from '@/store/types';

export interface CharacterDefinition {
  id: CharacterID;
  name: string;
  subtitle: string;
  lore: string;
  startingLivres: number;
  startingFaveurs: number;
  startingManigances: number;
  startingIntel: number;
  atout: string;
  faiblesse: string;
  style: string;
  color: string;
  intelAcquisition: string;
}

export const CHARACTERS: Record<CharacterID, CharacterDefinition> = {
  marchand: {
    id: 'marchand',
    name: 'Le Marchand',
    subtitle: 'Jean-Baptiste Tavernier',
    lore: 'Il a tout commencé. Marchand de gemmes français, il rapporta le diamant de l\'Inde.',
    startingLivres: 8,
    startingFaveurs: 1,
    startingManigances: 1,
    startingIntel: 1,
    atout: 'Peut déclencher une Enchère Forcée à tout moment — le détenteur doit mettre le Hope en vente immédiatement. Ne peut pas détenir plus de 2 Faveurs simultanément.',
    faiblesse: 'Pauvre en Faveurs. Ne peut pas contraindre les échanges, seulement les initier.',
    style: 'Agressif et économique. Le Hope est une marchandise — jusqu\'à ce qu\'il le garde trop longtemps.',
    color: 'text-amber-400',
    intelAcquisition: 'Achetez une Rumeur pour 3 Livres pendant le Marché Noir — votre réseau commercial vous ouvre des portes.',
  },
  aristocrate: {
    id: 'aristocrate',
    name: 'L\'Aristocrate',
    subtitle: 'La noblesse française et anglaise',
    lore: 'Ruinée à posséder le Hope. Le rang exige l\'ostentation, même au péril de tout.',
    startingLivres: 4,
    startingFaveurs: 3,
    startingManigances: 1,
    startingIntel: 1,
    atout: 'Immunisée contre le premier Événement Funeste qu\'elle subit. Son rang la protège — une fois.',
    faiblesse: 'Perd 2 points de Gloire si elle termine sans avoir détenu le Hope au moins deux tours consécutifs.',
    style: 'Défensif et orgueilleux. Doit posséder le diamant — mais sait qu\'elle ne peut pas le garder.',
    color: 'text-purple-400',
    intelAcquisition: 'Recevez un Secret à chaque fois que vous passez le Hope volontairement — vos négociations vous livrent des confidences.',
  },
  receleur: {
    id: 'receleur',
    name: 'Le Receleur',
    subtitle: 'Les marchands du marché noir',
    lore: 'Il a fait circuler le Hope après le vol de 1792. La discrétion est sa survie.',
    startingLivres: 3,
    startingFaveurs: 2,
    startingManigances: 3,
    startingIntel: 2,
    atout: 'Peut "cacher" le Hope un tour entier — il le détient en secret, échappe aux Événements ciblés. La Malédiction continue d\'accumuler.',
    faiblesse: 'Si sa dissimulation est découverte via un Secret, il subit immédiatement un Événement Funeste. Bonus +3 Gloire s\'il a dissimulé au moins une fois sans être détecté.',
    style: 'Furtif et calculateur. Sa dissimulation vaut cher sur le marché des Faveurs.',
    color: 'text-gray-400',
    intelAcquisition: 'Recevez un Secret à chaque fois que vous activez votre dissimulation — l\'ombre est propice aux confidences.',
  },
  journaliste: {
    id: 'journaliste',
    name: 'Le Journaliste',
    subtitle: 'La presse américaine des années 1900',
    lore: 'Il a popularisé et amplifié la légende de la malédiction. Il profite du malheur des autres.',
    startingLivres: 2,
    startingFaveurs: 1,
    startingManigances: 2,
    startingIntel: 4,
    atout: 'Gagne 2 points de Gloire chaque fois qu\'un Événement Funeste frappe un joueur dont il détient un Secret — une seule fois par victime sur l\'ensemble de la partie. Ne peut jamais détenir le Hope plus de 2 tours consécutifs.',
    faiblesse: 'Ne peut jamais détenir le Hope plus de deux tours consécutifs.',
    style: 'Informationnel et parasite. Il accumule les Secrets et attend que les autres s\'effondrent.',
    color: 'text-green-400',
    intelAcquisition: 'Recevez un nouveau Secret à chaque tour où vous ne détenez pas le Hope — vous enquêtez pendant que les autres s\'exposent.',
  },
  medium: {
    id: 'medium',
    name: 'La Médium',
    subtitle: 'Les diseuses de bonne aventure',
    lore: 'Elle voit ce qui vient. Mais voir l\'avenir ne signifie pas pouvoir l\'éviter.',
    startingLivres: 3,
    startingFaveurs: 2,
    startingManigances: 2,
    startingIntel: 1,
    atout: 'Au début de chaque tour, voit en secret la prochaine carte Événement Funeste. Peut vendre cette info ou l\'utiliser pour éviter d\'être victime.',
    faiblesse: 'Si elle détient le Hope quand un Événement se déclenche, ses visions s\'inversent — elle subit l\'Événement en double.',
    style: 'Informationnelle et imprévisible. Puissante mais sa faiblesse est spectaculaire.',
    color: 'text-cyan-400',
    intelAcquisition: 'Recevez un Secret sur le porteur du Hope à chaque Événement Funeste déclenché — la malédiction vous parle.',
  },
  heritier: {
    id: 'heritier',
    name: 'L\'Héritier Ruiné',
    subtitle: 'Les derniers Hope',
    lore: 'Vendus à leurs propres dettes. Rien à perdre — et tout à gagner, si le diamant tient sa promesse.',
    startingLivres: 0,
    startingFaveurs: 1,
    startingManigances: 1,
    startingIntel: 0,
    atout: 'Double Gloire chaque tour avec le Hope (2 au lieu de 1). Chaque Jeton Malédiction rapporte 1 Livre immédiatement. Seuil fixe à 3.',
    faiblesse: 'Seuil de Malédiction fixe à 3 (au lieu de 4-6). Pas de Carte Seuil Variable. Le plus volatil.',
    style: 'Tout ou rien. Explose le compteur ou s\'effondre en deux tours.',
    color: 'text-red-400',
    intelAcquisition: 'Héritez automatiquement des Secrets de chaque joueur éliminé — les morts vous confient leurs dossiers.',
  },
};

export const EVENT_CARDS: EventCard[] = [
  // Matériels (8)
  { id: 'ev01', category: 'materiel', title: 'Ruine Soudaine', effect: 'Le détenteur perd la moitié de ses Livres (arrondi à la hausse).', mechanicKey: 'RUINE_SOUDAINE' },
  { id: 'ev02', category: 'materiel', title: 'Scandale Public', effect: 'Le détenteur révèle toutes ses cartes Secret à tous les joueurs.', mechanicKey: 'SCANDALE_PUBLIC' },
  { id: 'ev03', category: 'materiel', title: 'Le Testament', effect: 'Toutes les Faveurs du détenteur sont redistribuées au hasard aux autres joueurs.', mechanicKey: 'TESTAMENT' },
  { id: 'ev04', category: 'materiel', title: 'La Rançon', effect: 'Chaque autre joueur peut exiger 1 Livre au détenteur — ou rien s\'il n\'en a pas.', mechanicKey: 'RANCON' },
  { id: 'ev05', category: 'materiel', title: 'Ruine Soudaine', effect: 'Le détenteur perd la moitié de ses Livres (arrondi à la hausse).', mechanicKey: 'RUINE_SOUDAINE' },
  { id: 'ev06', category: 'materiel', title: 'La Rançon', effect: 'Chaque autre joueur peut exiger 1 Livre au détenteur — ou rien s\'il n\'en a pas.', mechanicKey: 'RANCON' },
  { id: 'ev07', category: 'materiel', title: 'Scandale Public', effect: 'Le détenteur révèle toutes ses cartes Secret à tous les joueurs.', mechanicKey: 'SCANDALE_PUBLIC' },
  { id: 'ev08', category: 'materiel', title: 'Le Testament', effect: 'Toutes les Faveurs du détenteur sont redistribuées au hasard aux autres joueurs.', mechanicKey: 'TESTAMENT' },
  // Position (8)
  { id: 'ev09', category: 'position', title: 'Le Don Forcé', effect: 'Le détenteur doit transmettre le Hope à un joueur de son choix, sans contrepartie.', mechanicKey: 'DON_FORCE' },
  { id: 'ev10', category: 'position', title: 'L\'Obligation d\'Achat', effect: 'Un joueur désigné par le détenteur doit lui acheter le Hope — le détenteur fixe le prix.', mechanicKey: 'OBLIGATION_ACHAT' },
  { id: 'ev11', category: 'position', title: 'La Folie Passagère', effect: 'Le détenteur passe son prochain tour sans pouvoir jouer aucune action.', mechanicKey: 'FOLIE_PASSAGERE' },
  { id: 'ev12', category: 'position', title: 'Le Changement de Mains', effect: 'Le Hope est mis aux enchères immédiatement. Le plus offrant l\'emporte.', mechanicKey: 'CHANGEMENT_DE_MAINS' },
  { id: 'ev13', category: 'position', title: 'Le Don Forcé', effect: 'Le détenteur doit transmettre le Hope à un joueur de son choix, sans contrepartie.', mechanicKey: 'DON_FORCE' },
  { id: 'ev14', category: 'position', title: 'La Folie Passagère', effect: 'Le détenteur passe son prochain tour sans pouvoir jouer aucune action.', mechanicKey: 'FOLIE_PASSAGERE' },
  { id: 'ev15', category: 'position', title: 'L\'Obligation d\'Achat', effect: 'Un joueur désigné par le détenteur doit lui acheter le Hope — le détenteur fixe le prix.', mechanicKey: 'OBLIGATION_ACHAT' },
  { id: 'ev16', category: 'position', title: 'Le Changement de Mains', effect: 'Le Hope est mis aux enchères immédiatement. Le plus offrant l\'emporte.', mechanicKey: 'CHANGEMENT_DE_MAINS' },
  // Gloire (8)
  { id: 'ev17', category: 'gloire', title: 'La Mort Symbolique', effect: 'Le détenteur perd tous les points de Gloire accumulés ce tour (minimum 0).', mechanicKey: 'MORT_SYMBOLIQUE' },
  { id: 'ev18', category: 'gloire', title: 'La Disgrâce', effect: 'Le détenteur perd 2 points de Gloire permanents.', mechanicKey: 'DISGRACE' },
  { id: 'ev19', category: 'gloire', title: 'La Gloire Redistribuée', effect: 'Chaque autre joueur gagne 1 Gloire — prélevée sur le détenteur.', mechanicKey: 'GLOIRE_REDISTRIBUEE' },
  { id: 'ev20', category: 'gloire', title: 'La Gloire Gelée', effect: 'Les points de Gloire gagnés ce tour et le suivant ne comptent pas.', mechanicKey: 'GLOIRE_GELEE' },
  { id: 'ev21', category: 'gloire', title: 'La Disgrâce', effect: 'Le détenteur perd 2 points de Gloire permanents.', mechanicKey: 'DISGRACE' },
  { id: 'ev22', category: 'gloire', title: 'La Mort Symbolique', effect: 'Le détenteur perd tous les points de Gloire accumulés ce tour (minimum 0).', mechanicKey: 'MORT_SYMBOLIQUE' },
  { id: 'ev23', category: 'gloire', title: 'La Gloire Redistribuée', effect: 'Chaque autre joueur gagne 1 Gloire — prélevée sur le détenteur.', mechanicKey: 'GLOIRE_REDISTRIBUEE' },
  { id: 'ev24', category: 'gloire', title: 'La Gloire Gelée', effect: 'Les points de Gloire gagnés ce tour et le suivant ne comptent pas.', mechanicKey: 'GLOIRE_GELEE' },
];

type M = { id: string; title: string; effect: string; mechanicKey: ManiganceMechanicKey };
const m = (id: string, title: string, effect: string, mechanicKey: ManiganceMechanicKey): M => ({ id, title, effect, mechanicKey });

export const MANIGANCE_CARDS: ManiganceCard[] = [
  m('sc01', 'Chantage',              'Extorquez 2 Livres ou 1 Faveur à un joueur de votre choix sous peine de révélation publique.', 'CHANTAGE_TRANSFER'),
  m('sc02', 'Dénonciation',          'Révélez toutes les ressources d\'un joueur à tous les autres joueurs.',                         'SOCIAL'),
  m('sc03', 'Accusation',            'Accusez le Receleur. Si le Hope est caché, il subit un Événement Funeste immédiat.',            'SOCIAL'),
  m('sc04', 'Information Privilégiée','Regardez secrètement les 3 prochaines cartes Événement du deck.',                             'SOCIAL'),
  m('sc05', 'Fausse Piste',          'Désignez un joueur innocent comme "suspect" — il perd 1 Faveur sous pression sociale.',         'VOL_FAVEUR'),
  m('sc06', 'Lettre de Créance',     'Volez 1 Faveur à n\'importe quel joueur sans contrepartie.',                                   'VOL_FAVEUR'),
  m('sc07', 'Rumeur',                'Empêchez un joueur de participer à la prochaine Phase de Marché Noir.',                         'SOCIAL'),
  m('sc08', 'Témoignage',            'Annulez l\'effet d\'un Événement Funeste sur vous-même (une fois par partie).',                 'SOCIAL'),
  m('sc09', 'Complot',               'Formez une coalition secrète — vous et un allié êtes immunisés à la Phase de Legs ce tour.',    'SOCIAL'),
  m('sc10', 'Révélation',            'Révélez le Seuil Variable d\'un joueur de votre choix à tous.',                                'SOCIAL'),
  m('sc11', 'Chantage',              'Extorquez 2 Livres ou 1 Faveur à un joueur de votre choix sous peine de révélation publique.', 'CHANTAGE_TRANSFER'),
  m('sc12', 'Dénonciation',          'Révélez toutes les ressources d\'un joueur à tous les autres joueurs.',                         'SOCIAL'),
  m('sc13', 'Accusation',            'Accusez le Receleur. Si le Hope est caché, il subit un Événement Funeste immédiat.',            'SOCIAL'),
  m('sc14', 'Information Privilégiée','Regardez secrètement les 3 prochaines cartes Événement du deck.',                             'SOCIAL'),
  m('sc15', 'Lettre de Créance',     'Volez 1 Faveur à n\'importe quel joueur sans contrepartie.',                                   'VOL_FAVEUR'),
  m('sc16', 'Fausse Piste',          'Désignez un joueur innocent comme "suspect" — il perd 1 Faveur sous pression sociale.',         'VOL_FAVEUR'),
  m('sc17', 'Rumeur',                'Empêchez un joueur de participer à la prochaine Phase de Marché Noir.',                         'SOCIAL'),
  m('sc18', 'Témoignage',            'Annulez l\'effet d\'un Événement Funeste sur vous-même (une fois par partie).',                 'SOCIAL'),
  m('sc19', 'Complot',               'Formez une coalition secrète — vous et un allié êtes immunisés à la Phase de Legs ce tour.',    'SOCIAL'),
  m('sc20', 'Révélation',            'Révélez le Seuil Variable d\'un joueur de votre choix à tous.',                                'SOCIAL'),
  m('sc21', 'Chantage',              'Extorquez 2 Livres ou 1 Faveur à un joueur de votre choix sous peine de révélation publique.', 'CHANTAGE_TRANSFER'),
  m('sc22', 'Accusation',            'Accusez le Receleur. Si le Hope est caché, il subit un Événement Funeste immédiat.',            'SOCIAL'),
  m('sc23', 'Information Privilégiée','Regardez secrètement les 3 prochaines cartes Événement du deck.',                             'SOCIAL'),
  m('sc24', 'Lettre de Créance',     'Volez 1 Faveur à n\'importe quel joueur sans contrepartie.',                                   'VOL_FAVEUR'),
  m('sc25', 'Dénonciation',          'Révélez toutes les ressources d\'un joueur à tous les autres joueurs.',                         'SOCIAL'),
  m('sc26', 'Rumeur',                'Empêchez un joueur de participer à la prochaine Phase de Marché Noir.',                         'SOCIAL'),
  m('sc27', 'Témoignage',            'Annulez l\'effet d\'un Événement Funeste sur vous-même (une fois par partie).',                 'SOCIAL'),
  m('sc28', 'Complot',               'Formez une coalition secrète — vous et un allié êtes immunisés à la Phase de Legs ce tour.',    'SOCIAL'),
  m('sc29', 'Révélation',            'Révélez le Seuil Variable d\'un joueur de votre choix à tous.',                                'SOCIAL'),
  m('sc30', 'Fausse Piste',          'Désignez un joueur innocent comme "suspect" — il perd 1 Faveur sous pression sociale.',         'VOL_FAVEUR'),
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
