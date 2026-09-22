import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { SITE } from '../../config/site.config';
import { RevealDirective } from '../../directives/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

type ContactField = 'name' | 'email' | 'subject' | 'message';

/**
 * Contact section: direct contact methods, social links and the EmailJS-backed message form.
 * Submission feedback is shown through the root <p-toast> via MessageService.
 */
@Component({
  selector: 'app-contact',
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    MessageModule,
    SectionHeadingComponent,
    RevealDirective,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly messageService = inject(MessageService);

  protected readonly site = SITE;
  protected readonly sending = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  /** True once a field is invalid and the visitor has interacted with it (or tried to submit). */
  protected isInvalid(field: ContactField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  protected hasError(field: ContactField, error: string): boolean {
    return this.form.controls[field].hasError(error);
  }

  protected async submit(): Promise<void> {
    if (this.sending()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const { name, email, subject, message } = this.form.getRawValue();
    const templateParams = { from_name: name, from_email: email, subject, message };

    this.sending.set(true);
    try {
      await emailjs.send(SITE.emailjs.serviceId, SITE.emailjs.templateId, templateParams, {
        publicKey: SITE.emailjs.publicKey,
      });
      this.messageService.add({
        severity: 'success',
        summary: 'Message sent',
        detail: "Thanks — I'll get back to you soon.",
      });
      this.form.reset();
    } catch (error) {
      console.error('FAILED...', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Message not sent',
        detail: 'Something went wrong. Please try again or email me directly.',
      });
    } finally {
      this.sending.set(false);
    }
  }

  private focusFirstInvalid(): void {
    this.host.nativeElement
      .querySelector<HTMLElement>('form .ng-invalid[formControlName]')
      ?.focus();
  }
}
