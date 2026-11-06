import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-bread-crumbs',
  imports: [CommonModule, RouterLink],
  templateUrl: './bread-crumbs.html',
  styleUrl: './bread-crumbs.scss',
})
export class BreadCrumbs {
  environment = environment
  constructor() { }

  @Input() title = '';
  @Input() url = '';
  @Input() parentsTitle = ''
  ngOnInit(): void {
  
  }


}
