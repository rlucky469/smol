import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-credits',
  imports: [RouterLink],
  templateUrl: './no-credits.html',
  styleUrl: './no-credits.scss',
})
export class NoCredits {
  title = input("You're out of credits");
  message = input('Add credits to continue using AI features.');
  compact = input(false);
}
