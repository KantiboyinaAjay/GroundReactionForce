import { Component , OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  userName:any;

  constructor(private auth: AuthService){}
  ngOnInit(): void {
    if(this.auth.isLocalStorageAvailable())
    {
      this.userName = localStorage.getItem('name')
    }
  }
}