import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports:[CommonModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  name = signal('Mohammed Suhail');

  images = signal([
    'assets/images/Mypicture.jpg',
    'assets/images/image.jpg',
    'assets/images/software-engineer.jpg'
  ]);

  quotes = signal([
    'Code is like humor. When you have to explain it, it’s bad.',
    'First, solve the problem. Then, write the code.',
    'Clean code always looks like it was written by someone who cares.'
  ]);

  skills = signal([
    { id: 1, label: 'Angular' },
    { id: 2, label: 'Tailwind CSS' },
    { id: 3, label: 'RxJS' },
    { id: 4, label: 'Signals' },
    { id: 5, label: 'Standalone Components' }
  ]);

  currentIndex = signal(0);

  getCurrentImage(): string {
    return this.images()[this.currentIndex()];
  }

  getCurrentQuote(): string {
    return this.quotes()[this.currentIndex()];
  }

  prevImage(): void {
    const total = this.images().length;
    this.currentIndex.set((this.currentIndex() - 1 + total) % total);
  }

  nextImage(): void {
    const total = this.images().length;
    this.currentIndex.set((this.currentIndex() + 1) % total);
  }

  ngOnInit(): void {
    setInterval(() => {
      this.nextImage();
    }, 5000);
  }
}
