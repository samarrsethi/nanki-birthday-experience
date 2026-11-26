/**
 * content.js — Central configurable content for Harseerat (Nanki)
 * Replace any photograph path in /public/photos/ or edit letters/titles here.
 */
export const siteContent = {
  fullName: 'Harseerat',
  nickname: 'Nanki',
  birthdayDate: 'December 1',
  senderName: 'Samar',

  /* Optional background audio path (put an mp3 at public/music/our-song.mp3 or use built-in gentle ambient synth) */
  audioSrc: '/music/our-song.mp3',

  /* 15–20s Cinematic Introduction Sequence */
  introMontage: [
    { id: 1, photo: '/photos/photo2.jpg', ratio: 'aspect-[3/4]', caption: 'where it began', pauseMs: 1350, rot: -2.5 },
    { id: 2, photo: '/photos/photo3.jpg', ratio: 'aspect-[3/4]', caption: 'unscripted laughter', pauseMs: 950, rot: 2 },
    { id: 3, photo: '/photos/photo4.jpg', ratio: 'aspect-[3/4]', caption: 'the warmth you carry', pauseMs: 950, rot: -1.8 },
    { id: 4, photo: '/photos/photo5.jpg', ratio: 'aspect-[3/4]', caption: 'ordinary afternoons', pauseMs: 1450, rot: 1.5 },
    { id: 5, photo: '/photos/photo6.jpg', ratio: 'aspect-[4/3]', caption: 'quiet corners', pauseMs: 950, rot: -1.5 },
    { id: 6, photo: '/photos/photo7.jpg', ratio: 'aspect-[4/3]', caption: 'candid joy', pauseMs: 950, rot: 2.2 },
    { id: 7, photo: '/photos/photo8.jpg', ratio: 'aspect-[3/4]', caption: 'every little detail', pauseMs: 1500, rot: -1.2 },
    { id: 8, photo: '/photos/photo9.jpg', ratio: 'aspect-[3/4]', caption: 'always grateful', pauseMs: 950, rot: 1.8 },
    { id: 9, photo: '/photos/photo10.jpg', ratio: 'aspect-[4/3]', caption: 'december 1', pauseMs: 1100, rot: -1 },
    { id: 10, photo: '/photos/photo1.jpg', ratio: 'aspect-[9/16]', caption: 'happy birthday, harseerat', pauseMs: 2200, rot: 0, isHeroFinal: true },
  ],

  hero: {
    kicker: 'December 1 · For Harseerat',
    titleLine1: 'Happy Birthday,',
    titleLine2: 'Harseerat.',
    subtitle: 'A quiet keepsake for Nanki — celebrating who you are, the memories we lived, and what I needed to say honestly.',
    heroPhoto: '/photos/photo1.jpg',
    heroPhotoRatio: 'aspect-[9/16]',
  },

  /* Priority 3: Scroll-Illuminated Text */
  illuminatedStory: {
    eyebrow: '01 / WHO YOU ARE',
    text: 'Today is December 1st, and above everything else, today belongs to you, Harseerat. You have always carried a rare warmth—the kind of presence that turns ordinary afternoons into favorite memories, makes silences feel comfortable, and leaves every room gentler than you found it. Happy birthday, Nanki. You deserve calm mornings, effortless laughter, and people who value you with complete honesty.',
    photos: [
      { src: '/photos/photo11.jpg', ratio: 'aspect-[3/4]', label: 'A quiet portrait' },
      { src: '/photos/photo3.jpg', ratio: 'aspect-[3/4]', label: 'Candid warmth' },
    ],
  },

  marqueeWords: [
    'HAPPY BIRTHDAY HARSEERAT',
    'DECEMBER 1',
    'NANKI',
    'QUIET WARMTH',
    'CORE MEMORIES',
    'FOREVER GRATEFUL',
  ],

  /* Priority 5: Numbered Editorial Photographic Chapters */
  photoChapters: [
    {
      number: '01',
      total: '05',
      title: 'The First Spark',
      subtitle: 'Chapter One',
      description: 'Before inside jokes and late-night calls—just the quiet moment two worlds crossed and everything started feeling lighter.',
      photo: '/photos/photo2.jpg',
      ratio: 'aspect-[3/4]',
      note: 'Where our rhythm first began.',
    },
    {
      number: '02',
      total: '05',
      title: 'Hours Without Clocks',
      subtitle: 'Chapter Two',
      description: 'Talking at 2 AM about everything and nothing, letting the night slip past because neither of us wanted to hang up.',
      photo: '/photos/photo4.jpg',
      ratio: 'aspect-[3/4]',
      note: 'Time always moved differently with you.',
    },
    {
      number: '03',
      total: '05',
      title: 'Effortless Laughter',
      subtitle: 'Chapter Three',
      description: 'Your humor could turn the heaviest day completely around. Every candid frame with you still feels luminous.',
      photo: '/photos/photo7.jpg',
      ratio: 'aspect-[4/3]',
      note: 'The kind of joy you never forget.',
    },
    {
      number: '04',
      total: '05',
      title: 'Unplanned Detours',
      subtitle: 'Chapter Four',
      description: 'Coffee stops, drives with no destination, and the way you made ordinary places feel like somewhere special.',
      photo: '/photos/photo6.jpg',
      ratio: 'aspect-[4/3]',
      note: 'Every corner carried your warmth.',
    },
    {
      number: '05',
      total: '05',
      title: 'Wishing You Light',
      subtitle: 'Chapter Five',
      description: 'Wherever life takes you next, Nanki, I carry genuine gratitude for the days we shared and wish you only peace.',
      photo: '/photos/photo8.jpg',
      ratio: 'aspect-[3/4]',
      note: 'Always cheering for your happiness.',
    },
  ],

  /* Priority 4: Physical Love Letter Envelope + Full-Page Paper Extraction */
  loveLetter: {
    eyebrow: '03 / A LOVE LETTER',
    heading: 'What you meant to me.',
    salutation: 'Dear Harseerat,',
    openingLines: [
      'Before anything else, I wanted to write down how genuinely thankful I am for the love and warmth you brought into my life.',
      'Loving you was effortless. It lived in the smallest things—how your face lit up when you spoke about something you cared about, and how ordinary afternoons felt like my favorite days simply because you were there.',
    ],
    remainingParagraphs: [
      'You have a rare kindness and a softness that stays with people long after you leave the room. Being loved by you, sharing our inside jokes, and building a little world together is something I will always hold with deep gratitude.',
      'On your birthday, I hope you never forget how extraordinary you are. Thank you for every smile, every late-night conversation, and every moment of light you gave me.',
    ],
    signoff: 'With sincere gratitude, Samar',
  },

  /* Timeline Milestones (clean editorial layout, no @ symbols) */
  milestones: {
    eyebrow: '04 / OUR TIMELINE',
    heading: 'Steps along the way.',
    entries: [
      {
        label: 'Chapter I',
        title: 'Crossing Paths',
        subtitle: 'The Beginning',
        detail: 'Meeting you felt natural—like finding a quiet rhythm I did not know I was missing.',
      },
      {
        label: 'Chapter II',
        title: 'Building Our Little World',
        subtitle: 'Everyday Moments',
        detail: 'Shared playlists, late-night calls, coffee runs, and memories I still hold close.',
      },
      {
        label: 'Chapter III',
        title: 'Where I Failed You',
        subtitle: 'Honest Reflection',
        detail: 'I broke your trust when you only ever deserved honesty, loyalty, and care.',
      },
      {
        label: 'December 1',
        title: 'Today Is Yours',
        subtitle: 'Happy Birthday, Nanki',
        detail: 'A celebration of your life and an honest apology without asking for anything in return.',
      },
    ],
  },

  /* Priority 6: Editable Apology Letter (Muted Grey-Lilac Atmosphere) */
  apologyLetter: {
    eyebrow: '05 / A SINCERE APOLOGY',
    heading: 'Something I need to say properly.',
    salutation: 'Dear Nanki,',
    paragraphs: [
      'There is something I need to say plainly, without hiding behind vague words.',
      'I cheated on you.',
      'I betrayed your trust, and I hurt someone who trusted me completely. That was my choice, and I take full responsibility for it. You never deserved to be treated that way.',
      'I know that saying sorry cannot undo what I did. I cannot expect you to forget it, forgive me, or look at me the way you once did. I do not want to make excuses or turn my regret into something you have to carry.',
      'I am truly sorry, Harseerat—for breaking your trust, for the pain I caused you, and for failing to treat you with the honesty, faithfulness, and respect you deserved.',
      'I am not writing this to ask you to come back or to put any weight on your shoulders on your birthday. Whatever you feel, I respect it completely.',
      'Wherever life takes you from here, I genuinely hope this year brings you peace, laughter, and people who love you with the honesty and care you deserve.',
    ],
    closing: 'Happy birthday, Harseerat.',
    signoff: '— Samar',
  },
};
