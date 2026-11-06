import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment-failed',
  imports: [RouterLink],
  templateUrl: './payment-failed.html',
  styleUrl: '../payment-success/payment-success.scss', // same design as the success page
})
export class PaymentFailed implements OnInit {
  readonly environment = environment;

  ngOnInit(): void {
    document.title = 'Payment Failed - fundsforNGOs Premium';
    window.scrollTo(0, 0);
  }
}