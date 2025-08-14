import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../../../../../shared/components/sidenav/sidenav.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-container',
  templateUrl: './home-container.component.html',
  styleUrls: ['./home-container.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
})
export class HomeContainerComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  navigateToFamilies() {
    this.router.navigate(['/families']);
  }
}
