import { Component , OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isDropdownOpen = false;
  username:any = '';
  islogin:boolean = false;

  constructor(private auth: AuthService , private router: Router) {}

  ngOnInit(): void {
    if(this.auth.isLocalStorageAvailable())
    {
      const flag = localStorage.getItem('islogin');
      this.username = localStorage.getItem('name');
      this.islogin = flag === 'true';
    }
  }

  checkLoginStatus() {
    if (this.auth.isLocalStorageAvailable()) {
      const flag = localStorage.getItem('islogin');
      this.username = localStorage.getItem('name');
      this.islogin = flag === 'true';
    }
  }
  
  logout(){
    localStorage.clear();
    this.islogin = false;
    this.router.navigate(['/login']);
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
