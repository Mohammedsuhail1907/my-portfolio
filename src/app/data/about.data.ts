/** About section content (moved verbatim from the original template). */
export interface Stat {
  value: string;
  label: string;
}

export interface Service {
  title: string;
  description: string;
  /** PrimeIcons class. */
  icon: string;
}

export const ABOUT_INTRO = {
  lead: "I'm a passionate full-stack developer with over 2 years of experience creating digital solutions that make a difference.",
  paragraphs: [
    "My journey in web development started with a curiosity about how things work on the internet. Since then, I've evolved into a developer who loves creating efficient, scalable, and user-friendly applications.",
    "I specialize in modern JavaScript frameworks, particularly Angular, along with .NET for backend development. I'm always eager to learn new technologies and stay updated with the latest industry trends.",
  ],
};

export const STATS: Stat[] = [
  { value: '5+', label: 'Projects Completed' },
  { value: '2+', label: 'Years Experience' },
];

export const SERVICES: Service[] = [
  {
    title: 'Web Development',
    description: 'Building responsive, fast, and scalable web applications using modern technologies.',
    icon: 'pi pi-code',
  },
  {
    title: 'Mobile Apps',
    description: 'Developing cross-platform mobile applications that work seamlessly across devices.',
    icon: 'pi pi-mobile',
  },
  {
    title: 'Performance',
    description: 'Optimizing applications for speed, efficiency, and excellent user experience.',
    icon: 'pi pi-bolt',
  },
];
