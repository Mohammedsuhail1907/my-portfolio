import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  public onSubmit() {
    if (this.contactForm.invalid) {
      console.log(this.contactForm.value);
      
      alert('Please fill all fields correctly.');
      return;
    }

    const templateParams = {
      from_name: this.contactForm.value.name,
      from_email: this.contactForm.value.email,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message
    };

    emailjs.send('service_0gx117g', 'template_f57gqeh', templateParams, 'BQIBYDNChOJl8S1dX')
      .then((response: EmailJSResponseStatus) => {
         console.log('SUCCESS!', response.status, response.text);
         alert('Message Sent Successfully!');
         this.contactForm.reset();
      }, (err) => {
         console.error('FAILED...', err);
         alert('Failed to Send Message.');
      });
  }
}
