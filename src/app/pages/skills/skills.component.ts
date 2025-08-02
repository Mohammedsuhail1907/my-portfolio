import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Skill {
  name: string;
  level: number;
  category: string;
}

interface Technology {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  frontendSkills: Skill[] = [
    { name: 'Angular', level: 95, category: 'frontend' },
   // { name: 'React', level: 90, category: 'frontend' },
    { name: 'TypeScript', level: 90, category: 'frontend' },
    { name: 'JavaScript', level: 95, category: 'frontend' },
    { name: 'HTML5/CSS3', level: 90, category: 'frontend' },
    { name: 'BootStrap', level: 85, category: 'frontend' }
  ];
  
  backendSkills: Skill[] = [
    { name: 'Node.js', level: 88, category: 'backend' },
    { name: 'Java', level: 50, category: 'backend' },
    //{ name: 'MongoDB', level: 80, category: 'backend' },
    { name: 'SQL', level: 85, category: 'backend' },
    // { name: 'REST APIs', level: 90, category: 'backend' },
    // { name: 'GraphQL', level: 70, category: 'backend' }
  ];
  
  toolsSkills: Skill[] = [
    { name: 'Git', level: 92, category: 'tools' },
    { name: 'Git Hub', level: 90, category: 'tools' },
     { name: 'Postman', level: 75, category: 'tools' },
    // { name: 'AWS', level: 70, category: 'tools' },
    // { name: 'Figma', level: 85, category: 'tools' },
    // { name: 'Jest', level: 80, category: 'tools' },
    //{ name: 'Webpack', level: 75, category: 'tools' }
  ];
  
  // technologies: Technology[] = [
  //   { name: 'Angular', icon: '🅰️' },
  //  // { name: 'React', icon: '⚛️' },
  //   { name: 'Node.js', icon: '🟢' },
  //   { name: 'TypeScript', icon: '🔷' },
  //   //{ name: 'MongoDB', icon: '🍃' },
  //   //{ name: 'Docker', icon: '🐳' },
  //   //{ name: 'AWS', icon: '☁️' },
  //   { name: 'Git', icon: '📁' },
  //   //{ name: 'Figma', icon: '🎨' }
  // ];

  technologies: Technology[] = [
    { name: 'Angular', icon: '🅰️' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'TypeScript', icon: '🔷' },
    { name: 'JavaScript', icon: '✨' },
    { name: 'Java', icon: '☕' },
    { name: 'SQL', icon: '🗄️' },
    { name: 'Git', icon: '📁' },
    { name: 'GitHub', icon: '🐙' },
    { name: 'Postman', icon: '📬' },
  ];
  
}