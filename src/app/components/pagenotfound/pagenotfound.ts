import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagenotfound',
  imports: [],
  templateUrl: './pagenotfound.html',
  styleUrl: './pagenotfound.scss',
})
export class Pagenotfound {

   constructor(
    private router: Router,
  
  ) { }

  ngOnInit(): void {

    this.router.navigate(["/app"])
  }
}
