export const REVIEW_SEED_PREFIX = 'REVIEW SEED — ';

export const LAUNCH_SEED_CONFIRMATION = '--confirm-review-seed';

export type LaunchAssetKey =
  | 'bibleJournal'
  | 'carePackages'
  | 'coffeeMeetup'
  | 'communityGathering'
  | 'worshipGathering';

export type LaunchAsset = {
  alternativeText: string;
  caption: string;
  fileName: string;
};

export type LaunchCollectionEntry = {
  data: Record<string, unknown>;
  image: LaunchAssetKey;
  slug: string;
};

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ type: 'text', text }],
});

const heading = (text: string) => ({
  type: 'heading',
  level: 2,
  children: [{ type: 'text', text }],
});

const reviewSeo = (metaTitle: string, metaDescription: string) => ({
  metaTitle,
  metaDescription,
  noIndex: true,
});

export const launchAssets: Record<LaunchAssetKey, LaunchAsset> = {
  bibleJournal: {
    fileName: 'review-bible-journal.webp',
    alternativeText:
      'Editorial illustration of an open Bible, a journal, and a pen in soft morning light.',
    caption:
      'Generated review placeholder. Replace or approve before publication.',
  },
  carePackages: {
    fileName: 'review-care-packages.webp',
    alternativeText:
      'Editorial illustration of young adults preparing practical care packages together.',
    caption:
      'Generated review placeholder. Replace or approve before publication.',
  },
  coffeeMeetup: {
    fileName: 'review-coffee-meetup.webp',
    alternativeText:
      'Editorial illustration of young adults talking together around a coffee-shop table.',
    caption:
      'Generated review placeholder. Replace or approve before publication.',
  },
  communityGathering: {
    fileName: 'review-community-gathering.webp',
    alternativeText:
      'Editorial illustration of young adults connecting in small groups in a bright community hall.',
    caption:
      'Generated review placeholder. Replace or approve before publication.',
  },
  worshipGathering: {
    fileName: 'review-worship-gathering.webp',
    alternativeText:
      'Editorial illustration of a youth worship gathering viewed from the back of the room.',
    caption:
      'Generated review placeholder. Replace or approve before publication.',
  },
};

export const launchTaxonomy = {
  author: {
    slug: 'jerusalem-youth-editorial-team',
    data: {
      displayName: 'Jerusalem Youth Editorial Team',
      slug: 'jerusalem-youth-editorial-team',
      bio: 'Review seed author for launch preparation. Confirm the responsible ministry author before publishing.',
    },
  },
  categories: [
    {
      slug: 'devotionals',
      data: {
        name: 'Devotionals',
        slug: 'devotionals',
        description: 'Bible-centered reflections for everyday faith.',
      },
    },
    {
      slug: 'community',
      data: {
        name: 'Community',
        slug: 'community',
        description: 'Gatherings, relationships, and life together.',
      },
    },
    {
      slug: 'faith-in-practice',
      data: {
        name: 'Faith in Practice',
        slug: 'faith-in-practice',
        description: 'Practical ways to live out faith with courage and care.',
      },
    },
    {
      slug: 'resources',
      data: {
        name: 'Resources',
        slug: 'resources',
        description: 'Helpful tools for learning, reflection, and small groups.',
      },
    },
  ],
  series: {
    slug: 'foundations-for-everyday-faith',
    data: {
      name: 'Foundations for Everyday Faith',
      slug: 'foundations-for-everyday-faith',
      description:
        'Review seed series. Replace the title and description with an approved sermon series before publishing.',
    },
  },
} as const;

export const launchSingles = {
  siteSetting: {
    siteName: 'Jerusalem Youth',
    siteDescription:
      'Review seed: a welcoming youth ministry community growing in faith, friendship, and service.',
    defaultSeo: reviewSeo(
      'Jerusalem Youth',
      'Review seed for the Jerusalem Youth ministry website. Replace this description and approve indexing before launch.',
    ),
    organizationContact: {
      address: '99 Trương Đăng Quế, phường Hạnh Thông, Gò Vấp',
    },
    primaryCta: {
      label: 'Join Jerusalem Youth',
      url: '/join',
    },
    footerContent: [
      paragraph(
        'Review seed: Jerusalem Youth is a place to grow in faith, build honest friendships, and serve our community together.',
      ),
    ],
  },
  aboutPage: {
    vision:
      'Review seed: to see young people rooted in the love of God and living with hope, courage, and generosity.',
    mission:
      'Review seed: Jerusalem Youth creates welcoming spaces to worship, learn Scripture, build healthy community, and serve others.',
    values: [
      {
        title: 'Rooted in Jesus',
        description:
          'Review seed: we center our life together on Jesus and keep learning from Scripture.',
      },
      {
        title: 'Honest Community',
        description:
          'Review seed: we make room for real questions, patient listening, and friendships that help us grow.',
      },
      {
        title: 'Faith in Action',
        description:
          'Review seed: we practice generosity and serve our neighbors with humility and consistency.',
      },
    ],
    primaryCta: {
      label: 'Plan your first visit',
      url: '/join',
    },
  },
  navigation: {
    primaryItems: [
      { label: 'About', url: '/about', openInNewTab: false },
      { label: 'Events', url: '/events', openInNewTab: false },
      { label: 'Articles', url: '/articles', openInNewTab: false },
      { label: 'Sermons', url: '/sermons', openInNewTab: false },
      { label: 'Stories', url: '/stories', openInNewTab: false },
      { label: 'Resources', url: '/resources', openInNewTab: false },
    ],
    utilityItems: [
      { label: 'Search', url: '/search', openInNewTab: false },
      { label: 'Join us', url: '/join', openInNewTab: false },
    ],
    footerItems: [
      { label: 'Media', url: '/media', openInNewTab: false },
      { label: 'Contact', url: '/contact', openInNewTab: false },
    ],
  },
  socialLinks: {
    links: [
      {
        platform: 'Facebook',
        url: 'https://www.facebook.com/jerusalemyouth20',
        displayOrder: 1,
      },
    ],
  },
} as const;

export const launchArticles: readonly LaunchCollectionEntry[] = [
  {
    slug: 'review-a-simple-rhythm-for-meeting-god-each-day',
    image: 'bibleJournal',
    data: {
      title: `${REVIEW_SEED_PREFIX}A Simple Rhythm for Meeting God Each Day`,
      slug: 'review-a-simple-rhythm-for-meeting-god-each-day',
      excerpt:
        'Review seed: a gentle starting point for prayer, Scripture, and honest reflection in an ordinary week.',
      body: [
        paragraph(
          'Review seed — replace or approve before publishing. A daily rhythm does not need to be long or impressive. Begin with a few quiet minutes, a short passage of Scripture, and an honest prayer about what is in front of you today.',
        ),
        heading('Start small and stay present'),
        paragraph(
          'Choose a repeatable time and place. Read slowly, notice one phrase, and write one response in a journal. Consistency grows more naturally when the practice is simple enough to return to.',
        ),
        paragraph(
          'Close by naming one person or situation you want to carry in prayer. The goal is not to complete a task but to become more attentive to God throughout the day.',
        ),
      ],
      tags: [{ name: 'Daily faith' }, { name: 'Prayer' }],
      bibleReferences: [{ reference: 'Psalm 119:105' }],
      featured: true,
      seo: reviewSeo(
        'A Simple Daily Faith Rhythm | Review Seed',
        'Review-only devotional seed about building a simple rhythm of Scripture, prayer, and reflection.',
      ),
      categorySlug: 'devotionals',
    },
  },
  {
    slug: 'review-how-to-pray-when-words-are-hard',
    image: 'bibleJournal',
    data: {
      title: `${REVIEW_SEED_PREFIX}How to Pray When Words Are Hard`,
      slug: 'review-how-to-pray-when-words-are-hard',
      excerpt:
        'Review seed: practical ways to begin praying when you feel distracted, tired, or unsure what to say.',
      body: [
        paragraph(
          'Review seed — replace or approve before publishing. Prayer can begin with honesty. You do not need polished language; you can tell God what you are grateful for, what hurts, and what help you need.',
        ),
        heading('Use a simple pattern'),
        paragraph(
          'Pause, breathe, and name what is true. Thank God for one gift, ask for one need, and remember one other person. A short prayer offered sincerely is enough for today.',
        ),
      ],
      tags: [{ name: 'Prayer' }, { name: 'Encouragement' }],
      bibleReferences: [{ reference: 'Romans 8:26' }],
      featured: false,
      seo: reviewSeo(
        'How to Pray When Words Are Hard | Review Seed',
        'Review-only devotional seed with a simple pattern for honest prayer.',
      ),
      categorySlug: 'devotionals',
    },
  },
  {
    slug: 'review-why-community-matters',
    image: 'communityGathering',
    data: {
      title: `${REVIEW_SEED_PREFIX}Why Community Matters`,
      slug: 'review-why-community-matters',
      excerpt:
        'Review seed: healthy community gives us room to be known, encouraged, challenged, and supported.',
      body: [
        paragraph(
          'Review seed — replace or approve before publishing. Community is more than sharing a room. It grows when people listen carefully, keep showing up, and make space for one another to be honest.',
        ),
        heading('Choose one next step'),
        paragraph(
          'Learn someone’s name, invite a new person into the conversation, or ask a question and listen without rushing to answer. Small acts of welcome shape the kind of community everyone can belong to.',
        ),
      ],
      tags: [{ name: 'Community' }, { name: 'Belonging' }],
      bibleReferences: [{ reference: 'Hebrews 10:24–25' }],
      featured: true,
      seo: reviewSeo(
        'Why Community Matters | Review Seed',
        'Review-only article seed about belonging, encouragement, and healthy community.',
      ),
      categorySlug: 'community',
    },
  },
  {
    slug: 'review-faith-in-ordinary-decisions',
    image: 'coffeeMeetup',
    data: {
      title: `${REVIEW_SEED_PREFIX}Faith in Ordinary Decisions`,
      slug: 'review-faith-in-ordinary-decisions',
      excerpt:
        'Review seed: a framework for bringing wisdom, prayer, and trusted community into everyday choices.',
      body: [
        paragraph(
          'Review seed — replace or approve before publishing. Many meaningful choices arrive without dramatic signs. Wisdom often grows through Scripture, prayer, honest motives, and counsel from people who know us well.',
        ),
        heading('Ask better questions'),
        paragraph(
          'Does this choice help me love God and people well? Am I acting from fear, pride, or patient wisdom? What might a trusted mentor notice that I cannot see yet?',
        ),
      ],
      tags: [{ name: 'Wisdom' }, { name: 'Everyday faith' }],
      bibleReferences: [{ reference: 'James 1:5' }],
      featured: false,
      seo: reviewSeo(
        'Faith in Ordinary Decisions | Review Seed',
        'Review-only article seed about seeking wisdom for everyday decisions.',
      ),
      categorySlug: 'faith-in-practice',
    },
  },
  {
    slug: 'review-making-space-to-listen',
    image: 'bibleJournal',
    data: {
      title: `${REVIEW_SEED_PREFIX}Making Space to Listen`,
      slug: 'review-making-space-to-listen',
      excerpt:
        'Review seed: simple practices that help us listen to God, to others, and to what is happening within us.',
      body: [
        paragraph(
          'Review seed — replace or approve before publishing. Listening begins by slowing down enough to notice. Put away one distraction, read a short passage twice, and leave a little silence before deciding what it means for today.',
        ),
        heading('Listen with care'),
        paragraph(
          'The same patience helps in conversation. Ask a clear question, resist preparing your response, and reflect back what you heard. Attentive listening can become a practical form of love.',
        ),
      ],
      tags: [{ name: 'Listening' }, { name: 'Spiritual practices' }],
      bibleReferences: [{ reference: 'James 1:19' }],
      featured: false,
      seo: reviewSeo(
        'Making Space to Listen | Review Seed',
        'Review-only devotional seed about listening with patience and attention.',
      ),
      categorySlug: 'devotionals',
    },
  },
  {
    slug: 'review-serving-with-what-you-have',
    image: 'carePackages',
    data: {
      title: `${REVIEW_SEED_PREFIX}Serving with What You Have`,
      slug: 'review-serving-with-what-you-have',
      excerpt:
        'Review seed: service can begin with ordinary time, attention, skills, and a willingness to help.',
      body: [
        paragraph(
          'Review seed — replace or approve before publishing. You do not need a perfect plan to serve someone well. Begin by noticing a real need and asking what would be helpful rather than assuming.',
        ),
        heading('Make care practical'),
        paragraph(
          'Offer a skill, share time, prepare something useful, or join people already doing good work. Faithful service is often quiet, consistent, and shaped by respect for the people receiving it.',
        ),
      ],
      tags: [{ name: 'Service' }, { name: 'Generosity' }],
      bibleReferences: [{ reference: '1 Peter 4:10' }],
      featured: false,
      seo: reviewSeo(
        'Serving with What You Have | Review Seed',
        'Review-only article seed about practical service and everyday generosity.',
      ),
      categorySlug: 'faith-in-practice',
    },
  },
] as const;

export const launchEvents: readonly LaunchCollectionEntry[] = [
  {
    slug: 'review-coffee-and-community-night',
    image: 'coffeeMeetup',
    data: {
      title: `${REVIEW_SEED_PREFIX}Coffee & Community Night`,
      slug: 'review-coffee-and-community-night',
      summary:
        'Review seed based on the supplied 11/09 date and DINO Coffee location. Confirm the year, exact time, venue address, and event contact before publishing.',
      description: [
        paragraph(
          'Review seed — do not publish until every event detail is confirmed. Come meet people from Jerusalem Youth in a relaxed coffee-shop setting with conversation and time to connect.',
        ),
        heading('Before publishing'),
        paragraph(
          'Confirm that 11 September 2026 is the intended date, confirm the provisional 7:00–9:00 PM time, add the exact DINO Coffee address, and provide a current contact or registration link if needed.',
        ),
      ],
      startDateTime: '2026-09-11T19:00:00+07:00',
      endDateTime: '2026-09-11T21:00:00+07:00',
      locationName: 'DINO Coffee',
      featured: true,
      seo: reviewSeo(
        'Coffee & Community Night | Review Seed',
        'Review-only event seed. Date, time, address, and contact require confirmation.',
      ),
    },
  },
] as const;

export const launchSermons: readonly LaunchCollectionEntry[] = [
  {
    slug: 'review-loved-before-we-perform',
    image: 'worshipGathering',
    data: {
      title: `${REVIEW_SEED_PREFIX}Loved Before We Perform`,
      slug: 'review-loved-before-we-perform',
      speaker: 'Review Speaker',
      date: '2026-08-30',
      summary:
        'Review seed: an outline about receiving God’s love before trying to prove our worth. Replace with an actual sermon record and working media URL.',
      videoURL: 'https://example.com/review-only/sermons/loved-before-we-perform',
      biblePassage: 'Ephesians 2:8–10',
      seo: reviewSeo(
        'Loved Before We Perform | Review Seed',
        'Review-only sermon seed; replace the speaker, date, summary, and media URL.',
      ),
      seriesSlug: 'foundations-for-everyday-faith',
    },
  },
  {
    slug: 'review-courage-for-the-next-step',
    image: 'worshipGathering',
    data: {
      title: `${REVIEW_SEED_PREFIX}Courage for the Next Step`,
      slug: 'review-courage-for-the-next-step',
      speaker: 'Review Speaker',
      date: '2026-08-23',
      summary:
        'Review seed: an outline about trusting God with the next faithful step when the whole path is not visible.',
      videoURL: 'https://example.com/review-only/sermons/courage-for-the-next-step',
      biblePassage: 'Joshua 1:9',
      seo: reviewSeo(
        'Courage for the Next Step | Review Seed',
        'Review-only sermon seed; replace the speaker, date, summary, and media URL.',
      ),
      seriesSlug: 'foundations-for-everyday-faith',
    },
  },
  {
    slug: 'review-prayer-in-real-life',
    image: 'worshipGathering',
    data: {
      title: `${REVIEW_SEED_PREFIX}Prayer in Real Life`,
      slug: 'review-prayer-in-real-life',
      speaker: 'Review Speaker',
      date: '2026-08-16',
      summary:
        'Review seed: an outline about bringing honest prayer into busy, uncertain, and ordinary moments.',
      videoURL: 'https://example.com/review-only/sermons/prayer-in-real-life',
      biblePassage: 'Philippians 4:6–7',
      seo: reviewSeo(
        'Prayer in Real Life | Review Seed',
        'Review-only sermon seed; replace the speaker, date, summary, and media URL.',
      ),
      seriesSlug: 'foundations-for-everyday-faith',
    },
  },
  {
    slug: 'review-built-for-community',
    image: 'worshipGathering',
    data: {
      title: `${REVIEW_SEED_PREFIX}Built for Community`,
      slug: 'review-built-for-community',
      speaker: 'Review Speaker',
      date: '2026-08-09',
      summary:
        'Review seed: an outline about belonging, encouragement, and the habits that help a community become healthy.',
      videoURL: 'https://example.com/review-only/sermons/built-for-community',
      biblePassage: 'Acts 2:42–47',
      seo: reviewSeo(
        'Built for Community | Review Seed',
        'Review-only sermon seed; replace the speaker, date, summary, and media URL.',
      ),
      seriesSlug: 'foundations-for-everyday-faith',
    },
  },
  {
    slug: 'review-faith-that-serves',
    image: 'worshipGathering',
    data: {
      title: `${REVIEW_SEED_PREFIX}Faith That Serves`,
      slug: 'review-faith-that-serves',
      speaker: 'Review Speaker',
      date: '2026-08-02',
      summary:
        'Review seed: an outline about turning compassion into humble, practical service in everyday life.',
      videoURL: 'https://example.com/review-only/sermons/faith-that-serves',
      biblePassage: 'Mark 10:45',
      seo: reviewSeo(
        'Faith That Serves | Review Seed',
        'Review-only sermon seed; replace the speaker, date, summary, and media URL.',
      ),
      seriesSlug: 'foundations-for-everyday-faith',
    },
  },
] as const;

export const launchStories: readonly LaunchCollectionEntry[] = [
  {
    slug: 'review-finding-a-place-to-belong',
    image: 'communityGathering',
    data: {
      title: `${REVIEW_SEED_PREFIX}Finding a Place to Belong`,
      slug: 'review-finding-a-place-to-belong',
      summary:
        'Review seed: a fictional composite story showing how a first visit can grow into genuine community.',
      body: [
        paragraph(
          'Review seed — this is fictional composite content, not a real testimony. Replace it with an approved story and documented consent before publishing.',
        ),
        paragraph(
          'The sample story follows a newcomer who arrives unsure, is welcomed into a small conversation, and gradually finds people willing to listen, pray, and walk through ordinary life together.',
        ),
      ],
      personDisplayName: 'Review Contributor',
      featured: true,
      seo: reviewSeo(
        'Finding a Place to Belong | Review Seed',
        'Fictional review-only story seed. Replace with an approved testimony and consent record.',
      ),
    },
  },
  {
    slug: 'review-learning-to-ask-for-help',
    image: 'coffeeMeetup',
    data: {
      title: `${REVIEW_SEED_PREFIX}Learning to Ask for Help`,
      slug: 'review-learning-to-ask-for-help',
      summary:
        'Review seed: a fictional composite story about receiving support during a difficult season.',
      body: [
        paragraph(
          'Review seed — this is fictional composite content, not a real testimony. Replace it with an approved story and documented consent before publishing.',
        ),
        paragraph(
          'The sample story describes someone choosing to speak honestly with trusted friends and discovering that asking for help can be a step of courage rather than weakness.',
        ),
      ],
      personDisplayName: 'Review Contributor',
      featured: false,
      seo: reviewSeo(
        'Learning to Ask for Help | Review Seed',
        'Fictional review-only story seed. Replace with an approved testimony and consent record.',
      ),
    },
  },
  {
    slug: 'review-small-acts-that-became-service',
    image: 'carePackages',
    data: {
      title: `${REVIEW_SEED_PREFIX}Small Acts That Became Service`,
      slug: 'review-small-acts-that-became-service',
      summary:
        'Review seed: a fictional composite story about a group learning to serve by listening first.',
      body: [
        paragraph(
          'Review seed — this is fictional composite content, not a real testimony. Replace it with an approved story and documented consent before publishing.',
        ),
        paragraph(
          'The sample story follows friends who begin with a practical neighborhood need, ask what would be useful, and build a steady habit of serving together.',
        ),
      ],
      personDisplayName: 'Review Contributor',
      featured: false,
      seo: reviewSeo(
        'Small Acts That Became Service | Review Seed',
        'Fictional review-only story seed. Replace with an approved testimony and consent record.',
      ),
    },
  },
] as const;

export const launchResources: readonly LaunchCollectionEntry[] = [
  {
    slug: 'review-personal-devotional-starter',
    image: 'bibleJournal',
    data: {
      title: `${REVIEW_SEED_PREFIX}Personal Devotional Starter`,
      slug: 'review-personal-devotional-starter',
      description:
        'Review seed resource entry. Replace this description and the example URL with an approved devotional resource.',
      externalURL:
        'https://example.com/review-only/resources/personal-devotional-starter',
      seo: reviewSeo(
        'Personal Devotional Starter | Review Seed',
        'Review-only resource seed; replace the description and external URL.',
      ),
      categorySlug: 'resources',
    },
  },
  {
    slug: 'review-small-group-conversation-guide',
    image: 'communityGathering',
    data: {
      title: `${REVIEW_SEED_PREFIX}Small Group Conversation Guide`,
      slug: 'review-small-group-conversation-guide',
      description:
        'Review seed resource entry. Replace this description and the example URL with an approved small-group guide.',
      externalURL:
        'https://example.com/review-only/resources/small-group-conversation-guide',
      seo: reviewSeo(
        'Small Group Conversation Guide | Review Seed',
        'Review-only resource seed; replace the description and external URL.',
      ),
      categorySlug: 'resources',
    },
  },
  {
    slug: 'review-prayer-journal-prompts',
    image: 'bibleJournal',
    data: {
      title: `${REVIEW_SEED_PREFIX}Prayer Journal Prompts`,
      slug: 'review-prayer-journal-prompts',
      description:
        'Review seed resource entry. Replace this description and the example URL with approved prayer-journal prompts.',
      externalURL:
        'https://example.com/review-only/resources/prayer-journal-prompts',
      seo: reviewSeo(
        'Prayer Journal Prompts | Review Seed',
        'Review-only resource seed; replace the description and external URL.',
      ),
      categorySlug: 'resources',
    },
  },
  {
    slug: 'review-practical-service-planner',
    image: 'carePackages',
    data: {
      title: `${REVIEW_SEED_PREFIX}Practical Service Planner`,
      slug: 'review-practical-service-planner',
      description:
        'Review seed resource entry. Replace this description and the example URL with an approved service-planning resource.',
      externalURL:
        'https://example.com/review-only/resources/practical-service-planner',
      seo: reviewSeo(
        'Practical Service Planner | Review Seed',
        'Review-only resource seed; replace the description and external URL.',
      ),
      categorySlug: 'resources',
    },
  },
] as const;

export const launchSeedCounts = {
  articles: launchArticles.length,
  events: launchEvents.length,
  resources: launchResources.length,
  sermons: launchSermons.length,
  stories: launchStories.length,
} as const;

export const assertLaunchSeedSafety = ({
  confirmed,
  environment,
}: {
  confirmed: boolean;
  environment?: string;
}) => {
  if (!confirmed) {
    throw new Error(
      `Launch review seed not confirmed. Re-run with ${LAUNCH_SEED_CONFIRMATION}.`,
    );
  }

  if (environment === 'production') {
    throw new Error(
      'The review seed is blocked in NODE_ENV=production. Review and approve it in a non-production CMS first.',
    );
  }
};
